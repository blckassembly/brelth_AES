#!/usr/bin/env python3
"""
Unit tests for Aircraft class
"""

import unittest
import time
import math
from datetime import datetime, timezone
from adsb_simulator import Aircraft, ADSBMessage, Waypoint
from geopy import Point
from geopy.distance import geodesic


class TestAircraft(unittest.TestCase):
    """Test cases for Aircraft class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.aircraft = Aircraft("ABC123", "jet")
    
    def test_aircraft_initialization(self):
        """Test aircraft initialization"""
        self.assertEqual(self.aircraft.icao_address, "ABC123")
        self.assertEqual(self.aircraft.aircraft_type, "jet")
        self.assertIsInstance(self.aircraft.callsign, str)
        self.assertTrue(self.aircraft.callsign.startswith(("UAL", "DAL", "AAL", "SWA", "JBU", "DL", "AA", "UA", "WN", "B6")))
        
        # Check position is within valid ranges
        self.assertGreaterEqual(self.aircraft.latitude, -60)
        self.assertLessEqual(self.aircraft.latitude, 60)
        self.assertGreaterEqual(self.aircraft.longitude, -180)
        self.assertLessEqual(self.aircraft.longitude, 180)
        
        # Check altitude and speed are reasonable for jet
        self.assertGreaterEqual(self.aircraft.altitude, 25000)
        self.assertLessEqual(self.aircraft.altitude, 42000)
        self.assertGreaterEqual(self.aircraft.ground_speed, 400)
        self.assertLessEqual(self.aircraft.ground_speed, 550)
    
    def test_prop_aircraft_initialization(self):
        """Test prop aircraft has different characteristics"""
        prop_aircraft = Aircraft("DEF456", "prop")
        
        # Prop aircraft should have lower altitude and speed
        self.assertGreaterEqual(prop_aircraft.altitude, 8000)
        self.assertLessEqual(prop_aircraft.altitude, 18000)
        self.assertGreaterEqual(prop_aircraft.ground_speed, 150)
        self.assertLessEqual(prop_aircraft.ground_speed, 220)
    
    def test_flight_plan_generation(self):
        """Test that flight plan is generated with waypoints"""
        self.assertGreater(len(self.aircraft.waypoints), 0)
        self.assertLessEqual(len(self.aircraft.waypoints), 5)
        
        # Check waypoints are Waypoint objects
        for waypoint in self.aircraft.waypoints:
            self.assertIsInstance(waypoint, Waypoint)
            self.assertIsInstance(waypoint.latitude, float)
            self.assertIsInstance(waypoint.longitude, float)
    
    def test_position_update(self):
        """Test position update with realistic movement"""
        initial_lat = self.aircraft.latitude
        initial_lon = self.aircraft.longitude
        initial_heading = self.aircraft.heading
        
        # Update position for 1 second
        self.aircraft.update_position(1.0)
        
        # Position should have changed
        new_lat = self.aircraft.latitude
        new_lon = self.aircraft.longitude
        
        # Calculate distance moved
        initial_pos = Point(initial_lat, initial_lon)
        new_pos = Point(new_lat, new_lon)
        distance_moved = geodesic(initial_pos, new_pos).kilometers
        
        # Should have moved based on ground speed
        expected_distance = (self.aircraft.ground_speed * 1.852) / 3600  # Convert knots to km/s
        
        # Allow for some variation due to heading changes and randomness
        self.assertLess(abs(distance_moved - expected_distance), expected_distance * 0.5)
    
    def test_heading_changes(self):
        """Test that heading changes are realistic"""
        initial_heading = self.aircraft.heading
        
        # Force a target heading change
        self.aircraft.target_heading = (initial_heading + 90) % 360
        
        # Update multiple times to see gradual heading change
        for _ in range(10):
            self.aircraft.update_position(1.0)
        
        # Heading should have changed towards target
        heading_diff = abs(self.aircraft.heading - initial_heading)
        if heading_diff > 180:
            heading_diff = 360 - heading_diff
        
        self.assertGreater(heading_diff, 0)
        self.assertLess(heading_diff, 180)  # Should not have overshot too much
    
    def test_altitude_speed_bounds(self):
        """Test that altitude and speed stay within bounds"""
        # Update position many times with random variations
        for _ in range(100):
            self.aircraft.update_position(0.1)
        
        # Check bounds
        self.assertGreaterEqual(self.aircraft.altitude, 1000)
        self.assertLessEqual(self.aircraft.altitude, 60000)
        self.assertGreaterEqual(self.aircraft.ground_speed, self.aircraft.min_speed)
        self.assertLessEqual(self.aircraft.ground_speed, self.aircraft.max_speed)
    
    def test_emergency_scenarios(self):
        """Test emergency scenario handling"""
        # Initially not in emergency
        self.assertFalse(self.aircraft.emergency_state)
        self.assertEqual(self.aircraft.squawk, "1200")
        
        # Trigger emergency
        self.aircraft.trigger_emergency("general")
        self.assertTrue(self.aircraft.emergency_state)
        self.assertEqual(self.aircraft.squawk, "7700")
        
        # Test different emergency types
        self.aircraft.trigger_emergency("hijack")
        self.assertEqual(self.aircraft.squawk, "7500")
        
        self.aircraft.trigger_emergency("communication")
        self.assertEqual(self.aircraft.squawk, "7600")
        
        # Clear emergency
        self.aircraft.clear_emergency()
        self.assertFalse(self.aircraft.emergency_state)
        self.assertEqual(self.aircraft.squawk, "1200")
    
    def test_conflict_state(self):
        """Test separation conflict state handling"""
        # Initially not in conflict
        self.assertFalse(self.aircraft.conflict_state)
        
        # Set conflict state
        self.aircraft.set_conflict_state(True)
        self.assertTrue(self.aircraft.conflict_state)
        
        # Clear conflict state
        self.aircraft.set_conflict_state(False)
        self.assertFalse(self.aircraft.conflict_state)
    
    def test_message_generation(self):
        """Test ADS-B message generation"""
        message = self.aircraft.generate_message()
        
        # Check message type and fields
        self.assertIsInstance(message, ADSBMessage)
        self.assertEqual(message.icao_address, self.aircraft.icao_address)
        self.assertEqual(message.callsign, self.aircraft.callsign)
        self.assertEqual(message.aircraft_type, self.aircraft.aircraft_type)
        
        # Check position is rounded appropriately
        self.assertEqual(len(str(message.latitude).split('.')[1]), 6)  # 6 decimal places
        self.assertEqual(len(str(message.longitude).split('.')[1]), 6)
        
        # Check integer fields
        self.assertIsInstance(message.altitude, int)
        self.assertIsInstance(message.ground_speed, int)
        self.assertIsInstance(message.heading, int)
        
        # Check timestamp format
        timestamp = datetime.fromisoformat(message.timestamp.replace('Z', '+00:00'))
        self.assertEqual(timestamp.tzinfo, timezone.utc)
        
        # Check heading is 0-359
        self.assertGreaterEqual(message.heading, 0)
        self.assertLessEqual(message.heading, 359)
    
    def test_message_json_serialization(self):
        """Test that messages can be serialized to JSON"""
        message = self.aircraft.generate_message()
        json_str = message.to_json()
        
        # Should be valid JSON
        import json
        data = json.loads(json_str)
        
        # Check all required fields are present
        required_fields = [
            'icao_address', 'callsign', 'latitude', 'longitude',
            'altitude', 'ground_speed', 'heading', 'timestamp', 'squawk'
        ]
        for field in required_fields:
            self.assertIn(field, data)
    
    def test_bearing_calculation(self):
        """Test bearing calculation between points"""
        # Test known bearing calculation
        point1 = Point(0, 0)  # Equator, Prime Meridian
        point2 = Point(1, 0)  # 1 degree north
        
        bearing = self.aircraft._calculate_bearing(point1, point2)
        
        # Should be approximately 0 degrees (north)
        self.assertLess(abs(bearing), 1)
        
        # Test east bearing
        point3 = Point(0, 1)  # 1 degree east
        bearing_east = self.aircraft._calculate_bearing(point1, point3)
        
        # Should be approximately 90 degrees (east)
        self.assertLess(abs(bearing_east - 90), 1)
    
    def test_heading_difference_normalization(self):
        """Test heading difference normalization"""
        # Test cases for heading difference
        test_cases = [
            (10, 350, 20),    # 10 - 350 = -340, normalized to 20
            (350, 10, -20),   # 350 - 10 = 340, normalized to -20
            (180, 0, 180),    # 180 - 0 = 180, stays 180
            (0, 180, -180),   # 0 - 180 = -180, stays -180
        ]
        
        for heading1, heading2, expected in test_cases:
            diff = self.aircraft._normalize_heading_difference(heading1 - heading2)
            self.assertAlmostEqual(diff, expected, places=1)
    
    def test_waypoint_progression(self):
        """Test that aircraft progresses through waypoints"""
        initial_waypoint_count = len(self.aircraft.waypoints)
        initial_waypoint_index = self.aircraft.current_waypoint_index
        
        # Move aircraft to first waypoint quickly
        if self.aircraft.waypoints:
            target_waypoint = self.aircraft.waypoints[0]
            self.aircraft.latitude = target_waypoint.latitude
            self.aircraft.longitude = target_waypoint.longitude
            
            # Update position - should progress to next waypoint
            self.aircraft.update_position(1.0)
            
            # Should have progressed to next waypoint or generated new flight plan
            self.assertTrue(
                self.aircraft.current_waypoint_index > initial_waypoint_index or
                len(self.aircraft.waypoints) != initial_waypoint_count
            )


class TestADSBMessage(unittest.TestCase):
    """Test cases for ADSBMessage class"""
    
    def test_message_creation(self):
        """Test ADS-B message creation"""
        message = ADSBMessage(
            icao_address="123456",
            callsign="TEST123",
            latitude=37.7749,
            longitude=-122.4194,
            altitude=35000,
            ground_speed=450,
            heading=270,
            timestamp="2025-01-15T20:09:00Z",
            squawk="1200",
            aircraft_type="jet"
        )
        
        self.assertEqual(message.icao_address, "123456")
        self.assertEqual(message.callsign, "TEST123")
        self.assertEqual(message.latitude, 37.7749)
        self.assertEqual(message.longitude, -122.4194)
        self.assertEqual(message.altitude, 35000)
        self.assertEqual(message.ground_speed, 450)
        self.assertEqual(message.heading, 270)
        self.assertEqual(message.squawk, "1200")
        self.assertEqual(message.aircraft_type, "jet")
    
    def test_message_json_conversion(self):
        """Test JSON conversion"""
        message = ADSBMessage(
            icao_address="123456",
            callsign="TEST123",
            latitude=37.7749,
            longitude=-122.4194,
            altitude=35000,
            ground_speed=450,
            heading=270,
            timestamp="2025-01-15T20:09:00Z"
        )
        
        json_str = message.to_json()
        
        # Parse JSON and verify
        import json
        data = json.loads(json_str)
        
        self.assertEqual(data['icao_address'], "123456")
        self.assertEqual(data['callsign'], "TEST123")
        self.assertEqual(data['latitude'], 37.7749)
        self.assertEqual(data['longitude'], -122.4194)
        self.assertEqual(data['altitude'], 35000)
        self.assertEqual(data['ground_speed'], 450)
        self.assertEqual(data['heading'], 270)


if __name__ == '__main__':
    unittest.main()