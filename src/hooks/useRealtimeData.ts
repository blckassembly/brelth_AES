import { useState, useEffect, useCallback } from 'react';
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
  error?: string;
}

export interface AutomatedStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: Date;
  data?: any;
  error?: string;
}

// Enhanced mock data generators for stress testing
const generateMockAircraft = (): Aircraft[] => {
  const types = ['B737', 'A320', 'B777', 'A350', 'C172', 'G650'];
  const statuses: Aircraft['status'][] = ['taxiing', 'holding', 'pushback', 'parked'];
  const airlines = ['UAL', 'DAL', 'AAL', 'SWA', 'JBU', 'DL', 'AA', 'UA', 'WN', 'B6'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `AC${String(i + 1).padStart(3, '0')}`,
    callsign: `${airlines[Math.floor(Math.random() * airlines.length)]}${Math.floor(Math.random() * 9000) + 1000}`,
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
    automatedRoute: undefined
  }));
};

const generateMockVehicles = (): GroundVehicle[] => {
  const types: GroundVehicle['type'][] = ['pushback', 'follow-me', 'emergency', 'maintenance', 'fuel'];
  const statuses: GroundVehicle['status'][] = ['active', 'idle', 'emergency'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `GV${String(i + 1).padStart(3, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    position: {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdate: new Date(),
    assignedAircraft: Math.random() > 0.7 ? `AC${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}` : undefined,
    automatedTask: undefined
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
  const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
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
  visibility: 8 + Math.random() * 4,
  windDirection: 270 + Math.floor(Math.random() * 20) - 10,
  windSpeed: 10 + Math.floor(Math.random() * 8),
  temperature: 20 + Math.floor(Math.random() * 10),
  pressure: 29.80 + Math.random() * 0.40,
  conditions: ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)],
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

  // Enhanced step delay calculation for realistic timing
  const getStepDelay = (stepIndex: number): number => {
    const baseTimes = [2000, 1500, 1000, 3000, 2000, 4000, 1000];
    return baseTimes[stepIndex] || 1500;
  };

  const getStepCompletionMessage = (stepIndex: number): string => {
    const messages = [
      'AI Route Calculation completed - 23% time reduction',
      'Ground vehicles coordinated - Pushback tug assigned',
      'Pushback clearance issued - Frequency 121.9',
      'Automated pushback in progress',
      'Taxi route optimized via Alpha-Bravo-Charlie',
      'Automated taxi initiated - Ground radar tracking',
      'Hold short positioning complete - Ready for takeoff'
    ];
    return messages[stepIndex] || 'Step completed';
  };

  // Enhanced automated process execution with better error handling
  const executeAutomatedProcess = useCallback((processId: string) => {
    const process = automatedProcesses.find(p => p.id === processId);
    if (!process) {
      console.error('Process not found:', processId);
      return;
    }

    const executeStep = (stepIndex: number) => {
      try {
        if (stepIndex >= process.steps.length) {
          // Complete the process
          setAutomatedProcesses(prev => 
            prev.map(p => p.id === processId ? { ...p, status: 'completed' as const } : p)
          );
          return;
        }

        // Mark current step as in-progress
        setAutomatedProcesses(prev => 
          prev.map(p => {
            if (p.id === processId) {
              const updatedSteps = [...p.steps];
              updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                status: 'in-progress'
              };
              return { ...p, steps: updatedSteps, status: 'in-progress' as const };
            }
            return p;
          })
        );

        // Update entity state during automation
        updateEntityStateDuringAutomation(processId, stepIndex);

        // Complete the step after delay
        setTimeout(() => {
          try {
            setAutomatedProcesses(prev => 
              prev.map(p => {
                if (p.id === processId) {
                  const updatedSteps = [...p.steps];
                  updatedSteps[stepIndex] = {
                    ...updatedSteps[stepIndex],
                    status: 'completed',
                    timestamp: new Date(),
                    data: { message: getStepCompletionMessage(stepIndex) }
                  };
                  
                  return {
                    ...p,
                    steps: updatedSteps,
                    currentStep: stepIndex + 1
                  };
                }
                return p;
              })
            );

            // Schedule next step
            setTimeout(() => executeStep(stepIndex + 1), 500);
          } catch (error) {
            console.error('Error completing step:', error);
            setAutomatedProcesses(prev => 
              prev.map(p => p.id === processId ? { 
                ...p, 
                status: 'failed' as const,
                error: 'Step execution failed'
              } : p)
            );
          }
        }, getStepDelay(stepIndex));

      } catch (error) {
        console.error('Error executing step:', error);
        setAutomatedProcesses(prev => 
          prev.map(p => p.id === processId ? { 
            ...p, 
            status: 'failed' as const,
            error: 'Process execution failed'
          } : p)
        );
      }
    };

    executeStep(0);
  }, [automatedProcesses]);

  // Enhanced entity state updates during automation
  const updateEntityStateDuringAutomation = useCallback((processId: string, stepIndex: number) => {
    const process = automatedProcesses.find(p => p.id === processId);
    if (!process) return;

    if (process.type === 'pushback-taxi' && stepIndex >= 3) {
      setAircraft(prev => 
        prev.map(ac => {
          if (ac.id === process.aircraftId) {
            const newStatus = stepIndex < 6 ? 'pushback' : 'taxiing';
            const positionDelta = (stepIndex - 3) * 15;
            
            return {
              ...ac,
              status: newStatus,
              position: {
                x: Math.max(50, Math.min(850, ac.position.x + positionDelta)),
                y: Math.max(50, Math.min(650, ac.position.y + positionDelta * 0.7))
              },
              automatedRoute: stepIndex >= 4 ? ['Alpha', 'Bravo', 'Charlie'] : undefined,
              lastUpdate: new Date()
            };
          }
          return ac;
        })
      );

      // Update assigned ground vehicles
      setVehicles(prev =>
        prev.map(vehicle => {
          if (vehicle.type === 'pushback' && !vehicle.assignedAircraft) {
            return {
              ...vehicle,
              assignedAircraft: process.aircraftId,
              automatedTask: 'pushback-assist',
              status: 'active' as const,
              lastUpdate: new Date()
            };
          }
          return vehicle;
        })
      );
    }
  }, [automatedProcesses]);

  // Automated Pushback and Taxi function with enhanced error handling
  const initiateAutomatedPushbackTaxi = useCallback((aircraftCallsign: string, targetRunway: string = '27R'): string => {
    try {
      const targetAircraft = aircraft.find(ac => ac.callsign === aircraftCallsign);
      if (!targetAircraft) {
        console.error('Aircraft not found:', aircraftCallsign);
        return 'Aircraft not found';
      }

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
        aircraftId: targetAircraft.id,
        status: 'initiated',
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + 8 * 60 * 1000),
        steps,
        currentStep: 0
      };

      setAutomatedProcesses(prev => [...prev, newProcess]);
      setTimeout(() => executeAutomatedProcess(processId), 1000);

      return processId;
    } catch (error) {
      console.error('Error initiating automated pushback taxi:', error);
      return 'Error: Failed to initiate process';
    }
  }, [aircraft, executeAutomatedProcess]);

  // Enhanced conflict resolution with error handling
  const initiateConflictResolution = useCallback((): string => {
    try {
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
    } catch (error) {
      console.error('Error initiating conflict resolution:', error);
      return 'Error: Failed to initiate conflict resolution';
    }
  }, [executeAutomatedProcess]);

  // Enhanced gate optimization with error handling
  const initiateGateOptimization = useCallback((): string => {
    try {
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
    } catch (error) {
      console.error('Error initiating gate optimization:', error);
      return 'Error: Failed to initiate gate optimization';
    }
  }, [executeAutomatedProcess]);

  useEffect(() => {
    // Initialize mock data
    try {
      setAircraft(generateMockAircraft());
      setVehicles(generateMockVehicles());
      setRunways(generateMockRunways());
      setTaxiways(generateMockTaxiways());
      setWeather(generateMockWeather());

      // Generate mock gates with enhanced data
      const mockGates: Gate[] = Array.from({ length: 25 }, (_, i) => ({
        id: `G${i + 1}`,
        number: `${i + 1}`,
        status: Math.random() > 0.6 ? 'occupied' : Math.random() > 0.9 ? 'maintenance' : 'available',
        type: Math.random() > 0.7 ? 'wide' : 'narrow',
        scheduledDeparture: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 3600000) : undefined,
        scheduledArrival: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 3600000) : undefined
      }));
      setGates(mockGates);

      // Generate enhanced mock alerts
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
        },
        {
          id: 'ALT003',
          type: 'weather',
          severity: 'low',
          message: 'Wind conditions changing - Monitor crosswind components',
          timestamp: new Date(Date.now() - 600000),
          resolved: false,
          location: 'All Runways'
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }

    // Enhanced real-time updates with better performance
    const updateInterval = setInterval(() => {
      try {
        setAircraft(prev => prev.map(ac => {
          // Don't update aircraft positions if they're under automated control
          const isAutomated = automatedProcesses.some(p => 
            p.aircraftId === ac.id && p.status === 'in-progress'
          );
          
          if (isAutomated) return ac;

          return {
            ...ac,
            position: {
              x: Math.max(50, Math.min(850, ac.position.x + (Math.random() - 0.5) * 8)),
              y: Math.max(50, Math.min(650, ac.position.y + (Math.random() - 0.5) * 8))
            },
            heading: (ac.heading + (Math.random() - 0.5) * 3 + 360) % 360,
            lastUpdate: new Date()
          };
        }));

        // Update weather data
        setWeather(generateMockWeather());

        // Randomly update vehicle positions
        setVehicles(prev => prev.map(vehicle => {
          const isAssigned = vehicle.assignedAircraft && vehicle.automatedTask;
          if (isAssigned) return vehicle;

          return {
            ...vehicle,
            position: {
              x: Math.max(30, Math.min(870, vehicle.position.x + (Math.random() - 0.5) * 5)),
              y: Math.max(30, Math.min(670, vehicle.position.y + (Math.random() - 0.5) * 5))
            },
            lastUpdate: new Date()
          };
        }));
      } catch (error) {
        console.error('Error updating real-time data:', error);
      }
    }, 3000);

    // Cleanup completed processes periodically
    const cleanupInterval = setInterval(() => {
      setAutomatedProcesses(prev => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return prev.filter(p => 
          p.status === 'in-progress' || 
          p.status === 'initiated' || 
          p.startTime > fiveMinutesAgo
        );
      });
    }, 60000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(cleanupInterval);
    };
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