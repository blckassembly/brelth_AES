import { useState, useEffect } from 'react';
import { Aircraft, GroundVehicle, Runway, Taxiway, Gate, WeatherData, Alert } from '../types';

export interface AutomatedProcess {
  id: string;
  type: 'pushback-taxi' | 'conflict-resolution' | 'gate-optimization';
  aircraftId: string;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed';
  startTime: Date;
  estimatedCompletion?: Date;
  steps: AutomatedStep[];
  currentStep: number;
}

export interface AutomatedStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: Date;
  data?: any;
}

// Mock data generators for demonstration
const generateMockAircraft = (): Aircraft[] => {
  const types = ['B737', 'A320', 'B777', 'A350', 'C172', 'G650'];
  const statuses: Aircraft['status'][] = ['taxiing', 'holding', 'pushback', 'parked'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `AC${String(i + 1).padStart(3, '0')}`,
    callsign: `${['UAL', 'DAL', 'AAL', 'SWA', 'JBU'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 9000) + 1000}`,
    type: types[Math.floor(Math.random() * types.length)],
    position: {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100
    },
    heading: Math.floor(Math.random() * 360),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    gate: Math.random() > 0.5 ? `G${Math.floor(Math.random() * 50) + 1}` : undefined,
    runway: Math.random() > 0.7 ? `${Math.floor(Math.random() * 36) + 1}${['L', 'R', 'C'][Math.floor(Math.random() * 3)]}` : undefined,
    lastUpdate: new Date(),
    automatedRoute: undefined // Will be set during automation
  }));
};

const generateMockVehicles = (): GroundVehicle[] => {
  const types: GroundVehicle['type'][] = ['pushback', 'follow-me', 'emergency', 'maintenance', 'fuel'];
  const statuses: GroundVehicle['status'][] = ['active', 'idle', 'emergency'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `GV${String(i + 1).padStart(3, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    position: {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdate: new Date(),
    assignedAircraft: Math.random() > 0.7 ? `AC${String(Math.floor(Math.random() * 12) + 1).padStart(3, '0')}` : undefined,
    automatedTask: undefined // Will be set during automation
  }));
};

const generateMockRunways = (): Runway[] => {
  return [
    { id: 'RW09L', name: '09L/27R', status: 'active', windDirection: 270, windSpeed: 12 },
    { id: 'RW09R', name: '09R/27L', status: 'occupied', occupiedBy: 'UAL1234', windDirection: 270, windSpeed: 12 },
    { id: 'RW04L', name: '04L/22R', status: 'active', windDirection: 270, windSpeed: 12 },
    { id: 'RW04R', name: '04R/22L', status: 'closed', windDirection: 270, windSpeed: 12 }
  ];
};

const generateMockTaxiways = (): Taxiway[] => {
  const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
  const congestionLevels: Taxiway['congestionLevel'][] = ['low', 'medium', 'high'];
  
  return names.map((name, i) => ({
    id: `TW${name.charAt(0)}`,
    name,
    status: Math.random() > 0.3 ? 'clear' : 'occupied',
    occupiedBy: Math.random() > 0.5 ? `Aircraft${i + 1}` : undefined,
    congestionLevel: congestionLevels[Math.floor(Math.random() * congestionLevels.length)]
  }));
};

const generateMockWeather = (): WeatherData => ({
  visibility: 10,
  windDirection: 270,
  windSpeed: 12,
  temperature: 22,
  pressure: 29.92,
  conditions: 'Clear',
  lastUpdate: new Date()
});

export const useRealtimeData = () => {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [vehicles, setVehicles] = useState<GroundVehicle[]>([]);
  const [runways, setRunways] = useState<Runway[]>([]);
  const [taxiways, setTaxiways] = useState<Taxiway[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [automatedProcesses, setAutomatedProcesses] = useState<AutomatedProcess[]>([]);

  // Automated Pushback and Taxi function
  const initiateAutomatedPushbackTaxi = (aircraftCallsign: string, targetRunway: string = '27R'): string => {
    const aircraft = aircraft.find(ac => ac.callsign === aircraftCallsign);
    if (!aircraft) return 'Aircraft not found';

    const processId = `AUTO_${Date.now()}`;
    const steps: AutomatedStep[] = [
      { id: '1', description: 'AI Route Calculation', status: 'pending' },
      { id: '2', description: 'Ground Vehicle Coordination', status: 'pending' },
      { id: '3', description: 'Pushback Clearance', status: 'pending' },
      { id: '4', description: 'Automated Pushback', status: 'pending' },
      { id: '5', description: 'Taxi Route Optimization', status: 'pending' },
      { id: '6', description: 'Automated Taxi to Runway', status: 'pending' },
      { id: '7', description: 'Hold Short Positioning', status: 'pending' }
    ];

    const newProcess: AutomatedProcess = {
      id: processId,
      type: 'pushback-taxi',
      aircraftId: aircraft.id,
      status: 'initiated',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes
      steps,
      currentStep: 0
    };

    setAutomatedProcesses(prev => [...prev, newProcess]);

    // Start the automation sequence
    setTimeout(() => executeAutomatedProcess(processId), 1000);

    return processId;
  };

  // Execute automated process steps
  const executeAutomatedProcess = (processId: string) => {
    const processSteps = [
      () => updateProcessStep(processId, 0, 'AI Route Calculation completed - 23% time reduction', 2000),
      () => updateProcessStep(processId, 1, 'Ground vehicles coordinated - Pushback tug assigned', 1500),
      () => updateProcessStep(processId, 2, 'Pushback clearance issued - Frequency 121.9', 1000),
      () => updateProcessStep(processId, 3, 'Automated pushback in progress', 3000),
      () => updateProcessStep(processId, 4, 'Taxi route optimized via Alpha-Bravo-Charlie', 2000),
      () => updateProcessStep(processId, 5, 'Automated taxi initiated - Ground radar tracking', 4000),
      () => updateProcessStep(processId, 6, 'Hold short positioning complete - Ready for takeoff', 1000)
    ];

    let currentStep = 0;
    const executeNext = () => {
      if (currentStep < processSteps.length) {
        processSteps[currentStep]();
        currentStep++;
      } else {
        // Complete the process
        setAutomatedProcesses(prev => 
          prev.map(p => p.id === processId ? { ...p, status: 'completed' as const } : p)
        );
      }
    };

    executeNext();
  };

  const updateProcessStep = (processId: string, stepIndex: number, completionMessage: string, nextDelay: number) => {
    setAutomatedProcesses(prev => 
      prev.map(process => {
        if (process.id === processId) {
          const updatedSteps = [...process.steps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            status: 'completed',
            timestamp: new Date(),
            data: { message: completionMessage }
          };
          
          return {
            ...process,
            steps: updatedSteps,
            currentStep: stepIndex + 1,
            status: stepIndex === process.steps.length - 1 ? 'completed' : 'in-progress'
          };
        }
        return process;
      })
    );

    // Update aircraft position and status during automation
    if (stepIndex >= 3) {
      setAircraft(prev => 
        prev.map(ac => {
          const process = automatedProcesses.find(p => p.id === processId);
          if (process && ac.id === process.aircraftId) {
            return {
              ...ac,
              status: stepIndex < 6 ? 'pushback' : 'taxiing',
              position: {
                x: ac.position.x + (stepIndex - 3) * 15,
                y: ac.position.y + (stepIndex - 3) * 10
              },
              automatedRoute: stepIndex >= 4 ? ['Alpha', 'Bravo', 'Charlie'] : undefined
            };
          }
          return ac;
        })
      );
    }

    // Schedule next step
    if (nextDelay > 0) {
      setTimeout(() => {
        setAutomatedProcesses(prev => 
          prev.map(p => {
            if (p.id === processId && stepIndex + 1 < p.steps.length) {
              const updatedSteps = [...p.steps];
              updatedSteps[stepIndex + 1] = {
                ...updatedSteps[stepIndex + 1],
                status: 'in-progress'
              };
              return { ...p, steps: updatedSteps };
            }
            return p;
          })
        );
      }, nextDelay);
    }
  };

  // Automated Conflict Resolution
  const initiateConflictResolution = (): string => {
    const processId = `CONFLICT_${Date.now()}`;
    const steps: AutomatedStep[] = [
      { id: '1', description: 'Threat Detection & Analysis', status: 'pending' },
      { id: '2', description: 'Alternative Route Calculation', status: 'pending' },
      { id: '3', description: 'Traffic Separation Commands', status: 'pending' },
      { id: '4', description: 'Automated Resolution Execution', status: 'pending' }
    ];

    const newProcess: AutomatedProcess = {
      id: processId,
      type: 'conflict-resolution',
      aircraftId: 'MULTIPLE',
      status: 'initiated',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 3 * 60 * 1000),
      steps,
      currentStep: 0
    };

    setAutomatedProcesses(prev => [...prev, newProcess]);
    setTimeout(() => executeAutomatedProcess(processId), 500);

    return processId;
  };

  // Automated Gate Optimization
  const initiateGateOptimization = (): string => {
    const processId = `GATE_OPT_${Date.now()}`;
    const steps: AutomatedStep[] = [
      { id: '1', description: 'Gate Utilization Analysis', status: 'pending' },
      { id: '2', description: 'Aircraft-Gate Matching', status: 'pending' },
      { id: '3', description: 'Turnaround Time Optimization', status: 'pending' },
      { id: '4', description: 'Gate Reassignment Execution', status: 'pending' }
    ];

    const newProcess: AutomatedProcess = {
      id: processId,
      type: 'gate-optimization',
      aircraftId: 'MULTIPLE',
      status: 'initiated',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000),
      steps,
      currentStep: 0
    };

    setAutomatedProcesses(prev => [...prev, newProcess]);
    setTimeout(() => executeAutomatedProcess(processId), 750);

    return processId;
  };

  useEffect(() => {
    // Initialize mock data
    setAircraft(generateMockAircraft());
    setVehicles(generateMockVehicles());
    setRunways(generateMockRunways());
    setTaxiways(generateMockTaxiways());
    setWeather(generateMockWeather());

    // Generate some mock gates
    const mockGates: Gate[] = Array.from({ length: 20 }, (_, i) => ({
      id: `G${i + 1}`,
      number: `${i + 1}`,
      status: Math.random() > 0.6 ? 'occupied' : 'available',
      type: Math.random() > 0.7 ? 'wide' : 'narrow',
      scheduledDeparture: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 3600000) : undefined,
      scheduledArrival: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 3600000) : undefined
    }));
    setGates(mockGates);

    // Generate some mock alerts
    const mockAlerts: Alert[] = [
      {
        id: 'ALT001',
        type: 'incursion',
        severity: 'high',
        message: 'Potential runway incursion detected - Runway 09L',
        timestamp: new Date(),
        resolved: false,
        location: 'Runway 09L'
      },
      {
        id: 'ALT002',
        type: 'conflict',
        severity: 'medium',
        message: 'Ground vehicle conflict predicted - Taxiway Alpha',
        timestamp: new Date(Date.now() - 300000),
        resolved: true,
        location: 'Taxiway Alpha'
      }
    ];
    setAlerts(mockAlerts);

    // Set up real-time updates
    const interval = setInterval(() => {
      setAircraft(prev => prev.map(ac => {
        // Don't update aircraft positions if they're under automated control
        const isAutomated = automatedProcesses.some(p => 
          p.aircraftId === ac.id && p.status === 'in-progress'
        );
        
        if (isAutomated) return ac;

        return {
          ...ac,
          position: {
            x: Math.max(50, Math.min(850, ac.position.x + (Math.random() - 0.5) * 10)),
            y: Math.max(50, Math.min(650, ac.position.y + (Math.random() - 0.5) * 10))
          },
          heading: ac.heading + (Math.random() - 0.5) * 5,
          lastUpdate: new Date()
        };
      }));

      setWeather(generateMockWeather());
    }, 5000);

    return () => clearInterval(interval);
  }, [automatedProcesses]);

  return {
    aircraft,
    vehicles,
    runways,
    taxiways,
    gates,
    weather,
    alerts,
    automatedProcesses,
    initiateAutomatedPushbackTaxi,
    initiateConflictResolution,
    initiateGateOptimization
  };
};