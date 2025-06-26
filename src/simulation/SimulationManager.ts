import { ScenarioConfig, SimulationEvent, SimulationState, SimulationEventType } from '../types/simulation';

export class SimulationManager {
  private state: SimulationState;
  private eventCallbacks: Map<string, Function[]> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private scenarios: Map<string, ScenarioConfig> = new Map();
  private startTime: number = 0;

  constructor(
    private timeScale: number = 1,
    private scenarioName: string | null = null,
    private initialStartTime: Date = new Date()
  ) {
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      timeScale: this.timeScale,
      activeScenario: this.scenarioName,
      eventQueue: [],
      complianceStatus: {
        dalAViolations: [],
        dalBViolations: [],
        responseTimeViolations: [],
        safetyRuleViolations: [],
        overallStatus: 'compliant'
      }
    };

    this.loadDefaultScenarios();
  }

  // Lifecycle management
  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.startTime = Date.now();
    
    this.emit('simulationStarted', { 
      scenario: this.state.activeScenario,
      startTime: this.startTime 
    });

    this.intervalId = setInterval(() => {
      this.tick();
    }, 100); // 100ms intervals
  }

  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    
    this.state.isPaused = true;
    this.emit('simulationPaused', { currentTime: this.state.currentTime });
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    
    this.state.isPaused = false;
    this.emit('simulationResumed', { currentTime: this.state.currentTime });
  }

  stop(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    this.state.isPaused = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('simulationStopped', { 
      finalTime: this.state.currentTime,
      duration: Date.now() - this.startTime 
    });
  }

  reset(): void {
    this.stop();
    this.state.currentTime = 0;
    this.state.eventQueue = [];
    this.state.complianceStatus = {
      dalAViolations: [],
      dalBViolations: [],
      responseTimeViolations: [],
      safetyRuleViolations: [],
      overallStatus: 'compliant'
    };

    if (this.state.activeScenario) {
      this.loadScenario(this.state.activeScenario);
    }

    this.emit('simulationReset', {});
  }

  // Scenario management
  async loadScenario(scenarioId: string): Promise<boolean> {
    try {
      const scenario = this.scenarios.get(scenarioId);
      if (!scenario) {
        console.error(`Scenario ${scenarioId} not found`);
        return false;
      }

      this.state.activeScenario = scenarioId;
      this.state.eventQueue = [...scenario.timeline].sort((a, b) => a.timestamp - b.timestamp);
      
      this.emit('scenarioLoaded', { 
        scenario: scenario,
        eventCount: this.state.eventQueue.length 
      });

      return true;
    } catch (error) {
      console.error('Error loading scenario:', error);
      return false;
    }
  }

  loadScenarioFromJson(scenarioJson: string): boolean {
    try {
      const scenario: ScenarioConfig = JSON.parse(scenarioJson);
      this.scenarios.set(scenario.id, scenario);
      return this.loadScenario(scenario.id);
    } catch (error) {
      console.error('Error parsing scenario JSON:', error);
      return false;
    }
  }

  // Event management
  injectEvent(event: SimulationEvent): void {
    // Insert event into queue maintaining chronological order
    const insertIndex = this.state.eventQueue.findIndex(e => e.timestamp > event.timestamp);
    if (insertIndex === -1) {
      this.state.eventQueue.push(event);
    } else {
      this.state.eventQueue.splice(insertIndex, 0, event);
    }

    this.emit('eventInjected', { event });
  }

  // Time management
  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.1, Math.min(10, scale));
    this.state.timeScale = this.timeScale;
    this.emit('timeScaleChanged', { timeScale: this.timeScale });
  }

  // State access
  getState(): SimulationState {
    return { ...this.state };
  }

  getAvailableScenarios(): string[] {
    return Array.from(this.scenarios.keys());
  }

  getScenario(scenarioId: string): ScenarioConfig | undefined {
    return this.scenarios.get(scenarioId);
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // Core simulation loop
  private tick(): void {
    if (this.state.isPaused) return;

    const realTimeElapsed = Date.now() - this.startTime;
    this.state.currentTime = realTimeElapsed * this.timeScale;

    // Process events that should occur at current time
    while (this.state.eventQueue.length > 0 && 
           this.state.eventQueue[0].timestamp <= this.state.currentTime) {
      const event = this.state.eventQueue.shift()!;
      this.processEvent(event);
    }

    // Emit tick event for UI updates
    this.emit('tick', { 
      currentTime: this.state.currentTime,
      queueLength: this.state.eventQueue.length 
    });
  }

  private processEvent(event: SimulationEvent): void {
    const startTime = performance.now();
    
    try {
      this.emit('eventProcessing', { event });
      
      // Process the event based on its type
      switch (event.type) {
        case SimulationEventType.AIRCRAFT_MOVEMENT:
          this.emit('aircraftMovement', event);
          break;
        case SimulationEventType.VEHICLE_DISPATCH:
          this.emit('vehicleDispatch', event);
          break;
        case SimulationEventType.RUNWAY_STATUS_CHANGE:
          this.emit('runwayStatusChange', event);
          break;
        case SimulationEventType.ALERT_TRIGGER:
          this.emit('alertTrigger', event);
          break;
        case SimulationEventType.WEATHER_UPDATE:
          this.emit('weatherUpdate', event);
          break;
        case SimulationEventType.COMMUNICATION_FAILURE:
          this.emit('communicationFailure', event);
          break;
        case SimulationEventType.EMERGENCY_SCENARIO:
          this.emit('emergencyScenario', event);
          break;
        case SimulationEventType.SYSTEM_FAULT:
          this.emit('systemFault', event);
          break;
        case SimulationEventType.COMPLIANCE_CHECK:
          this.emit('complianceCheck', event);
          break;
      }

      const processingTime = performance.now() - startTime;
      
      // Check for response time compliance
      if (event.dalLevel === 'A' && processingTime > 100) { // 100ms threshold for DAL A
        this.state.complianceStatus.responseTimeViolations.push({
          id: `RT_${Date.now()}`,
          timestamp: this.state.currentTime,
          expectedTime: 100,
          actualTime: processingTime,
          eventType: event.type,
          severity: 'violation'
        });
      }

      this.emit('eventProcessed', { 
        event, 
        processingTime,
        complianceStatus: this.state.complianceStatus 
      });

    } catch (error) {
      console.error('Error processing event:', error);
      this.emit('eventError', { event, error });
    }
  }

  private loadDefaultScenarios(): void {
    // Load default scenarios - in a real implementation, these would come from JSON files
    const criticalOpsScenario: ScenarioConfig = {
      id: 'critical-operations',
      name: 'Critical Operations Test',
      description: 'Tests system response to critical operational scenarios',
      initialState: {
        aircraft: [],
        vehicles: [],
        runways: [],
        taxiways: [],
        gates: [],
        weather: {
          visibility: 10,
          windDirection: 270,
          windSpeed: 15,
          temperature: 22,
          pressure: 29.92,
          conditions: 'Clear',
          lastUpdate: new Date()
        }
      },
      timeline: [
        {
          id: 'runway-incursion-1',
          timestamp: 30000, // 30 seconds
          type: SimulationEventType.ALERT_TRIGGER,
          parameters: {
            alertType: 'incursion',
            runway: '09L',
            aircraft: 'UAL234'
          },
          expectedComplianceResponse: 'Immediate alert and conflict resolution',
          loggingRequirements: ['DO-326A', 'Event Log', 'Safety Alert'],
          dalLevel: 'A',
          priority: 'critical'
        },
        {
          id: 'emergency-response-1',
          timestamp: 60000, // 1 minute
          type: SimulationEventType.EMERGENCY_SCENARIO,
          parameters: {
            aircraft: 'DAL456',
            emergencyType: 'engine_failure',
            priority: 'mayday'
          },
          expectedComplianceResponse: 'Emergency protocol activation',
          loggingRequirements: ['DO-326A', 'Emergency Log'],
          dalLevel: 'A',
          priority: 'critical'
        }
      ],
      complianceTestCases: [
        {
          id: 'dal-a-isolation',
          regulation: 'DO-178C DAL A',
          requirement: 'Safety-critical functions must be isolated',
          expectedOutcome: 'No interference between DAL A and DAL B functions',
          testType: 'isolation'
        }
      ],
      systemParameters: {
        duration: 10, // 10 minutes
        criticalResponseTime: 5, // 5 seconds
        maxConcurrentEvents: 3
      }
    };

    this.scenarios.set(criticalOpsScenario.id, criticalOpsScenario);
  }
}