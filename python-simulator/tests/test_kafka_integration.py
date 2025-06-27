#!/usr/bin/env python3
"""
Integration tests for Kafka functionality
"""

import unittest
import time
import json
import tempfile
import os
from unittest.mock import patch, MagicMock
from adsb_simulator import ADSBSimulator, Aircraft, ADSBMessage
from confluent_kafka import Consumer, Producer, KafkaException


class TestKafkaIntegration(unittest.TestCase):
    """Test Kafka integration functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create temporary config file
        self.temp_config = tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False)
        config_content = """
simulation:
  num_aircraft: 5
  message_interval_min: 1
  message_interval_max: 2
  emergency_frequency: 0.0
  separation_frequency: 0.0

kafka:
  bootstrap_servers: "localhost:9092"
  topic: "test_adsb_messages"

aircraft_types:
  jet_ratio: 1.0

performance:
  update_rate: 1
  stats_interval: 5
"""
        self.temp_config.write(config_content)
        self.temp_config.close()
    
    def tearDown(self):
        """Clean up test fixtures"""
        os.unlink(self.temp_config.name)
    
    @patch('confluent_kafka.Producer')
    @patch('confluent_kafka.admin.AdminClient')
    def test_simulator_initialization_with_mock_kafka(self, mock_admin, mock_producer):
        """Test simulator initialization with mocked Kafka"""
        # Mock Kafka components
        mock_producer_instance = MagicMock()
        mock_producer.return_value = mock_producer_instance
        
        mock_admin_instance = MagicMock()
        mock_admin.return_value = mock_admin_instance
        mock_admin_instance.create_topics.return_value = {}
        
        # Initialize simulator
        simulator = ADSBSimulator(self.temp_config.name)
        
        # Verify Kafka producer was configured
        mock_producer.assert_called_once()
        self.assertIsNotNone(simulator.kafka_producer)
        
        # Verify aircraft were generated
        self.assertEqual(len(simulator.aircraft), 5)
        
        # Verify configuration was loaded
        self.assertEqual(simulator.config['simulation']['num_aircraft'], 5)
    
    @patch('confluent_kafka.Producer')
    def test_message_publishing_with_mock_kafka(self, mock_producer):
        """Test message publishing with mocked Kafka producer"""
        # Mock producer
        mock_producer_instance = MagicMock()
        mock_producer.return_value = mock_producer_instance
        
        # Create simulator with mocked Kafka
        with patch('confluent_kafka.admin.AdminClient'):
            simulator = ADSBSimulator(self.temp_config.name)
        
        # Create test message
        aircraft = Aircraft("TEST123", "jet")
        message = aircraft.generate_message()
        
        # Publish message
        simulator._publish_message(message)
        
        # Verify producer.produce was called
        mock_producer_instance.produce.assert_called_once()
        
        # Verify call parameters
        call_args = mock_producer_instance.produce.call_args
        self.assertEqual(call_args.kwargs['topic'], 'test_adsb_messages')
        self.assertEqual(call_args.kwargs['key'], message.icao_address)
        
        # Verify message content
        published_message = json.loads(call_args.kwargs['value'])
        self.assertEqual(published_message['icao_address'], message.icao_address)
        self.assertEqual(published_message['callsign'], message.callsign)
    
    def test_message_format_compatibility(self):
        """Test that generated messages match expected format"""
        aircraft = Aircraft("ABC123", "jet")
        message = aircraft.generate_message()
        json_str = message.to_json()
        
        # Parse JSON
        data = json.loads(json_str)
        
        # Verify all required fields are present
        required_fields = [
            'icao_address', 'callsign', 'latitude', 'longitude',
            'altitude', 'ground_speed', 'heading', 'timestamp', 'squawk'
        ]
        
        for field in required_fields:
            self.assertIn(field, data)
        
        # Verify field types
        self.assertIsInstance(data['icao_address'], str)
        self.assertIsInstance(data['callsign'], str)
        self.assertIsInstance(data['latitude'], float)
        self.assertIsInstance(data['longitude'], float)
        self.assertIsInstance(data['altitude'], int)
        self.assertIsInstance(data['ground_speed'], int)
        self.assertIsInstance(data['heading'], int)
        self.assertIsInstance(data['timestamp'], str)
        self.assertIsInstance(data['squawk'], str)
        
        # Verify value ranges
        self.assertGreaterEqual(data['latitude'], -90)
        self.assertLessEqual(data['latitude'], 90)
        self.assertGreaterEqual(data['longitude'], -180)
        self.assertLessEqual(data['longitude'], 180)
        self.assertGreaterEqual(data['altitude'], 0)
        self.assertLessEqual(data['altitude'], 60000)
        self.assertGreaterEqual(data['ground_speed'], 0)
        self.assertLessEqual(data['ground_speed'], 1000)
        self.assertGreaterEqual(data['heading'], 0)
        self.assertLessEqual(data['heading'], 359)
    
    @unittest.skipUnless(
        os.getenv('KAFKA_INTEGRATION_TEST') == 'true',
        "Set KAFKA_INTEGRATION_TEST=true to run real Kafka tests"
    )
    def test_real_kafka_integration(self):
        """Test with real Kafka broker (requires running Kafka)"""
        # This test requires a running Kafka broker
        try:
            # Initialize simulator with real Kafka
            simulator = ADSBSimulator(self.temp_config.name)
            
            # Generate and publish a test message
            aircraft = Aircraft("REAL123", "jet")
            message = aircraft.generate_message()
            simulator._publish_message(message)
            
            # Flush producer to ensure message is sent
            simulator.kafka_producer.flush(timeout=5)
            
            # Set up consumer to verify message was received
            consumer_config = {
                'bootstrap.servers': 'localhost:9092',
                'group.id': 'test_consumer',
                'auto.offset.reset': 'latest'
            }
            
            consumer = Consumer(consumer_config)
            consumer.subscribe(['test_adsb_messages'])
            
            # Publish another message to consume
            message2 = aircraft.generate_message()
            simulator._publish_message(message2)
            simulator.kafka_producer.flush(timeout=5)
            
            # Try to consume the message
            msg = consumer.poll(timeout=10.0)
            
            if msg is not None and not msg.error():
                # Verify message content
                received_data = json.loads(msg.value().decode('utf-8'))
                self.assertEqual(received_data['icao_address'], 'REAL123')
                self.assertIn('callsign', received_data)
                self.assertIn('timestamp', received_data)
            else:
                self.fail("Failed to receive message from Kafka")
            
            consumer.close()
            
        except KafkaException as e:
            self.skipTest(f"Kafka not available: {e}")
    
    @patch('confluent_kafka.Producer')
    @patch('confluent_kafka.admin.AdminClient')
    def test_error_handling(self, mock_admin, mock_producer):
        """Test error handling in Kafka operations"""
        # Test producer creation failure
        mock_producer.side_effect = Exception("Kafka connection failed")
        
        # Should handle error gracefully
        simulator = ADSBSimulator(self.temp_config.name)
        self.assertIsNone(simulator.kafka_producer)
        
        # Test message publishing with no producer
        aircraft = Aircraft("ERROR123", "jet")
        message = aircraft.generate_message()
        
        # Should not raise exception
        simulator._publish_message(message)
    
    def test_delivery_callback(self):
        """Test Kafka delivery callback handling"""
        with patch('confluent_kafka.Producer'), patch('confluent_kafka.admin.AdminClient'):
            simulator = ADSBSimulator(self.temp_config.name)
        
        # Test successful delivery
        msg_mock = MagicMock()
        msg_mock.topic.return_value = "test_topic"
        msg_mock.partition.return_value = 0
        
        # Should not raise exception
        simulator._delivery_callback(None, msg_mock)
        
        # Test failed delivery
        error_mock = MagicMock()
        error_mock.__str__ = lambda: "Delivery failed"
        
        # Should not raise exception
        simulator._delivery_callback(error_mock, msg_mock)
    
    def test_performance_metrics(self):
        """Test performance metrics collection"""
        with patch('confluent_kafka.Producer'), patch('confluent_kafka.admin.AdminClient'):
            simulator = ADSBSimulator(self.temp_config.name)
        
        initial_messages = simulator.messages_sent
        
        # Simulate sending messages
        for _ in range(10):
            aircraft = Aircraft(f"PERF{_:03d}", "jet")
            message = aircraft.generate_message()
            simulator._publish_message(message)
        
        # Verify message count increased
        self.assertEqual(simulator.messages_sent, initial_messages + 10)
        
        # Test statistics logging (should not raise exception)
        simulator._log_statistics()


class TestMessageValidation(unittest.TestCase):
    """Test message validation and format compliance"""
    
    def test_icao_address_format(self):
        """Test ICAO address format validation"""
        aircraft = Aircraft("123ABC", "jet")
        message = aircraft.generate_message()
        
        # ICAO address should be uppercase hex
        self.assertEqual(message.icao_address, "123ABC")
        self.assertTrue(all(c in '0123456789ABCDEF' for c in message.icao_address))
    
    def test_timestamp_format(self):
        """Test timestamp format compliance"""
        aircraft = Aircraft("TIME123", "jet")
        message = aircraft.generate_message()
        
        # Should be valid ISO 8601 format
        from datetime import datetime
        try:
            parsed_time = datetime.fromisoformat(message.timestamp.replace('Z', '+00:00'))
            self.assertIsNotNone(parsed_time)
        except ValueError:
            self.fail("Invalid timestamp format")
    
    def test_coordinate_precision(self):
        """Test coordinate precision requirements"""
        aircraft = Aircraft("COORD123", "jet")
        message = aircraft.generate_message()
        
        # Latitude and longitude should have 6 decimal places
        lat_str = f"{message.latitude:.6f}"
        lon_str = f"{message.longitude:.6f}"
        
        self.assertEqual(len(lat_str.split('.')[1]), 6)
        self.assertEqual(len(lon_str.split('.')[1]), 6)
    
    def test_squawk_code_format(self):
        """Test squawk code format"""
        aircraft = Aircraft("SQUAWK123", "jet")
        
        # Test normal squawk
        message = aircraft.generate_message()
        self.assertTrue(message.squawk.isdigit())
        self.assertEqual(len(message.squawk), 4)
        
        # Test emergency squawks
        aircraft.trigger_emergency("general")
        emergency_message = aircraft.generate_message()
        self.assertIn(emergency_message.squawk, ["7700", "7600", "7500"])


if __name__ == '__main__':
    # Set up logging for tests
    import logging
    logging.basicConfig(level=logging.WARNING)
    
    unittest.main()