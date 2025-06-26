import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Zap, AlertTriangle, FileText, Download } from 'lucide-react';
import { useSimulationData } from '../hooks/useSimulationData';
import { SimulationEventType } from '../types/simulation';

export const SimulationControlPanel: React.FC = () => {
  const {
    simulationState,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    loadScenario,
    setTimeScale,
    injectEvent,
    getAvailableScenarios,
    exportLogs,
    getComplianceStatus
  } = useSimulationData();

  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [timeScale, setTimeScaleLocal] = useState<number>(1);
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
  const [showEventInjector, setShowEventInjector] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);

  useEffect(() => {
    const scenarios = getAvailableScenarios();
    setAvailableScenarios(scenarios);
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0]);
    }
  }, [getAvailableScenarios, selectedScenario]);

  useEffect(() => {
    const status = getComplianceStatus();
    setComplianceStatus(status);
  }, [getComplianceStatus, simulationState]);

  const handleScenarioChange = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const success = await loadScenario(scenarioId);
    if (!success) {
      console.error('Failed to load scenario');
    }
  };

  const handleTimeScaleChange = (scale: number) => {
    setTimeScaleLocal(scale);
    setTimeScale(scale);
  };

  const handlePlayPause = () => {
    if (!simulationState?.isRunning) {
      startSimulation();
    } else if (simulationState.isPaused) {
      resumeSimulation();
    } else {
      pauseSimulation();
    }
  };

  const handleEmergencyScenario = (type: string) => {
    const event = {
      id: `EMERGENCY_${Date.now()}`,
      timestamp: simulationState?.currentTime || 0,
      type: SimulationEventType.EMERGENCY_SCENARIO,
      parameters: {
        aircraft: 'SIM1001',
        emergencyType: type,
        priority: 'mayday',
        location: 'Runway 09L'
      },
      expectedComplianceResponse: 'Emergency protocol activation',
      loggingRequirements: ['DO-326A', 'Emergency Log'],
      dalLevel: 'A' as const,
      priority: 'critical' as const
    };
    
    injectEvent(event);
  };

  const handleSystemFault = () => {
    const event = {
      id: `FAULT_${Date.now()}`,
      timestamp: simulationState?.currentTime || 0,
      type: SimulationEventType.SYSTEM_FAULT,
      parameters: {
        systemComponent: 'Communication System',
        faultType: 'Radio Failure',
        severity: 'high',
        affectedPartition: 'DAL_B'
      },
      expectedComplianceResponse: 'Backup communication activation',
      loggingRequirements: ['DO-326A', 'System Fault Log'],
      dalLevel: 'B' as const,
      priority: 'high' as const
    };
    
    injectEvent(event);
  };

  const handleRunwayIncursion = () => {
    const event = {
      id: `INCURSION_${Date.now()}`,
      timestamp: simulationState?.currentTime || 0,
      type: SimulationEventType.ALERT_TRIGGER,
      parameters: {
        alertType: 'incursion',
        runway: '09L',
        aircraft: 'SIM1002',
        severity: 'critical'
      },
      expectedComplianceResponse: 'Immediate conflict resolution',
      loggingRequirements: ['DO-326A', 'Safety Alert Log'],
      dalLevel: 'A' as const,
      priority: 'critical' as const
    };
    
    injectEvent(event);
  };

  const handleExportLogs = (format: 'csv' | 'json' | 'do326a') => {
    const logs = exportLogs(format);
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_logs_${Date.now()}.${format === 'do326a' ? 'json' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'violation': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-yellow-400 font-mono text-lg font-bold">SIMULATION CONTROL PANEL</h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            simulationState?.isRunning 
              ? simulationState.isPaused 
                ? 'bg-yellow-400' 
                : 'bg-green-400 animate-pulse'
              : 'bg-gray-400'
          }`}></div>
          <span className="text-gray-300">
            {simulationState?.isRunning 
              ? simulationState.isPaused 
                ? 'PAUSED' 
                : 'RUNNING'
              : 'STOPPED'
            }
          </span>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
        <label className="block text-yellow-400 font-mono text-sm mb-2">SCENARIO SELECTION</label>
        <select
          value={selectedScenario}
          onChange={(e) => handleScenarioChange(e.target.value)}
          className="w-full bg-black border border-yellow-400/30 rounded px-3 py-2 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none"
        >
          <option value="">Select Scenario</option>
          {availableScenarios.map(scenario => (
            <option key={scenario} value={scenario}>
              {scenario.replace(/-/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Playback Controls */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
        <label className="block text-yellow-400 font-mono text-sm mb-2">PLAYBACK CONTROLS</label>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-10 h-10 bg-green-400/20 hover:bg-green-400/30 border border-green-400/50 rounded transition-all duration-200"
            disabled={!selectedScenario}
          >
            {simulationState?.isRunning && !simulationState.isPaused ? (
              <Pause className="w-5 h-5 text-green-400" />
            ) : (
              <Play className="w-5 h-5 text-green-400" />
            )}
          </button>
          
          <button
            onClick={stopSimulation}
            className="flex items-center justify-center w-10 h-10 bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded transition-all duration-200"
            disabled={!simulationState?.isRunning}
          >
            <Square className="w-5 h-5 text-red-400" />
          </button>
          
          <button
            onClick={resetSimulation}
            className="flex items-center justify-center w-10 h-10 bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 rounded transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5 text-blue-400" />
          </button>

          <div className="flex-1 ml-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm">
                {formatTime(simulationState?.currentTime || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Scale Control */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
        <label className="block text-yellow-400 font-mono text-sm mb-2">
          TIME SCALE: {timeScale}x
        </label>
        <input
          type="range"
          min="0.25"
          max="10"
          step="0.25"
          value={timeScale}
          onChange={(e) => handleTimeScaleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0.25x</span>
          <span>1x</span>
          <span>10x</span>
        </div>
      </div>

      {/* Emergency Scenarios */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
        <label className="block text-yellow-400 font-mono text-sm mb-2">EMERGENCY SCENARIOS</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleEmergencyScenario('engine_failure')}
            className="bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded px-3 py-2 text-xs text-red-400 font-mono transition-all duration-200"
            disabled={!simulationState?.isRunning}
          >
            ENGINE FAILURE
          </button>
          <button
            onClick={handleRunwayIncursion}
            className="bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded px-3 py-2 text-xs text-red-400 font-mono transition-all duration-200"
            disabled={!simulationState?.isRunning}
          >
            RUNWAY INCURSION
          </button>
          <button
            onClick={handleSystemFault}
            className="bg-orange-400/20 hover:bg-orange-400/30 border border-orange-400/50 rounded px-3 py-2 text-xs text-orange-400 font-mono transition-all duration-200"
            disabled={!simulationState?.isRunning}
          >
            SYSTEM FAULT
          </button>
          <button
            onClick={() => handleEmergencyScenario('medical_emergency')}
            className="bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded px-3 py-2 text-xs text-red-400 font-mono transition-all duration-200"
            disabled={!simulationState?.isRunning}
          >
            MEDICAL EMERGENCY
          </button>
        </div>
      </div>

      {/* Compliance Status */}
      {complianceStatus && (
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <label className="block text-yellow-400 font-mono text-sm mb-2">COMPLIANCE STATUS</label>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Status:</span>
              <span className={`font-mono font-bold ${getStatusColor(complianceStatus.overallStatus)}`}>
                {complianceStatus.overallStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DAL A Violations:</span>
              <span className="text-red-400 font-mono">{complianceStatus.dalAViolations?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DAL B Violations:</span>
              <span className="text-yellow-400 font-mono">{complianceStatus.dalBViolations?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time Violations:</span>
              <span className="text-orange-400 font-mono">{complianceStatus.responseTimeViolations?.length || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Export Controls */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
        <label className="block text-yellow-400 font-mono text-sm mb-2">EXPORT LOGS</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleExportLogs('csv')}
            className="bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 rounded px-2 py-1 text-xs text-blue-400 font-mono transition-all duration-200"
          >
            <Download className="w-3 h-3 inline mr-1" />
            CSV
          </button>
          <button
            onClick={() => handleExportLogs('json')}
            className="bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 rounded px-2 py-1 text-xs text-purple-400 font-mono transition-all duration-200"
          >
            <Download className="w-3 h-3 inline mr-1" />
            JSON
          </button>
          <button
            onClick={() => handleExportLogs('do326a')}
            className="bg-green-400/20 hover:bg-green-400/30 border border-green-400/50 rounded px-2 py-1 text-xs text-green-400 font-mono transition-all duration-200"
          >
            <Download className="w-3 h-3 inline mr-1" />
            DO-326A
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-gradient-to-r from-yellow-400/10 to-black border border-yellow-400/20 rounded p-2">
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="text-yellow-400 font-bold">
              {simulationState?.eventQueue?.length || 0}
            </div>
            <div className="text-gray-400">Events Queued</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">{timeScale}x</div>
            <div className="text-gray-400">Time Scale</div>
          </div>
          <div>
            <div className={`font-bold ${getStatusColor(complianceStatus?.overallStatus || 'unknown')}`}>
              {complianceStatus?.overallStatus?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="text-gray-400">Compliance</div>
          </div>
        </div>
      </div>
    </div>
  );
};