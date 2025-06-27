#!/usr/bin/env python3
"""
ADS-B Data Simulator
Generates realistic aircraft tracking data for testing LEO-based aircraft tracking systems.
"""

import json
import time
import logging
import argparse
import signal
import sys
from datetime import datetime, timezone
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor
import yaml
import random
import math
from faker import Faker
from geopy.distance import geodesic
from geopy import Point
from confluent_kafka import Producer
from confluent_kafka.admin import AdminClient, NewTopic

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('adsb_simulator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ADSBMessage:
    """Represents an ADS-B message from an aircraft"""
    icao_address: str
    callsign: str
    latitude: float
    longitude: float
    altitude: int
    ground_speed: int
    heading: int
    timestamp: str
    squawk: str = "1200"
    aircraft_type: str = "jet"
    
    def to_json(self) -> str:
        """Convert to JSON string for Kafka publishing"""
        return json.dumps(asdict(self))

@dataclass
class Waypoint:
    """Represents a navigation waypoint"""
    latitude: float
    longitude: float
    name: str = ""

class Aircraft:
    """Simulates a single aircraft with realistic flight dynamics"""
    
    def __init__(self, icao_address: str, aircraft_type: str = "jet"):
        self.icao_address = icao_address
        self.aircraft_type = aircraft_type
        self.faker = Faker()
        
        # Generate realistic callsign
        airlines = ["UAL", "DAL", "AAL", "SWA", "JBU", "DL", "AA", "UA", "WN", "B6"]
        self.callsign = f"{random.choice(airlines)}{random.randint(1000, 9999)}"
        
        # Initialize position and flight characteristics
        self._initialize_flight_parameters()
        
        # Flight plan
        self.waypoints: List[Waypoint] = []
        self.current_waypoint_index = 0
        
        # Emergency and conflict states
        self.emergency_state = False
        self.conflict_state = False
        self.squawk = "1200"
        
        # Performance tracking
        self.last_update = time.time()
        
    def _initialize_flight_parameters(self):
        """Initialize realistic flight parameters based on aircraft type"""
        # Random global position (avoiding poles and extreme latitudes)
        self.latitude = random.uniform(-60, 60)
        self.longitude = random.uniform(-180, 180)
        
        if self.aircraft_type == "jet":
            self.altitude = random.randint(25000, 42000)  # Typical jet cruise altitude
            self.ground_speed = random.randint(400, 550)  # Typical jet cruise speed
            self.max_speed = 600
            self.min_speed = 200
            self.climb_rate = random.uniform(1500, 3000)  # ft/min
        else:  # prop aircraft
            self.altitude = random.randint(8000, 18000)   # Typical prop cruise altitude
            self.ground_speed = random.randint(150, 220)  # Typical prop cruise speed
            self.max_speed = 250
            self.min_speed = 80
            self.climb_rate = random.uniform(500, 1200)   # ft/min
        
        self.heading = random.randint(0, 359)
        self.target_altitude = self.altitude
        self.target_speed = self.ground_speed
        self.target_heading = self.heading
        
        # Generate realistic flight plan
        self._generate_flight_plan()
    
    def _generate_flight_plan(self):
        """Generate a realistic flight plan with waypoints"""
        # Create a simple flight plan with 3-5 waypoints
        num_waypoints = random.randint(3, 5)
        
        current_lat, current_lon = self.latitude, self.longitude
        
        for i in range(num_waypoints):
            # Generate waypoint roughly 100-300 nm away
            distance_km = random.uniform(185, 555)  # 100-300 nm in km
            bearing = random.uniform(0, 360)
            
            # Calculate new position using geodesic
            origin = Point(current_lat, current_lon)
            destination = geodesic(kilometers=distance_km).destination(origin, bearing)
            
            waypoint = Waypoint(
                latitude=destination.latitude,
                longitude=destination.longitude,
                name=f"WPT{i+1}"
            )
            self.waypoints.append(waypoint)
            
            current_lat, current_lon = destination.latitude, destination.longitude
    
    def update_position(self, delta_time: float):
        """Update aircraft position based on realistic flight dynamics"""
        if not self.waypoints:
            return
        
        # Get current target waypoint
        if self.current_waypoint_index < len(self.waypoints):
            target = self.waypoints[self.current_waypoint_index]
            
            # Calculate bearing and distance to target
            current_pos = Point(self.latitude, self.longitude)
            target_pos = Point(target.latitude, target.longitude)
            
            distance_to_target = geodesic(current_pos, target_pos).kilometers
            bearing_to_target = self._calculate_bearing(current_pos, target_pos)
            
            # Update target heading
            self.target_heading = bearing_to_target
            
            # Check if we've reached the waypoint (within 5 km)
            if distance_to_target < 5:
                self.current_waypoint_index += 1
                if self.current_waypoint_index >= len(self.waypoints):
                    # Generate new flight plan
                    self.waypoints.clear()
                    self.current_waypoint_index = 0
                    self._generate_flight_plan()
        
        # Update heading gradually (realistic turn rate)
        max_turn_rate = 3.0  # degrees per second
        heading_diff = self._normalize_heading_difference(self.target_heading - self.heading)
        
        if abs(heading_diff) > max_turn_rate * delta_time:
            turn_direction = 1 if heading_diff > 0 else -1
            self.heading += turn_direction * max_turn_rate * delta_time
        else:
            self.heading = self.target_heading
        
        self.heading = self.heading % 360
        
        # Update speed and altitude with realistic changes
        self._update_speed(delta_time)
        self._update_altitude(delta_time)
        
        # Calculate new position
        distance_km = (self.ground_speed * 1.852) * (delta_time / 3600)  # Convert knots to km/h
        
        if distance_km > 0:
            current_pos = Point(self.latitude, self.longitude)
            new_pos = geodesic(kilometers=distance_km).destination(current_pos, self.heading)
            self.latitude = new_pos.latitude
            self.longitude = new_pos.longitude
        
        # Add small random variations for realism
        self._add_realistic_variations()
    
    def _update_speed(self, delta_time: float):
        """Update ground speed with realistic acceleration"""
        max_acceleration = 2.0  # knots per second
        speed_diff = self.target_speed - self.ground_speed
        
        if abs(speed_diff) > max_acceleration * delta_time:
            acceleration_direction = 1 if speed_diff > 0 else -1
            self.ground_speed += acceleration_direction * max_acceleration * delta_time
        else:
            self.ground_speed = self.target_speed
        
        # Keep within realistic bounds
        self.ground_speed = max(self.min_speed, min(self.max_speed, self.ground_speed))
    
    def _update_altitude(self, delta_time: float):
        """Update altitude with realistic climb/descent rates"""
        altitude_diff = self.target_altitude - self.altitude
        max_climb_rate_per_sec = self.climb_rate / 60  # Convert ft/min to ft/sec
        
        if abs(altitude_diff) > max_climb_rate_per_sec * delta_time:
            climb_direction = 1 if altitude_diff > 0 else -1
            self.altitude += climb_direction * max_climb_rate_per_sec * delta_time
        else:
            self.altitude = self.target_altitude
        
        # Keep within realistic bounds
        self.altitude = max(1000, min(60000, self.altitude))
    
    def _add_realistic_variations(self):
        """Add small random variations to simulate real-world conditions"""
        # Small heading variations (turbulence, wind)
        self.heading += random.uniform(-0.5, 0.5)
        self.heading = self.heading % 360
        
        # Small speed variations
        self.ground_speed += random.uniform(-2, 2)
        self.ground_speed = max(self.min_speed, min(self.max_speed, self.ground_speed))
        
        # Small altitude variations
        self.altitude += random.uniform(-50, 50)
        self.altitude = max(1000, min(60000, self.altitude))
    
    def _calculate_bearing(self, point1: Point, point2: Point) -> float:
        """Calculate bearing from point1 to point2"""
        lat1, lon1 = math.radians(point1.latitude), math.radians(point1.longitude)
        lat2, lon2 = math.radians(point2.latitude), math.radians(point2.longitude)
        
        dlon = lon2 - lon1
        
        y = math.sin(dlon) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
        
        bearing = math.atan2(y, x)
        bearing = math.degrees(bearing)
        bearing = (bearing + 360) % 360
        
        return bearing
    
    def _normalize_heading_difference(self, diff: float) -> float:
        """Normalize heading difference to [-180, 180] range"""
        while diff > 180:
            diff -= 360
        while diff < -180:
            diff += 360
        return diff
    
    def trigger_emergency(self, emergency_type: str = "general"):
        """Trigger emergency scenario"""
        self.emergency_state = True
        emergency_squawks = {
            "hijack": "7500",
            "communication": "7600",
            "general": "7700"
        }
        self.squawk = emergency_squawks.get(emergency_type, "7700")
        logger.warning(f"Emergency triggered for {self.callsign}: {emergency_type}")
    
    def clear_emergency(self):
        """Clear emergency state"""
        self.emergency_state = False
        self.squawk = "1200"
    
    def set_conflict_state(self, in_conflict: bool):
        """Set separation conflict state"""
        self.conflict_state = in_conflict
    
    def generate_message(self) -> ADSBMessage:
        """Generate current ADS-B message"""
        return ADSBMessage(
            icao_address=self.icao_address,
            callsign=self.callsign,
            latitude=round(self.latitude, 6),
            longitude=round(self.longitude, 6),
            altitude=int(self.altitude),
            ground_speed=int(self.ground_speed),
            heading=int(self.heading) % 360,
            timestamp=datetime.now(timezone.utc).isoformat(),
            squawk=self.squawk,
            aircraft_type=self.aircraft_type
        )

class ADSBSimulator:
    """Main ADS-B Data Simulator"""
    
    def __init__(self, config_path: str):
        self.config = self._load_config(config_path)
        self.aircraft: List[Aircraft] = []
        self.kafka_producer: Optional[Producer] = None
        self.running = False
        
        # Performance metrics
        self.messages_sent = 0
        self.start_time = time.time()
        self.last_stats_time = time.time()
        
        # Setup Kafka
        self._setup_kafka()
        
        # Generate aircraft fleet
        self._generate_aircraft_fleet()
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Configuration loaded from {config_path}")
            return config
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            # Return default configuration
            return {
                'simulation': {
                    'num_aircraft': 75,
                    'message_interval_min': 1,
                    'message_interval_max': 5,
                    'emergency_frequency': 0.001,
                    'separation_frequency': 0.002
                },
                'kafka': {
                    'bootstrap_servers': 'localhost:9092',
                    'topic': 'adsb_messages'
                },
                'aircraft_types': {
                    'jet_ratio': 0.7
                }
            }
    
    def _setup_kafka(self):
        """Setup Kafka producer and create topic if needed"""
        try:
            kafka_config = {
                'bootstrap.servers': self.config['kafka']['bootstrap_servers'],
                'client.id': 'adsb-simulator',
                'acks': 'all',
                'retries': 3,
                'batch.size': 16384,
                'linger.ms': 10,
                'buffer.memory': 33554432
            }
            
            self.kafka_producer = Producer(kafka_config)
            
            # Create topic if it doesn't exist
            admin_client = AdminClient({'bootstrap.servers': self.config['kafka']['bootstrap_servers']})
            topic_name = self.config['kafka']['topic']
            
            topic = NewTopic(topic_name, num_partitions=3, replication_factor=1)
            fs = admin_client.create_topics([topic])
            
            # Wait for topic creation
            for topic, f in fs.items():
                try:
                    f.result()  # The result itself is None
                    logger.info(f"Topic {topic} created successfully")
                except Exception as e:
                    if "already exists" in str(e):
                        logger.info(f"Topic {topic} already exists")
                    else:
                        logger.error(f"Failed to create topic {topic}: {e}")
            
            logger.info("Kafka producer configured successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup Kafka: {e}")
            self.kafka_producer = None
    
    def _generate_aircraft_fleet(self):
        """Generate fleet of simulated aircraft"""
        num_aircraft = self.config['simulation']['num_aircraft']
        jet_ratio = self.config['aircraft_types']['jet_ratio']
        
        for i in range(num_aircraft):
            # Generate unique ICAO address
            icao_address = f"{random.randint(0, 0xFFFFFF):06X}"
            
            # Determine aircraft type
            aircraft_type = "jet" if random.random() < jet_ratio else "prop"
            
            aircraft = Aircraft(icao_address, aircraft_type)
            self.aircraft.append(aircraft)
        
        logger.info(f"Generated {num_aircraft} aircraft ({int(num_aircraft * jet_ratio)} jets, {num_aircraft - int(num_aircraft * jet_ratio)} props)")
    
    def _check_separation_conflicts(self):
        """Check for separation conflicts between aircraft"""
        conflict_pairs = []
        
        for i, aircraft1 in enumerate(self.aircraft):
            for j, aircraft2 in enumerate(self.aircraft[i+1:], i+1):
                # Calculate horizontal distance
                pos1 = Point(aircraft1.latitude, aircraft1.longitude)
                pos2 = Point(aircraft2.latitude, aircraft2.longitude)
                horizontal_distance = geodesic(pos1, pos2).nautical
                
                # Calculate vertical separation
                vertical_separation = abs(aircraft1.altitude - aircraft2.altitude)
                
                # Check separation minimums (5 NM horizontal, 1000 ft vertical)
                if horizontal_distance < 5 and vertical_separation < 1000:
                    conflict_pairs.append((aircraft1, aircraft2))
        
        # Update conflict states
        for aircraft in self.aircraft:
            aircraft.set_conflict_state(False)
        
        for aircraft1, aircraft2 in conflict_pairs:
            aircraft1.set_conflict_state(True)
            aircraft2.set_conflict_state(True)
            logger.warning(f"Separation conflict: {aircraft1.callsign} and {aircraft2.callsign}")
        
        return len(conflict_pairs)
    
    def _trigger_random_emergencies(self):
        """Randomly trigger emergency scenarios"""
        emergency_freq = self.config['simulation']['emergency_frequency']
        
        for aircraft in self.aircraft:
            if not aircraft.emergency_state and random.random() < emergency_freq:
                emergency_types = ["general", "communication", "hijack"]
                emergency_type = random.choice(emergency_types)
                aircraft.trigger_emergency(emergency_type)
    
    def _publish_message(self, message: ADSBMessage):
        """Publish ADS-B message to Kafka"""
        if not self.kafka_producer:
            return
        
        try:
            topic = self.config['kafka']['topic']
            key = message.icao_address
            value = message.to_json()
            
            self.kafka_producer.produce(
                topic=topic,
                key=key,
                value=value,
                callback=self._delivery_callback
            )
            
            self.messages_sent += 1
            
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
    
    def _delivery_callback(self, err, msg):
        """Kafka delivery callback"""
        if err:
            logger.error(f"Message delivery failed: {err}")
        # Optionally log successful deliveries (can be noisy)
        # else:
        #     logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")
    
    def _log_statistics(self):
        """Log performance statistics"""
        current_time = time.time()
        elapsed = current_time - self.last_stats_time
        
        if elapsed >= 30:  # Log stats every 30 seconds
            uptime = current_time - self.start_time
            messages_per_second = self.messages_sent / uptime if uptime > 0 else 0
            
            # Count emergency and conflict aircraft
            emergency_count = sum(1 for aircraft in self.aircraft if aircraft.emergency_state)
            conflict_count = sum(1 for aircraft in self.aircraft if aircraft.conflict_state)
            
            logger.info(
                f"Stats - Aircraft: {len(self.aircraft)}, "
                f"Messages/sec: {messages_per_second:.1f}, "
                f"Total messages: {self.messages_sent}, "
                f"Emergencies: {emergency_count}, "
                f"Conflicts: {conflict_count}, "
                f"Uptime: {uptime:.0f}s"
            )
            
            self.last_stats_time = current_time
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
        sys.exit(0)
    
    def run(self):
        """Main simulation loop"""
        self.running = True
        logger.info("Starting ADS-B simulation...")
        
        last_update_time = time.time()
        
        try:
            while self.running:
                current_time = time.time()
                delta_time = current_time - last_update_time
                last_update_time = current_time
                
                # Update all aircraft positions
                for aircraft in self.aircraft:
                    aircraft.update_position(delta_time)
                    
                    # Generate and publish message based on interval
                    min_interval = self.config['simulation']['message_interval_min']
                    max_interval = self.config['simulation']['message_interval_max']
                    
                    # Simulate variable message intervals
                    if random.random() < (1.0 / random.uniform(min_interval, max_interval)):
                        message = aircraft.generate_message()
                        self._publish_message(message)
                
                # Check for separation conflicts
                self._check_separation_conflicts()
                
                # Trigger random emergencies
                self._trigger_random_emergencies()
                
                # Flush Kafka producer
                if self.kafka_producer:
                    self.kafka_producer.poll(0)
                
                # Log statistics
                self._log_statistics()
                
                # Sleep to control simulation speed
                time.sleep(0.1)  # 10 Hz update rate
                
        except KeyboardInterrupt:
            logger.info("Simulation interrupted by user")
        except Exception as e:
            logger.error(f"Simulation error: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the simulation"""
        self.running = False
        
        if self.kafka_producer:
            logger.info("Flushing remaining messages...")
            self.kafka_producer.flush(timeout=10)
        
        # Final statistics
        uptime = time.time() - self.start_time
        logger.info(f"Simulation stopped. Total runtime: {uptime:.1f}s, Total messages: {self.messages_sent}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='ADS-B Data Simulator')
    parser.add_argument(
        '--config', 
        type=str, 
        default='config.yaml',
        help='Path to configuration file'
    )
    parser.add_argument(
        '--log-level',
        type=str,
        default='INFO',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        help='Set logging level'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    try:
        simulator = ADSBSimulator(args.config)
        simulator.run()
    except Exception as e:
        logger.error(f"Failed to start simulator: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()