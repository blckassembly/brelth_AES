import { SimulationEvent, SimulationEventType } from '../types/simulation';

export class EventInjector {
  private eventCallbacks: Map<SimulationEventType, Function[]> = new Map();

  constructor() {
    this.initializeEventHandlers();
  }

  injectEvent(event: SimulationEvent, currentState: any): any {
    const handlers = this.eventCallbacks.get(event.type);
    if (!handlers || handlers.length === 0) {
      console.warn(`No handlers found for event type: ${event.type}`);
      return currentState;
    }

    let updatedState = { ...currentState };

    handlers.forEach(handler => {
      try {
        updatedState = handler(event, updatedState);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });

    return updatedState;
  }

  registerHandler(eventType: SimulationEventType, handler: Function): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(handler);
  }

  private initializeEventHandlers(): void {
    // Aircraft movement handler
    this.registerHandler(SimulationEventType.AIRCRAFT_MOVEMENT, (event: SimulationEvent, state: any) => {
      const { aircraftId, newPosition, newStatus, runway, gate } = event.parameters;
      
      return {
        ...state,
        aircraft: state.aircraft.map((aircraft: any) => {
          if (aircraft.id === aircraftId || aircraft.callsign === aircraftId) {
            return {
              ...aircraft,
              position: newPosition || aircraft.position,
              status: newStatus || aircraft.status,
              runway: runway || aircraft.runway,
              gate: gate || aircraft.gate,
              lastUpdate: new Date()
            };
          }
          return aircraft;
        })
      };
    });

    // Vehicle dispatch handler
    this.registerHandler(SimulationEventType.VEHICLE_DISPATCH, (event: SimulationEvent, state: any) => {
      const { vehicleId, vehicleType, position, assignedAircraft, task } = event.parameters;
      
      return {
        ...state,
        vehicles: state.vehicles.map((vehicle: any) => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              position: position || vehicle.position,
              status: 'active',
              assignedAircraft: assignedAircraft || vehicle.assignedAircraft,
              automatedTask: task || vehicle.automatedTask,
              lastUpdate: new Date()
            };
          }
          return vehicle;
        })
      };
    });

    // Runway status change handler
    this.registerHandler(SimulationEventType.RUNWAY_STATUS_CHANGE, (event: SimulationEvent, state: any) => {
      const { runwayId, newStatus, occupiedBy } = event.parameters;
      
      return {
        ...state,
        runways: state.runways.map((runway: any) => {
          if (runway.id === runwayId || runway.name === runwayId) {
            return {
              ...runway,
              status: newStatus || runway.status,
              occupiedBy: occupiedBy || runway.occupiedBy
            };
          }
          return runway;
        })
      };
    });

    // Alert trigger handler
    this.registerHandler(SimulationEventType.ALERT_TRIGGER, (event: SimulationEvent, state: any) => {
      const { alertType, message, severity, location, aircraft } = event.parameters;
      
      const newAlert = {
        id: `SIM_ALERT_${Date.now()}`,
        type: alertType,
        severity: severity || 'medium',
        message: message || `Simulated ${alertType} alert`,
        timestamp: new Date(),
        resolved: false,
        location: location
      };

      return {
        ...state,
        alerts: [...state.alerts, newAlert]
      };
    });

    // Weather update handler
    this.registerHandler(SimulationEventType.WEATHER_UPDATE, (event: SimulationEvent, state: any) => {
      const { visibility, windDirection, windSpeed, conditions, temperature } = event.parameters;
      
      return {
        ...state,
        weather: {
          ...state.weather,
          visibility: visibility !== undefined ? visibility : state.weather.visibility,
          windDirection: windDirection !== undefined ? windDirection : state.weather.windDirection,
          windSpeed: windSpeed !== undefined ? windSpeed : state.weather.windSpeed,
          conditions: conditions || state.weather.conditions,
          temperature: temperature !== undefined ? temperature : state.weather.temperature,
          lastUpdate: new Date()
        }
      };
    });

    // Communication failure handler
    this.registerHandler(SimulationEventType.COMMUNICATION_FAILURE, (event: SimulationEvent, state: any) => {
      const { affectedEntity, failureType, duration } = event.parameters;
      
      // Add communication failure alert
      const commFailureAlert = {
        id: `COMM_FAIL_${Date.now()}`,
        type: 'communication' as const,
        severity: 'high' as const,
        message: `Communication failure: ${failureType} affecting ${affectedEntity}`,
        timestamp: new Date(),
        resolved: false,
        location: affectedEntity
      };

      return {
        ...state,
        alerts: [...state.alerts, commFailureAlert],
        communicationStatus: {
          ...state.communicationStatus,
          [affectedEntity]: {
            status: 'failed',
            failureType,
            timestamp: new Date(),
            estimatedRestoration: new Date(Date.now() + (duration || 300000)) // 5 minutes default
          }
        }
      };
    });

    // Emergency scenario handler
    this.registerHandler(SimulationEventType.EMERGENCY_SCENARIO, (event: SimulationEvent, state: any) => {
      const { aircraft, emergencyType, priority, location } = event.parameters;
      
      // Create emergency alert
      const emergencyAlert = {
        id: `EMERGENCY_${Date.now()}`,
        type: 'emergency' as const,
        severity: 'critical' as const,
        message: `${emergencyType.toUpperCase()}: ${aircraft} declaring ${priority}`,
        timestamp: new Date(),
        resolved: false,
        location: location || 'Unknown'
      };

      // Update aircraft status to emergency
      const updatedAircraft = state.aircraft.map((ac: any) => {
        if (ac.callsign === aircraft || ac.id === aircraft) {
          return {
            ...ac,
            status: 'emergency',
            lastUpdate: new Date()
          };
        }
        return ac;
      });

      // Dispatch emergency vehicles
      const emergencyVehicles = state.vehicles.map((vehicle: any) => {
        if (vehicle.type === 'emergency' && vehicle.status === 'idle') {
          return {
            ...vehicle,
            status: 'emergency',
            assignedAircraft: aircraft,
            automatedTask: `Emergency response to ${emergencyType}`,
            lastUpdate: new Date()
          };
        }
        return vehicle;
      });

      return {
        ...state,
        alerts: [...state.alerts, emergencyAlert],
        aircraft: updatedAircraft,
        vehicles: emergencyVehicles
      };
    });

    // System fault handler
    this.registerHandler(SimulationEventType.SYSTEM_FAULT, (event: SimulationEvent, state: any) => {
      const { systemComponent, faultType, severity, affectedPartition } = event.parameters;
      
      const systemFaultAlert = {
        id: `SYS_FAULT_${Date.now()}`,
        type: 'system' as const,
        severity: severity || 'medium',
        message: `System fault in ${systemComponent}: ${faultType}`,
        timestamp: new Date(),
        resolved: false,
        location: systemComponent
      };

      return {
        ...state,
        alerts: [...state.alerts, systemFaultAlert],
        systemHealth: {
          ...state.systemHealth,
          [systemComponent]: {
            status: 'fault',
            faultType,
            severity,
            timestamp: new Date(),
            affectedPartition
          }
        }
      };
    });

    // Compliance check handler
    this.registerHandler(SimulationEventType.COMPLIANCE_CHECK, (event: SimulationEvent, state: any) => {
      const { checkType, regulation, expectedResult } = event.parameters;
      
      // Log compliance check
      console.log(`Compliance check: ${checkType} for ${regulation}`);
      
      return {
        ...state,
        complianceChecks: [
          ...(state.complianceChecks || []),
          {
            id: `CHECK_${Date.now()}`,
            type: checkType,
            regulation,
            timestamp: new Date(),
            expectedResult,
            status: 'pending'
          }
        ]
      };
    });

    // Flight grounded handler
    this.registerHandler(SimulationEventType.FLIGHT_GROUNDED, (event: SimulationEvent, state: any) => {
      const { aircraftId, callsign, reason, authority } = event.parameters;
      
      // Update aircraft status to grounded
      const updatedAircraft = state.aircraft.map((aircraft: any) => {
        if (aircraft.id === aircraftId || aircraft.callsign === callsign) {
          return {
            ...aircraft,
            status: 'grounded',
            groundedReason: reason,
            lastUpdate: new Date()
          };
        }
        return aircraft;
      });

      // Create grounding alert
      const groundingAlert = {
        id: `GROUNDING_${Date.now()}`,
        type: 'emergency' as const,
        severity: 'high' as const,
        message: `Flight ${callsign} grounded by ${authority}: ${reason}`,
        timestamp: new Date(),
        resolved: false,
        location: `Aircraft ${callsign}`
      };

      return {
        ...state,
        aircraft: updatedAircraft,
        alerts: [...state.alerts, groundingAlert]
      };
    });
  }
}