# ADS-B Data Simulator

A Python-based ADS-B data simulator that generates realistic aircraft tracking data for testing LEO-based aircraft tracking systems. This simulator produces continuous ADS-B messages mimicking real aircraft broadcasts to feed downstream components like data ingestion services, tracking engines, and visualization dashboards.

## Features

- **Realistic Aircraft Simulation**: Simulates 50-1000+ aircraft with realistic flight dynamics
- **ADS-B Message Generation**: Produces complete ADS-B messages with all required fields
- **Kafka Integration**: Publishes messages to Apache Kafka for real-time streaming
- **Edge Case Scenarios**: Includes emergency squawks and separation conflicts
- **Configurable Parameters**: YAML-based configuration for all simulation parameters
- **Performance Monitoring**: Built-in logging and performance metrics
- **Scalable Architecture**: Supports high-throughput message generation

## Requirements

- Python 3.10+
- Apache Kafka (local or remote)
- Required Python packages (see requirements.txt)

## Quick Start

### 1. Installation

```bash
# Clone or create the simulator directory
mkdir adsb-simulator && cd adsb-simulator

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Kafka (Local Development)

Using Docker Compose:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
EOF

# Start Kafka
docker-compose up -d
```

### 3. Run the Simulator

```bash
# Run with default configuration
python adsb_simulator.py

# Run with custom configuration
python adsb_simulator.py --config custom_config.yaml

# Run with debug logging
python adsb_simulator.py --log-level DEBUG
```

### 4. Verify Output

Check Kafka topic for messages:

```bash
# Using kafka-console-consumer (if installed locally)
kafka-console-consumer --bootstrap-server localhost:9092 --topic adsb_messages --from-beginning

# Or using kafkacat
kafkacat -b localhost:9092 -t adsb_messages -C
```

## Configuration

The simulator is configured via `config.yaml`. Key parameters:

```yaml
simulation:
  num_aircraft: 75                    # Number of aircraft to simulate
  message_interval_min: 1             # Minimum message interval (seconds)
  message_interval_max: 5             # Maximum message interval (seconds)
  emergency_frequency: 0.001          # Emergency scenario probability
  separation_frequency: 0.002         # Separation conflict probability

kafka:
  bootstrap_servers: "localhost:9092" # Kafka broker address
  topic: "adsb_messages"              # Kafka topic name

aircraft_types:
  jet_ratio: 0.7                      # Ratio of jets to props (70% jets)
```

## Sample ADS-B Message

```json
{
  "icao_address": "4B7F6A",
  "callsign": "UAL1234",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 35000,
  "ground_speed": 450,
  "heading": 270,
  "timestamp": "2025-01-15T20:09:00Z",
  "squawk": "1200",
  "aircraft_type": "jet"
}
```

## Aircraft Simulation

### Flight Dynamics

- **Jets**: Cruise at 25,000-42,000 ft, 400-550 knots
- **Props**: Cruise at 8,000-18,000 ft, 150-220 knots
- **Realistic Turns**: Maximum 3°/second turn rate
- **Climb/Descent**: Realistic vertical speeds (500-3000 ft/min)
- **Great Circle Routes**: Uses geodesic calculations for realistic navigation

### Edge Cases

- **Emergency Squawks**: 7500 (hijack), 7600 (comm failure), 7700 (general emergency)
- **Separation Conflicts**: Detected when aircraft are within 5 NM horizontally and 1000 ft vertically
- **Random Variations**: Simulates turbulence and real-world flight conditions

## Performance

- **Throughput**: Supports 100+ messages/second with <100ms latency
- **Scalability**: Tested with up to 1000 concurrent aircraft
- **Reliability**: Designed for 24+ hour continuous operation
- **Memory Efficient**: Optimized for long-running simulations

## Monitoring and Logging

The simulator provides comprehensive logging and metrics:

```
2025-01-15 20:09:00 - INFO - Stats - Aircraft: 75, Messages/sec: 25.3, Total messages: 1520, Emergencies: 1, Conflicts: 0, Uptime: 60s
```

Log files are written to `adsb_simulator.log` with rotation.

## Testing

### Unit Tests

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=adsb_simulator tests/
```

### Integration Tests

```bash
# Test Kafka integration (requires running Kafka)
pytest tests/test_kafka_integration.py
```

### Performance Testing

```bash
# Stress test with 500 aircraft
python adsb_simulator.py --config stress_test_config.yaml
```

## Docker Deployment

### Build Image

```bash
# Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "adsb_simulator.py"]
EOF

# Build image
docker build -t adsb-simulator .
```

### Run Container

```bash
# Run simulator in container
docker run -d \
  --name adsb-simulator \
  --network host \
  -v $(pwd)/config.yaml:/app/config.yaml \
  adsb-simulator
```

## Integration with Downstream Systems

### Data Ingestion Service

The simulator publishes to Kafka topic `adsb_messages` in JSON format, ready for consumption by data ingestion services.

### API Integration

Messages include all fields required for downstream processing:

- Position tracking
- Speed/altitude monitoring
- Emergency detection
- Conflict analysis

### Dashboard Visualization

JSON format is compatible with web dashboards and visualization tools like CesiumJS, Leaflet, or custom React components.

## Advanced Configuration

### Custom Aircraft Routes

Define realistic flight paths by specifying airport pairs:

```yaml
airport_pairs:
  transatlantic:
    - ["JFK", "LHR"]
    - ["LAX", "CDG"]
  domestic_us:
    - ["JFK", "LAX"]
    - ["ORD", "DFW"]
```

### Performance Tuning

For high-throughput scenarios:

```yaml
performance:
  update_rate: 20           # Higher update rate
  max_message_rate: 2.0     # More frequent messages

kafka:
  producer:
    batch_size: 32768       # Larger batches
    linger_ms: 5            # Lower latency
```

## Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   ```bash
   # Check Kafka is running
   docker-compose ps
   
   # Check connectivity
   telnet localhost 9092
   ```

2. **High CPU Usage**
   - Reduce `num_aircraft` in config
   - Increase `message_interval_min`
   - Lower `update_rate`

3. **Memory Issues**
   - Enable garbage collection logging
   - Monitor with `htop` or `psutil`
   - Consider aircraft lifecycle management

### Debug Mode

```bash
# Enable debug logging
python adsb_simulator.py --log-level DEBUG

# Monitor Kafka consumer lag
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group test-consumer
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Setup

```bash
# Install development dependencies
pip install -r requirements.txt

# Run code formatting
black adsb_simulator.py

# Run linting
flake8 adsb_simulator.py

# Run type checking
mypy adsb_simulator.py
```

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For questions, issues, or feature requests:

1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include configuration and log files
4. Specify Python and Kafka versions

## Roadmap

- [ ] WebSocket support for real-time browser integration
- [ ] PostgreSQL/TimescaleDB integration
- [ ] Grafana dashboard templates
- [ ] Multi-region simulation support
- [ ] Enhanced weather simulation
- [ ] Machine learning-based flight patterns
- [ ] REST API for simulation control
- [ ] Kubernetes deployment manifests

---

**Note**: This simulator is for testing and development purposes. It generates synthetic data and should not be used with real air traffic control systems.