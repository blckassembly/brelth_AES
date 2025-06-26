// Simulation-specific type definitions
export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  initialState: {
    aircraft: SimulatedAircraft[];
    vehicles: SimulatedGroundVehicle[];
    runways: SimulatedRunway[];
    taxiways: SimulatedTaxiway[];
    gates: SimulatedGate[];
    weather: SimulatedWeatherData;
  };
  timeline: SimulationEvent[];
  complianceTestCases: ComplianceTestCase[];
  systemParameters: {
    duration: number; // in minutes
    criticalResponseTime: number; // in seconds
    maxConcurrentEvents: number;
  };
}

export interface SimulationEvent {
  id: string;
  timestamp: number; // milliseconds from start
  type: SimulationEventType;
  parameters: Record<string, any>;
  expectedComplianceResponse: string;
  loggingRequirements: string[];
  dalLevel: 'A' | 'B';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export enum SimulationEventType {
  AIRCRAFT_MOVEMENT = 'aircraftMovement',
  VEHICLE_DISPATCH = 'vehicleDispatch',
  RUNWAY_STATUS_CHANGE = 'runwayStatusChange',
  ALERT_TRIGGER = 'alertTrigger',
  WEATHER_UPDATE = 'weatherUpdate',
  COMMUNICATION_FAILURE = 'communicationFailure',
  EMERGENCY_SCENARIO = 'emergencyScenario',
  SYSTEM_FAULT = 'systemFault',
  COMPLIANCE_CHECK = 'complianceCheck'
}

export interface ComplianceTestCase {
  id: string;
  regulation: string; // e.g., "DO-178C DAL A"
  requirement: string;
  expectedOutcome: string;
  testType: 'isolation' | 'response_time' | 'safety_rule' | 'logging' | 'error_handling';
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  timeScale: number;
  activeScenario: string | null;
  eventQueue: SimulationEvent[];
  complianceStatus: ComplianceStatus;
}

export interface ComplianceStatus {
  dalAViolations: ComplianceViolation[];
  dalBViolations: ComplianceViolation[];
  responseTimeViolations: ResponseTimeViolation[];
  safetyRuleViolations: SafetyRuleViolation[];
  overallStatus: 'compliant' | 'warning' | 'violation';
}

export interface ComplianceViolation {
  id: string;
  timestamp: number;
  regulation: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  eventId: string;
}

export interface ResponseTimeViolation {
  id: string;
  timestamp: number;
  expectedTime: number;
  actualTime: number;
  eventType: string;
  severity: 'warning' | 'violation';
}

export interface SafetyRuleViolation {
  id: string;
  timestamp: number;
  rule: string;
  description: string;
  severity: 'warning' | 'critical';
}

export interface SimulationLog {
  id: string;
  timestamp: number;
  eventId?: string;
  type: 'event' | 'response' | 'compliance' | 'performance' | 'error';
  data: Record<string, any>;
  dalLevel?: 'A' | 'B';
}

// Extended interfaces for simulation
export interface SimulatedAircraft {
  id: string;
  callsign: string;
  type: string;
  position: { x: number; y: number };
  heading: number;
  status: 'taxiing' | 'holding' | 'pushback' | 'parked' | 'emergency';
  gate?: string;
  runway?: string;
  route?: string[];
  lastUpdate: Date;
  automatedRoute?: string[];
  simulationData?: {
    scheduledEvents: string[];
    complianceFlags: string[];
  };
}

export interface SimulatedGroundVehicle {
  id: string;
  type: 'pushback' | 'follow-me' | 'emergency' | 'maintenance' | 'fuel';
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'emergency' | 'maintenance';
  assignedAircraft?: string;
  lastUpdate: Date;
  automatedTask?: string;
  simulationData?: {
    responseTime: number;
    scheduledTasks: string[];
  };
}

export interface SimulatedRunway {
  id: string;
  name: string;
  status: 'active' | 'occupied' | 'closed' | 'maintenance';
  occupiedBy?: string;
  windDirection?: number;
  windSpeed?: number;
  simulationData?: {
    incursionEvents: string[];
    maintenanceSchedule: Date[];
  };
}

export interface SimulatedTaxiway {
  id: string;
  name: string;
  status: 'clear' | 'occupied' | 'closed';
  occupiedBy?: string;
  congestionLevel: 'low' | 'medium' | 'high';
  simulationData?: {
    trafficHistory: number[];
    blockageEvents: string[];
  };
}

export interface SimulatedGate {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'maintenance';
  scheduledDeparture?: Date;
  scheduledArrival?: Date;
  type: 'narrow' | 'wide' | 'cargo';
  simulationData?: {
    turnaroundTimes: number[];
    utilizationRate: number;
  };
}

export interface SimulatedWeatherData {
  visibility: number;
  windDirection: number;
  windSpeed: number;
  temperature: number;
  pressure: number;
  conditions: string;
  lastUpdate: Date;
  simulationData?: {
    forecast: Array<{
      time: number;
      conditions: string;
      visibility: number;
      windSpeed: number;
    }>;
  };
}