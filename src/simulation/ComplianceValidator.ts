import { SimulationEvent, ComplianceViolation, ComplianceStatus, SimulationEventType } from '../types/simulation';

export class ComplianceValidator {
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private violationHistory: ComplianceViolation[] = [];

  constructor() {
    this.initializeComplianceRules();
  }

  validateEvent(event: SimulationEvent, systemState: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const timestamp = Date.now();

    // Check DAL A/B partition isolation
    if (event.dalLevel === 'A') {
      const isolationViolation = this.checkPartitionIsolation(event, systemState);
      if (isolationViolation) {
        violations.push({
          id: `ISO_${timestamp}`,
          timestamp: timestamp,
          regulation: 'DO-178C DAL A',
          description: `Partition isolation violation: ${isolationViolation}`,
          severity: 'critical',
          eventId: event.id
        });
      }
    }

    // Check safety rules
    const safetyViolations = this.checkSafetyRules(event, systemState);
    violations.push(...safetyViolations);

    // Check response time requirements
    if (event.priority === 'critical') {
      const responseTimeViolation = this.checkResponseTime(event);
      if (responseTimeViolation) {
        violations.push({
          id: `RT_${timestamp}`,
          timestamp: timestamp,
          regulation: 'DO-178C Response Time',
          description: `Response time violation: ${responseTimeViolation}`,
          severity: 'high',
          eventId: event.id
        });
      }
    }

    // Check logging requirements
    const loggingViolation = this.checkLoggingCompliance(event);
    if (loggingViolation) {
      violations.push({
        id: `LOG_${timestamp}`,
        timestamp: timestamp,
        regulation: 'DO-326A Logging',
        description: `Logging compliance violation: ${loggingViolation}`,
        severity: 'medium',
        eventId: event.id
      });
    }

    // Store violations for history
    this.violationHistory.push(...violations);

    return violations;
  }

  getComplianceStatus(): ComplianceStatus {
    const dalAViolations = this.violationHistory.filter(v => 
      v.regulation.includes('DAL A') && v.timestamp > Date.now() - 3600000 // Last hour
    );
    
    const dalBViolations = this.violationHistory.filter(v => 
      v.regulation.includes('DAL B') && v.timestamp > Date.now() - 3600000
    );

    const responseTimeViolations = this.violationHistory
      .filter(v => v.regulation.includes('Response Time'))
      .map(v => ({
        id: v.id,
        timestamp: v.timestamp,
        expectedTime: 100, // Default expected time
        actualTime: 150, // This would be measured
        eventType: 'unknown',
        severity: 'violation' as const
      }));

    const safetyRuleViolations = this.violationHistory
      .filter(v => v.regulation.includes('Safety'))
      .map(v => ({
        id: v.id,
        timestamp: v.timestamp,
        rule: v.regulation,
        description: v.description,
        severity: v.severity === 'critical' ? 'critical' as const : 'warning' as const
      }));

    const overallStatus = dalAViolations.some(v => v.severity === 'critical') ? 'violation' :
                         dalAViolations.length > 0 || dalBViolations.length > 0 ? 'warning' : 'compliant';

    return {
      dalAViolations,
      dalBViolations,
      responseTimeViolations,
      safetyRuleViolations,
      overallStatus
    };
  }

  private checkPartitionIsolation(event: SimulationEvent, systemState: any): string | null {
    // Check if DAL A functions are properly isolated from DAL B
    const rule = this.complianceRules.get('partition_isolation');
    if (!rule) return null;

    // Simulate partition isolation check
    if (event.type === SimulationEventType.SYSTEM_FAULT && 
        event.parameters.affectedPartition === 'DAL_A' &&
        event.parameters.crossPartitionEffect === true) {
      return 'DAL A partition affected by DAL B failure';
    }

    return null;
  }

  private checkSafetyRules(event: SimulationEvent, systemState: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const timestamp = Date.now();

    // Runway incursion safety rule
    if (event.type === SimulationEventType.AIRCRAFT_MOVEMENT) {
      const runway = event.parameters.runway;
      const runwayOccupied = systemState.runways?.find((r: any) => 
        r.name === runway && r.status === 'occupied'
      );
      
      if (runwayOccupied && runwayOccupied.occupiedBy !== event.parameters.aircraft) {
        violations.push({
          id: `SAFETY_${timestamp}`,
          timestamp: timestamp,
          regulation: 'FAA Safety Rule - Runway Separation',
          description: `Potential runway incursion: ${event.parameters.aircraft} entering occupied runway ${runway}`,
          severity: 'critical',
          eventId: event.id
        });
      }
    }

    // Ground vehicle separation rule
    if (event.type === SimulationEventType.VEHICLE_DISPATCH) {
      const vehiclePosition = event.parameters.position;
      const aircraftInArea = systemState.aircraft?.some((a: any) => 
        Math.abs(a.position.x - vehiclePosition.x) < 50 && 
        Math.abs(a.position.y - vehiclePosition.y) < 50
      );

      if (aircraftInArea && event.parameters.vehicleType !== 'emergency') {
        violations.push({
          id: `SAFETY_${timestamp}_2`,
          timestamp: timestamp,
          regulation: 'FAA Safety Rule - Ground Vehicle Separation',
          description: `Ground vehicle dispatched too close to aircraft`,
          severity: 'high',
          eventId: event.id
        });
      }
    }

    return violations;
  }

  private checkResponseTime(event: SimulationEvent): string | null {
    // In a real implementation, this would measure actual response times
    const rule = this.complianceRules.get('response_time');
    if (!rule) return null;

    // Simulate response time check
    const simulatedResponseTime = Math.random() * 200; // 0-200ms
    
    if (event.dalLevel === 'A' && simulatedResponseTime > 100) {
      return `Response time ${simulatedResponseTime.toFixed(2)}ms exceeds 100ms requirement`;
    }
    
    if (event.dalLevel === 'B' && simulatedResponseTime > 500) {
      return `Response time ${simulatedResponseTime.toFixed(2)}ms exceeds 500ms requirement`;
    }

    return null;
  }

  private checkLoggingCompliance(event: SimulationEvent): string | null {
    // Check if event has required logging attributes
    if (!event.loggingRequirements || event.loggingRequirements.length === 0) {
      return 'Event missing logging requirements';
    }

    // Check for DO-326A compliance
    if (event.dalLevel === 'A' && !event.loggingRequirements.includes('DO-326A')) {
      return 'DAL A event missing DO-326A logging requirement';
    }

    return null;
  }

  private initializeComplianceRules(): void {
    this.complianceRules.set('partition_isolation', {
      id: 'partition_isolation',
      regulation: 'DO-178C',
      description: 'DAL A and DAL B partitions must be isolated',
      dalLevel: 'A',
      criticality: 'high'
    });

    this.complianceRules.set('response_time', {
      id: 'response_time',
      regulation: 'DO-178C',
      description: 'Critical functions must respond within specified time limits',
      dalLevel: 'A',
      criticality: 'high'
    });

    this.complianceRules.set('safety_separation', {
      id: 'safety_separation',
      regulation: 'FAA',
      description: 'Aircraft and ground vehicles must maintain safe separation',
      dalLevel: 'A',
      criticality: 'critical'
    });

    this.complianceRules.set('logging_compliance', {
      id: 'logging_compliance',
      regulation: 'DO-326A',
      description: 'All events must be logged per DO-326A requirements',
      dalLevel: 'B',
      criticality: 'medium'
    });
  }
}

interface ComplianceRule {
  id: string;
  regulation: string;
  description: string;
  dalLevel: 'A' | 'B';
  criticality: 'low' | 'medium' | 'high' | 'critical';
}