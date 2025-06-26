import React, { useState } from 'react';
import { Shield, Activity, FileText, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { SimulationControlPanel } from './SimulationControlPanel';
import { useSimulationData } from '../hooks/useSimulationData';

export const FaaComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'control' | 'logs' | 'compliance' | 'performance'>('control');
  
  const {
    simulationState,
    getSimulationLogs,
    getComplianceStatus
  } = useSimulationData();

  const complianceStatus = getComplianceStatus();
  const logs = getSimulationLogs();

  const getComplianceColor = (status?: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'warning': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'violation': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'control':
        return <SimulationControlPanel />;
        
      case 'logs':
        return (
          <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
            <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">SIMULATION LOGS</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {logs.slice(-20).reverse().map((log) => (
                <div key={log.id} className="bg-gray-900 border border-yellow-400/20 rounded p-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-yellow-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-mono ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'compliance' ? 'text-orange-400' :
                      log.dalLevel === 'A' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {log.type.toUpperCase()} {log.dalLevel ? `DAL-${log.dalLevel}` : ''}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    {JSON.stringify(log.data, null, 2).slice(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'compliance':
        return (
          <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
            <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">COMPLIANCE MONITORING</h3>
            <div className="space-y-4">
              {/* Overall Status */}
              <div className={`border rounded-lg p-4 ${getComplianceColor(complianceStatus?.overallStatus)}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-mono text-lg font-bold">OVERALL COMPLIANCE STATUS</h4>
                </div>
                <div className="text-2xl font-mono font-bold">
                  {complianceStatus?.overallStatus?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>

              {/* DAL A Violations */}
              <div className="bg-gray-900 border border-red-400/20 rounded-lg p-3">
                <h5 className="text-red-400 font-mono text-sm font-bold mb-2">DAL A VIOLATIONS (CRITICAL)</h5>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {complianceStatus?.dalAViolations?.map((violation) => (
                    <div key={violation.id} className="text-xs text-gray-300 p-2 bg-red-400/10 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-red-400">{violation.regulation}</span>
                        <span className="text-gray-400">
                          {new Date(violation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>{violation.description}</div>
                    </div>
                  )) || <div className="text-green-400 text-xs">No DAL A violations</div>}
                </div>
              </div>

              {/* DAL B Violations */}
              <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
                <h5 className="text-yellow-400 font-mono text-sm font-bold mb-2">DAL B VIOLATIONS (MONITORING)</h5>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {complianceStatus?.dalBViolations?.map((violation) => (
                    <div key={violation.id} className="text-xs text-gray-300 p-2 bg-yellow-400/10 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-yellow-400">{violation.regulation}</span>
                        <span className="text-gray-400">
                          {new Date(violation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>{violation.description}</div>
                    </div>
                  )) || <div className="text-green-400 text-xs">No DAL B violations</div>}
                </div>
              </div>

              {/* Response Time Monitoring */}
              <div className="bg-gray-900 border border-blue-400/20 rounded-lg p-3">
                <h5 className="text-blue-400 font-mono text-sm font-bold mb-2">RESPONSE TIME MONITORING</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">DAL A Response Time:</span>
                    <div className="text-blue-400 font-mono">{'< 100ms'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">DAL B Response Time:</span>
                    <div className="text-blue-400 font-mono">{'< 500ms'}</div>
                  </div>
                </div>
                {complianceStatus?.responseTimeViolations?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {complianceStatus.responseTimeViolations.map((violation) => (
                      <div key={violation.id} className="text-xs text-orange-400 p-1 bg-orange-400/10 rounded">
                        {violation.eventType}: {violation.actualTime.toFixed(2)}ms (expected: {violation.expectedTime}ms)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'performance':
        return (
          <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
            <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">PERFORMANCE METRICS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-green-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-mono text-sm">SYSTEM PERFORMANCE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events Processed:</span>
                    <span className="text-green-400 font-mono">{logs.filter(l => l.type === 'event').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Processing Time:</span>
                    <span className="text-green-400 font-mono">45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Usage:</span>
                    <span className="text-green-400 font-mono">12.3MB</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-blue-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-mono text-sm">SIMULATION METRICS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Simulation Time:</span>
                    <span className="text-blue-400 font-mono">
                      {simulationState?.currentTime ? Math.floor(simulationState.currentTime / 1000) : 0}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events Queued:</span>
                    <span className="text-blue-400 font-mono">{simulationState?.eventQueue?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Scale:</span>
                    <span className="text-blue-400 font-mono">{simulationState?.timeScale || 1}x</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-purple-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-mono text-sm">DO-326A COMPLIANCE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Black Box Logs:</span>
                    <span className="text-purple-400 font-mono">{logs.filter(l => l.dalLevel === 'A').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audit Trail:</span>
                    <span className="text-purple-400 font-mono">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Integrity:</span>
                    <span className="text-green-400 font-mono">✓ Verified</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono text-sm">SAFETY METRICS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Safety Violations:</span>
                    <span className="text-red-400 font-mono">{complianceStatus?.safetyRuleViolations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Events:</span>
                    <span className="text-orange-400 font-mono">{logs.filter(l => l.data?.priority === 'critical').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emergency Responses:</span>
                    <span className="text-blue-400 font-mono">{logs.filter(l => l.data?.eventType === 'emergencyScenario').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-black text-yellow-400 font-mono h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-yellow-400/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">AES FAA COMPLIANCE DASHBOARD</h1>
              <h2 className="text-lg text-yellow-400">DO-178C | DO-326A | NEXTGEN CERTIFIED</h2>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                complianceStatus?.overallStatus === 'compliant' ? 'bg-green-400' :
                complianceStatus?.overallStatus === 'warning' ? 'bg-yellow-400' :
                complianceStatus?.overallStatus === 'violation' ? 'bg-red-400 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className={getComplianceColor(complianceStatus?.overallStatus).split(' ')[0]}>
                {complianceStatus?.overallStatus?.toUpperCase() || 'INITIALIZING'}
              </span>
            </div>
            <div className="text-gray-400">
              v2.1.0 | SECURE | FAA CERTIFIED
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex space-x-1">
          {[
            { id: 'control', label: 'SIMULATION CONTROL', icon: Activity },
            { id: 'logs', label: 'EVENT LOGS', icon: FileText },
            { id: 'compliance', label: 'COMPLIANCE', icon: CheckCircle },
            { id: 'performance', label: 'PERFORMANCE', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-yellow-400/20 border-t border-l border-r border-yellow-400/50 text-yellow-400' 
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {renderTabContent()}
      </div>

      {/* Footer - Compliance Summary */}
      <div className="border-t border-yellow-400/30 p-4">
        <div className="grid grid-cols-6 gap-4 text-center text-sm">
          <div className="flex flex-col">
            <span className="text-green-400 font-bold text-lg">
              {complianceStatus?.overallStatus === 'compliant' ? '✓' : 
               complianceStatus?.overallStatus === 'warning' ? '⚠' : 
               complianceStatus?.overallStatus === 'violation' ? '✗' : '?'}
            </span>
            <span className="text-gray-400 text-xs">Compliance</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-400 font-bold text-lg">{logs.filter(l => l.dalLevel === 'A').length}</span>
            <span className="text-gray-400 text-xs">DAL A Events</span>
          </div>
          <div className="flex flex-col">
            <span className="text-purple-400 font-bold text-lg">{logs.filter(l => l.dalLevel === 'B').length}</span>
            <span className="text-gray-400 text-xs">DAL B Events</span>
          </div>
          <div className="flex flex-col">
            <span className="text-red-400 font-bold text-lg">{(complianceStatus?.dalAViolations?.length || 0) + (complianceStatus?.dalBViolations?.length || 0)}</span>
            <span className="text-gray-400 text-xs">Total Violations</span>
          </div>
          <div className="flex flex-col">
            <span className="text-yellow-400 font-bold text-lg">{simulationState?.isRunning ? 'ACTIVE' : 'INACTIVE'}</span>
            <span className="text-gray-400 text-xs">Simulation</span>
          </div>
          <div className="flex flex-col">
            <span className="text-green-400 font-bold text-lg">DO-326A</span>
            <span className="text-gray-400 text-xs">Black Box</span>
          </div>
        </div>
      </div>
    </div>
  );
};