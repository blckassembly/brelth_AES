import { useState, useEffect, useCallback } from 'react';
import { SimulationManager } from '../simulation/SimulationManager';
import { ComplianceValidator } from '../simulation/ComplianceValidator';
import { EventInjector } from '../simulation/EventInjector';
import { SimulationLogger } from '../simulation/SimulationLogger';
import { 
  SimulatedAircraft, 
  SimulatedGroundVehicle, 
  SimulatedRunway, 
  SimulatedTaxiway, 
  SimulatedGate, 
  SimulatedWeatherData,
  SimulationState
} from '../types/simulation';
import { Alert } from '../types';

// Singleton instances for simulation components
let simulationManager: SimulationManager | null = null;
let complianceValidator: ComplianceValidator | null = null;
let eventInjector: EventInjector | null = null;
let simulationLogger: SimulationLogger | null = null;

export const useSimulationData = () => {
  const [aircraft, setAircraft] = useState<SimulatedAircraft[]>([]);
  const [vehicles, setVehicles] = useState<SimulatedGroundVehicle[]>([]);
  const [runways, setRunways] = useState<SimulatedRunway[]>([]);
  const [taxiways, setTaxiways] = useState<SimulatedTaxiway[]>([]);
  const [gates, setGates] = useState<SimulatedGate[]>([]);
  const [weather, setWeather] = useState<SimulatedWeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);

  // Initialize simulation components
  const initializeSimulation = useCallback(() => {
    if (!simulationManager) {
      simulationManager = new SimulationManager();
      complianceValidator = new ComplianceValidator();
      eventInjector = new EventInjector();
      simulationLogger = new SimulationLogger();

      // Set up event listeners
      simulationManager.on('scenarioLoaded', (data: any) => {
        loadScenarioState(data.scenario);
        simulationLogger?.logEvent({
          id: 'scenario_loaded',
          timestamp: Date.now(),
          type: 'scenarioLoaded' as any,
          parameters: { scenarioId: data.scenario.id },
          expectedComplianceResponse: 'Scenario initialization',
          loggingRequirements: ['Event Log'],
          dalLevel: 'B',
          priority: 'medium'
        });
      });

      simulationManager.on('tick', (data: any) => {
        setSimulationState(simulationManager!.getState());
      });

      simulationManager.on('eventProcessed', (data: any) => {
        const violations = complianceValidator!.validateEvent(data.event, {
          aircraft, vehicles, runways, taxiways, gates, weather, alerts
        });
        
        violations.forEach(violation => {
          simulationLogger?.logCompliance(violation);
        });

        simulationLogger?.logResponse(data.event.id, data, data.processingTime);
      });

      // Set up event handlers for state updates
      simulationManager.on('aircraftMovement', (event: any) => {
        updateAircraftFromEvent(event);
      });

      simulationManager.on('vehicleDispatch', (event: any) => {
        updateVehiclesFromEvent(event);
      });

      simulationManager.on('runwayStatusChange', (event: any) => {
        updateRunwaysFromEvent(event);
      });

      simulationManager.on('alertTrigger', (event: any) => {
        addAlertFromEvent(event);
      });

      simulationManager.on('weatherUpdate', (event: any) => {
        updateWeatherFromEvent(event);
      });

      simulationManager.on('emergencyScenario', (event: any) => {
        handleEmergencyScenario(event);
      });
    }

    return simulationManager;
  }, [aircraft, vehicles, runways, taxiways, gates, weather, alerts]);

  // Load initial scenario state
  const loadScenarioState = useCallback((scenario: any) => {
    if (scenario.initialState) {
      setAircraft(generateSimulatedAircraft(scenario.initialState.aircraft || []));
      setVehicles(generateSimulatedVehicles(scenario.initialState.vehicles || []));
      setRunways(generateSimulatedRunways(scenario.initialState.runways || []));
      setTaxiways(generateSimulatedTaxiways(scenario.initialState.taxiways || []));
      setGates(generateSimulatedGates(scenario.initialState.gates || []));
      setWeather(generateSimulatedWeather(scenario.initialState.weather || {}));
      setAlerts([]);
    }
  }, []);

  // Event handlers for updating state
  const updateAircraftFromEvent = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { aircraft });
    setAircraft(updatedState.aircraft);
  }, [aircraft]);

  const updateVehiclesFromEvent = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { vehicles });
    setVehicles(updatedState.vehicles);
  }, [vehicles]);

  const updateRunwaysFromEvent = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { runways });
    setRunways(updatedState.runways);
  }, [runways]);

  const addAlertFromEvent = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { alerts });
    setAlerts(updatedState.alerts);
  }, [alerts]);

  const updateWeatherFromEvent = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { weather });
    setWeather(updatedState.weather);
  }, [weather]);

  const handleEmergencyScenario = useCallback((event: any) => {
    const updatedState = eventInjector!.injectEvent(event, { 
      aircraft, vehicles, alerts 
    });
    setAircraft(updatedState.aircraft);
    setVehicles(updatedState.vehicles);
    setAlerts(updatedState.alerts);
  }, [aircraft, vehicles, alerts]);

  // Control functions
  const startSimulation = useCallback(() => {
    const manager = initializeSimulation();
    manager.start();
  }, [initializeSimulation]);

  const pauseSimulation = useCallback(() => {
    simulationManager?.pause();
  }, []);

  const resumeSimulation = useCallback(() => {
    simulationManager?.resume();
  }, []);

  const stopSimulation = useCallback(() => {
    simulationManager?.stop();
  }, []);

  const resetSimulation = useCallback(() => {
    simulationManager?.reset();
  }, []);

  const loadScenario = useCallback((scenarioId: string) => {
    const manager = initializeSimulation();
    return manager.loadScenario(scenarioId);
  }, [initializeSimulation]);

  const setTimeScale = useCallback((scale: number) => {
    simulationManager?.setTimeScale(scale);
  }, []);

  const injectEvent = useCallback((event: any) => {
    simulationManager?.injectEvent(event);
  }, []);

  const getAvailableScenarios = useCallback(() => {
    const manager = initializeSimulation();
    return manager.getAvailableScenarios();
  }, [initializeSimulation]);

  const getSimulationLogs = useCallback(() => {
    return simulationLogger?.getLogs() || [];
  }, []);

  const exportLogs = useCallback((format: 'csv' | 'json' | 'do326a') => {
    if (!simulationLogger) return '';
    
    switch (format) {
      case 'csv':
        return simulationLogger.exportLogsAsCSV();
      case 'json':
        return simulationLogger.exportLogsAsJSON();
      case 'do326a':
        return simulationLogger.exportDO326ACompliantLog();
      default:
        return '';
    }
  }, []);

  const getComplianceStatus = useCallback(() => {
    return complianceValidator?.getComplianceStatus();
  }, []);

  // Initialize simulation on mount
  useEffect(() => {
    initializeSimulation();
    
    // Load default scenario data if no scenario is active
    if (!simulationState?.activeScenario) {
      setAircraft(generateDefaultAircraft());
      setVehicles(generateDefaultVehicles());
      setRunways(generateDefaultRunways());
      setTaxiways(generateDefaultTaxiways());
      setGates(generateDefaultGates());
      setWeather(generateDefaultWeather());
      setAlerts([]);
    }

    return () => {
      // Cleanup on unmount
      simulationManager?.stop();
    };
  }, [initializeSimulation, simulationState]);

  return {
    // Data
    aircraft,
    vehicles,
    runways,
    taxiways,
    gates,
    weather,
    alerts,
    simulationState,
    
    // Control functions
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    loadScenario,
    setTimeScale,
    injectEvent,
    
    // Utility functions
    getAvailableScenarios,
    getSimulationLogs,
    exportLogs,
    getComplianceStatus
  };
};

// Helper functions to generate simulation data
const generateSimulatedAircraft = (baseAircraft: any[]): SimulatedAircraft[] => {
  return baseAircraft.map((ac, index) => ({
    id: ac.id || `SIM_AC_${index}`,
    callsign: ac.callsign || `SIM${1000 + index}`,
    type: ac.type || 'B737',
    position: ac.position || { x: 100 + index * 50, y: 100 + index * 30 },
    heading: ac.heading || Math.floor(Math.random() * 360),
    status: ac.status || 'parked',
    lastUpdate: new Date(),
    simulationData: {
      scheduledEvents: [],
      complianceFlags: []
    }
  }));
};

const generateSimulatedVehicles = (baseVehicles: any[]): SimulatedGroundVehicle[] => {
  return baseVehicles.map((vehicle, index) => ({
    id: vehicle.id || `SIM_VH_${index}`,
    type: vehicle.type || 'maintenance',
    position: vehicle.position || { x: 200 + index * 40, y: 200 + index * 20 },
    status: vehicle.status || 'idle',
    lastUpdate: new Date(),
    simulationData: {
      responseTime: Math.random() * 300,
      scheduledTasks: []
    }
  }));
};

const generateSimulatedRunways = (baseRunways: any[]): SimulatedRunway[] => {
  const defaultRunways = [
    { id: 'RW09L', name: '09L/27R', status: 'active' },
    { id: 'RW09R', name: '09R/27L', status: 'active' },
    { id: 'RW04L', name: '04L/22R', status: 'active' }
  ];
  
  return (baseRunways.length > 0 ? baseRunways : defaultRunways).map(runway => ({
    ...runway,
    windDirection: 270,
    windSpeed: 15,
    simulationData: {
      incursionEvents: [],
      maintenanceSchedule: []
    }
  }));
};

const generateSimulatedTaxiways = (baseTaxiways: any[]): SimulatedTaxiway[] => {
  const defaultTaxiways = [
    { id: 'TW_A', name: 'Alpha', status: 'clear', congestionLevel: 'low' },
    { id: 'TW_B', name: 'Bravo', status: 'clear', congestionLevel: 'medium' },
    { id: 'TW_C', name: 'Charlie', status: 'occupied', congestionLevel: 'high' }
  ];
  
  return (baseTaxiways.length > 0 ? baseTaxiways : defaultTaxiways).map(taxiway => ({
    ...taxiway,
    simulationData: {
      trafficHistory: [],
      blockageEvents: []
    }
  }));
};

const generateSimulatedGates = (baseGates: any[]): SimulatedGate[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `SIM_G${i + 1}`,
    number: `${i + 1}`,
    status: Math.random() > 0.6 ? 'occupied' : 'available',
    type: Math.random() > 0.7 ? 'wide' : 'narrow',
    simulationData: {
      turnaroundTimes: [],
      utilizationRate: Math.random()
    }
  }));
};

const generateSimulatedWeather = (baseWeather: any): SimulatedWeatherData => {
  return {
    visibility: baseWeather.visibility || 10,
    windDirection: baseWeather.windDirection || 270,
    windSpeed: baseWeather.windSpeed || 15,
    temperature: baseWeather.temperature || 22,
    pressure: baseWeather.pressure || 29.92,
    conditions: baseWeather.conditions || 'Clear',
    lastUpdate: new Date(),
    simulationData: {
      forecast: []
    }
  };
};

// Default data generators
const generateDefaultAircraft = (): SimulatedAircraft[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `SIM_AC_${i}`,
    callsign: `SIM${1000 + i}`,
    type: ['B737', 'A320', 'B777'][Math.floor(Math.random() * 3)],
    position: { x: 100 + i * 80, y: 150 + i * 40 },
    heading: Math.floor(Math.random() * 360),
    status: ['parked', 'taxiing', 'holding'][Math.floor(Math.random() * 3)] as any,
    lastUpdate: new Date(),
    simulationData: {
      scheduledEvents: [],
      complianceFlags: []
    }
  }));
};

const generateDefaultVehicles = (): SimulatedGroundVehicle[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `SIM_VH_${i}`,
    type: ['emergency', 'pushback', 'fuel', 'maintenance'][Math.floor(Math.random() * 4)] as any,
    position: { x: 200 + i * 60, y: 300 + i * 30 },
    status: ['active', 'idle'][Math.floor(Math.random() * 2)] as any,
    lastUpdate: new Date(),
    simulationData: {
      responseTime: Math.random() * 300,
      scheduledTasks: []
    }
  }));
};

const generateDefaultRunways = (): SimulatedRunway[] => {
  return [
    { 
      id: 'RW09L', 
      name: '09L/27R', 
      status: 'active', 
      windDirection: 270, 
      windSpeed: 15,
      simulationData: { incursionEvents: [], maintenanceSchedule: [] }
    },
    { 
      id: 'RW09R', 
      name: '09R/27L', 
      status: 'active', 
      windDirection: 270, 
      windSpeed: 15,
      simulationData: { incursionEvents: [], maintenanceSchedule: [] }
    }
  ];
};

const generateDefaultTaxiways = (): SimulatedTaxiway[] => {
  return [
    { 
      id: 'TW_A', 
      name: 'Alpha', 
      status: 'clear', 
      congestionLevel: 'low',
      simulationData: { trafficHistory: [], blockageEvents: [] }
    },
    { 
      id: 'TW_B', 
      name: 'Bravo', 
      status: 'occupied', 
      congestionLevel: 'medium',
      simulationData: { trafficHistory: [], blockageEvents: [] }
    }
  ];
};

const generateDefaultGates = (): SimulatedGate[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `SIM_G${i + 1}`,
    number: `${i + 1}`,
    status: Math.random() > 0.6 ? 'occupied' : 'available',
    type: Math.random() > 0.7 ? 'wide' : 'narrow',
    simulationData: {
      turnaroundTimes: [],
      utilizationRate: Math.random()
    }
  }));
};

const generateDefaultWeather = (): SimulatedWeatherData => {
  return {
    visibility: 10,
    windDirection: 270,
    windSpeed: 15,
    temperature: 22,
    pressure: 29.92,
    conditions: 'Clear',
    lastUpdate: new Date(),
    simulationData: {
      forecast: []
    }
  };
};