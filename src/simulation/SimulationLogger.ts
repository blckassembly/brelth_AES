import { SimulationLog, SimulationEvent, ComplianceViolation } from '../types/simulation';

export class SimulationLogger {
  private logs: SimulationLog[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private isLogging: boolean = true;

  constructor() {
    this.startPerformanceMonitoring();
  }

  // Core logging methods
  logEvent(event: SimulationEvent, data?: any): void {
    if (!this.isLogging) return;

    const log: SimulationLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventId: event.id,
      type: 'event',
      data: {
        eventType: event.type,
        parameters: event.parameters,
        dalLevel: event.dalLevel,
        priority: event.priority,
        additionalData: data
      },
      dalLevel: event.dalLevel
    };

    this.logs.push(log);
    this.enforceLogRetention();
  }

  logResponse(eventId: string, responseData: any, processingTime: number): void {
    if (!this.isLogging) return;

    const log: SimulationLog = {
      id: `RESP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventId: eventId,
      type: 'response',
      data: {
        responseData,
        processingTime,
        systemState: this.captureSystemSnapshot()
      }
    };

    this.logs.push(log);
  }

  logCompliance(violation: ComplianceViolation): void {
    if (!this.isLogging) return;

    const log: SimulationLog = {
      id: `COMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventId: violation.eventId,
      type: 'compliance',
      data: {
        violationType: 'violation',
        regulation: violation.regulation,
        description: violation.description,
        severity: violation.severity,
        violationId: violation.id
      }
    };

    this.logs.push(log);
  }

  logPerformance(metric: PerformanceMetric): void {
    if (!this.isLogging) return;

    const log: SimulationLog = {
      id: `PERF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'performance',
      data: metric
    };

    this.logs.push(log);
    this.performanceMetrics.push(metric);
  }

  logError(error: Error, context?: any): void {
    const log: SimulationLog = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'error',
      data: {
        errorMessage: error.message,
        errorStack: error.stack,
        context: context,
        severity: 'high'
      }
    };

    this.logs.push(log);
  }

  // Data export methods
  exportLogsAsCSV(): string {
    const headers = ['Timestamp', 'Type', 'Event ID', 'DAL Level', 'Data'];
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.type,
      log.eventId || '',
      log.dalLevel || '',
      JSON.stringify(log.data)
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  exportLogsAsJSON(): string {
    return JSON.stringify({
      exportTimestamp: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs,
      performanceMetrics: this.performanceMetrics,
      summary: this.generateLogSummary()
    }, null, 2);
  }

  exportDO326ACompliantLog(): string {
    // Export in DO-326A compliant format
    const do326aLogs = this.logs.filter(log => 
      log.dalLevel === 'A' || log.type === 'compliance' || log.type === 'error'
    );

    const do326aFormat = {
      header: {
        standard: 'DO-326A',
        version: '1.0',
        aircraft: 'AES-SIM',
        timestamp: new Date().toISOString(),
        totalRecords: do326aLogs.length
      },
      records: do326aLogs.map(log => ({
        recordId: log.id,
        timestamp: new Date(log.timestamp).toISOString(),
        eventType: log.type,
        dalLevel: log.dalLevel,
        severity: this.getDO326ASeverity(log),
        data: log.data,
        checksum: this.calculateChecksum(log)
      }))
    };

    return JSON.stringify(do326aFormat, null, 2);
  }

  // Utility methods
  getLogs(filter?: LogFilter): SimulationLog[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.type) {
        filteredLogs = filteredLogs.filter(log => log.type === filter.type);
      }
      if (filter.dalLevel) {
        filteredLogs = filteredLogs.filter(log => log.dalLevel === filter.dalLevel);
      }
      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endTime!);
      }
      if (filter.eventId) {
        filteredLogs = filteredLogs.filter(log => log.eventId === filter.eventId);
      }
    }

    return filteredLogs;
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  clearLogs(): void {
    this.logs = [];
    this.performanceMetrics = [];
  }

  setLogging(enabled: boolean): void {
    this.isLogging = enabled;
  }

  // Private helper methods
  private enforceLogRetention(): void {
    const maxLogs = 10000; // Maximum number of logs to retain
    if (this.logs.length > maxLogs) {
      this.logs = this.logs.slice(-maxLogs);
    }
  }

  private captureSystemSnapshot(): any {
    return {
      timestamp: Date.now(),
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      logCount: this.logs.length,
      performanceMetricCount: this.performanceMetrics.length
    };
  }

  private generateLogSummary(): any {
    const summary = {
      totalLogs: this.logs.length,
      logsByType: {} as Record<string, number>,
      logsByDALLevel: {} as Record<string, number>,
      errorCount: 0,
      complianceViolations: 0,
      averageProcessingTime: 0
    };

    this.logs.forEach(log => {
      // Count by type
      summary.logsByType[log.type] = (summary.logsByType[log.type] || 0) + 1;
      
      // Count by DAL level
      if (log.dalLevel) {
        summary.logsByDALLevel[log.dalLevel] = (summary.logsByDALLevel[log.dalLevel] || 0) + 1;
      }
      
      // Count errors
      if (log.type === 'error') {
        summary.errorCount++;
      }
      
      // Count compliance violations
      if (log.type === 'compliance' && log.data.violationType === 'violation') {
        summary.complianceViolations++;
      }
    });

    // Calculate average processing time
    const responseLogs = this.logs.filter(log => log.type === 'response');
    if (responseLogs.length > 0) {
      const totalTime = responseLogs.reduce((sum, log) => 
        sum + (log.data.processingTime || 0), 0
      );
      summary.averageProcessingTime = totalTime / responseLogs.length;
    }

    return summary;
  }

  private getDO326ASeverity(log: SimulationLog): string {
    if (log.type === 'error') return 'CRITICAL';
    if (log.type === 'compliance' && log.data.severity === 'critical') return 'CRITICAL';
    if (log.dalLevel === 'A') return 'HIGH';
    return 'MEDIUM';
  }

  private calculateChecksum(log: SimulationLog): string {
    // Simple checksum calculation for DO-326A compliance
    const data = JSON.stringify(log.data);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      if (this.isLogging) {
        const metric: PerformanceMetric = {
          timestamp: Date.now(),
          type: 'system',
          value: this.logs.length,
          unit: 'logs',
          description: 'Current log count'
        };
        
        this.performanceMetrics.push(metric);
        
        // Keep only last 1000 performance metrics
        if (this.performanceMetrics.length > 1000) {
          this.performanceMetrics = this.performanceMetrics.slice(-1000);
        }
      }
    }, 30000); // Every 30 seconds
  }
}

// Supporting interfaces
interface PerformanceMetric {
  timestamp: number;
  type: string;
  value: number;
  unit: string;
  description: string;
}

interface LogFilter {
  type?: 'event' | 'response' | 'compliance' | 'performance' | 'error';
  dalLevel?: 'A' | 'B';
  startTime?: number;
  endTime?: number;
  eventId?: string;
}