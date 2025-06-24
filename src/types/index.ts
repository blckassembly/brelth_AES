export interface Aircraft {
  id: string;
  callsign: string;
  type: string;
  position: { x: number; y: number };
  heading: number;
  status: 'taxiing' | 'holding' | 'pushback' | 'parked';
  gate?: string;
  runway?: string;
  route?: string[];
  lastUpdate: Date;
  automatedRoute?: string[]; // For showing automated taxi routes
}

export interface GroundVehicle {
  id: string;
  type: 'pushback' | 'follow-me' | 'emergency' | 'maintenance' | 'fuel';
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'emergency';
  assignedAircraft?: string;
  lastUpdate: Date;
  automatedTask?: string; // For showing automated tasks
}

export interface Runway {
  id: string;
  name: string;
  status: 'active' | 'occupied' | 'closed' | 'maintenance';
  occupiedBy?: string;
  windDirection?: number;
  windSpeed?: number;
}

export interface Taxiway {
  id: string;
  name: string;
  status: 'clear' | 'occupied' | 'closed';
  occupiedBy?: string;
  congestionLevel: 'low' | 'medium' | 'high';
}

export interface Gate {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'maintenance';
  aircraft?: Aircraft;
  scheduledDeparture?: Date;
  scheduledArrival?: Date;
  type: 'narrow' | 'wide' | 'cargo';
}

export interface WeatherData {
  visibility: number;
  windDirection: number;
  windSpeed: number;
  temperature: number;
  pressure: number;
  conditions: string;
  lastUpdate: Date;
}

export interface Alert {
  id: string;
  type: 'incursion' | 'conflict' | 'weather' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  location?: string;
}

export interface CommunicationLog {
  id: string;
  timestamp: Date;
  frequency: string;
  from: string;
  to: string;
  message: string;
  encrypted: boolean;
}