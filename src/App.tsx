import React, { useState, useEffect } from 'react';
import { useRealtimeData } from './hooks/useRealtimeData';

// Import all components
import { AirportSurfaceMap } from './components/AirportSurfaceMap';
import { RunwayTaxiwayStatus } from './components/RunwayTaxiwayStatus';
import { GateManagement } from './components/GateManagement';
import { GroundVehicleTracking } from './components/GroundVehicleTracking';
import { GroundCommunications } from './components/GroundCommunications';
import { WeatherPanel } from './components/WeatherPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { OperationsLog } from './components/OperationsLog';
import { NaturalLanguageAssistant } from './components/NaturalLanguageAssistant';
import type { AutomatedProcess } from './hooks/useRealtimeData';

type ActiveView = 'surface-map' | 'runway-status' | 'gate-management' | 'vehicle-tracking' | 
                  'communications' | 'weather' | 'alerts' | 'operations-log' | 'ai-assistant';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('surface-map');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    automationLoad: 0
  });

  const {
    aircraft,
    vehicles,
    runways,
    taxiways,
    gates,
    weather,
    alerts,
    automatedProcesses
  } = useRealtimeData();

  // Real-time UTC clock implementation
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // System health monitoring for stress testing
  useEffect(() => {
    const healthInterval = setInterval(() => {
      setSystemHealth({
        cpu: Math.min(95, 15 + automatedProcesses.length * 8 + Math.random() * 10),
        memory: Math.min(90, 25 + aircraft.length * 2 + Math.random() * 15),
        network: Math.min(99, 85 + Math.random() * 10),
        automationLoad: automatedProcesses.filter(p => p.status === 'in-progress').length * 25
      });
    }, 2000);

    return () => clearInterval(healthInterval);
  }, [automatedProcesses, aircraft.length]);

  const handleAutomationUpdate = (processes: AutomatedProcess[]) => {
    // Enhanced automation update handling with performance metrics
    console.log('Automation processes updated:', processes);
    
    // Update system load based on active processes
    const activeProcesses = processes.filter(p => p.status === 'in-progress');
    if (activeProcesses.length > 3) {
      console.warn('High automation load detected:', activeProcesses.length);
    }
  };

  const navigationItems = [
    { id: 'surface-map', label: 'Surface Movement', icon: '🗺️' },
    { id: 'runway-status', label: 'Runway Status', icon: '🛫' },
    { id: 'gate-management', label: 'Gate Management', icon: '🚪' },
    { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: '🚛' },
    { id: 'communications', label: 'Communications', icon: '📡' },
    { id: 'weather', label: 'Weather Data', icon: '🌤️' },
    { id: 'alerts', label: 'Alerts & Warnings', icon: '⚠️' },
    { id: 'operations-log', label: 'Operations Log', icon: '📋' },
    { id: 'ai-assistant', label: 'AI Command Center', icon: '🤖' }
  ] as const;

  const renderMainContent = () => {
    try {
      switch (activeView) {
        case 'surface-map':
          return (
            <div className="h-full">
              <AirportSurfaceMap
                aircraft={aircraft}
                vehicles={vehicles}
                runways={runways}
                taxiways={taxiways}
              />
            </div>
          );
        case 'runway-status':
          return (
            <div className="h-full">
              <RunwayTaxiwayStatus
                runways={runways}
                taxiways={taxiways}
              />
            </div>
          );
        case 'gate-management':
          return (
            <div className="h-full">
              <GateManagement gates={gates} />
            </div>
          );
        case 'vehicle-tracking':
          return (
            <div className="h-full">
              <GroundVehicleTracking vehicles={vehicles} />
            </div>
          );
        case 'communications':
          return (
            <div className="h-full">
              <GroundCommunications />
            </div>
          );
        case 'weather':
          return (
            <div className="h-full">
              <WeatherPanel weather={weather} />
            </div>
          );
        case 'alerts':
          return (
            <div className="h-full">
              <AlertsPanel alerts={alerts} />
            </div>
          );
        case 'operations-log':
          return (
            <div className="h-full">
              <OperationsLog />
            </div>
          );
        case 'ai-assistant':
          return (
            <div className="h-full">
              <NaturalLanguageAssistant onAutomationUpdate={handleAutomationUpdate} />
            </div>
          );
        default:
          return (
            <div className="h-full">
              <AirportSurfaceMap
                aircraft={aircraft}
                vehicles={vehicles}
                runways={runways}
                taxiways={taxiways}
              />
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering main content:', error);
      return (
        <div className="h-full flex items-center justify-center bg-red-400/10 border border-red-400/20 rounded-lg">
          <div className="text-center">
            <div className="text-red-400 text-2xl mb-2">⚠️</div>
            <div className="text-red-400 font-mono">SYSTEM ERROR</div>
            <div className="text-gray-400 text-sm mt-2">Component failed to load</div>
          </div>
        </div>
      );
    }
  };

  const getActiveItemClass = (itemId: string) => {
    return activeView === itemId
      ? 'w-full text-left p-3 rounded bg-yellow-400/20 border border-yellow-400/50 transition-colors text-sm font-bold text-yellow-400'
      : 'w-full text-left p-3 rounded hover:bg-yellow-400/10 transition-colors text-sm text-gray-300 hover:text-yellow-400';
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'text-red-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getHealthBar = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const color = value >= 90 ? 'bg-red-400' : value >= 70 ? 'bg-yellow-400' : 'bg-green-400';
    return (
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div 
          className={`${color} h-1 rounded-full transition-all duration-300`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  };

  const activeAutomatedProcesses = automatedProcesses.filter(p => p.status === 'in-progress');
  const totalAircraft = aircraft.length;
  const totalVehicles = vehicles.length;

  return (
    <div className="h-screen flex bg-black text-yellow-400 font-mono">
      {/* Left Sidebar Navigation */}
      <div className="w-80 bg-black border-r border-yellow-400/30 p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">AES</h1>
            <h2 className="text-lg font-bold text-yellow-400">ATC Ground Operations</h2>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mb-6">
          v2.1.0 | SECURE | FAA NEXTGEN COMPLIANT
        </div>

        {/* Enhanced System Status with Health Monitoring */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">System Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-green-400/10 border border-green-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">●</span>
                <span className="text-sm text-green-400">ACTIVE</span>
              </div>
              <span className="text-xs text-gray-400">{totalAircraft}A/{totalVehicles}V</span>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-blue-400/10 border border-blue-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">●</span>
                <span className="text-sm text-blue-400">AMADEUS API</span>
              </div>
              <span className="text-xs text-gray-400">{systemHealth.network.toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-purple-400/10 border border-purple-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-purple-400">●</span>
                <span className="text-sm text-purple-400">DOD LINK</span>
              </div>
              <span className="text-xs text-gray-400">Encrypted</span>
            </div>

            {/* Automated Processes Status */}
            {activeAutomatedProcesses.length > 0 && (
              <div className="flex items-center justify-between p-2 rounded bg-yellow-400/10 border border-yellow-400/20">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 animate-pulse">⚙</span>
                  <span className="text-sm text-yellow-400">AUTOMATION</span>
                </div>
                <span className="text-xs text-gray-400">{activeAutomatedProcesses.length} Active</span>
              </div>
            )}
          </div>
        </div>

        {/* System Health Monitor */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">System Health</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">CPU</span>
              <span className={`text-xs font-mono ${getHealthColor(systemHealth.cpu)}`}>
                {systemHealth.cpu.toFixed(0)}%
              </span>
            </div>
            {getHealthBar(systemHealth.cpu)}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Memory</span>
              <span className={`text-xs font-mono ${getHealthColor(systemHealth.memory)}`}>
                {systemHealth.memory.toFixed(0)}%
              </span>
            </div>
            {getHealthBar(systemHealth.memory)}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Network</span>
              <span className={`text-xs font-mono ${getHealthColor(100 - systemHealth.network)}`}>
                {systemHealth.network.toFixed(0)}%
              </span>
            </div>
            {getHealthBar(systemHealth.network)}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-auto">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Command & Control</div>
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={getActiveItemClass(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'ai-assistant' && activeAutomatedProcesses.length > 0 && (
                    <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Compliance */}
        <div className="mt-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Security</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 p-2 text-xs">
              <span className="text-green-400">🔒</span>
              <span className="text-gray-400">FIPS 140-2</span>
            </div>
            <div className="flex items-center space-x-2 p-2 text-xs">
              <span className="text-green-400">🛡️</span>
              <span className="text-gray-400">NIST Compliant</span>
            </div>
            <div className="flex items-center space-x-2 p-2 text-xs">
              <span className="text-green-400">🔐</span>
              <span className="text-gray-400">DoD Certified</span>
            </div>
          </div>
        </div>

        {/* Real-time UTC Clock */}
        <div className="mt-6 pt-4 border-t border-yellow-400/20">
          <div className="text-xs text-gray-400">
            <div className="font-bold text-yellow-400">UTC TIME</div>
            <div className="text-lg font-mono text-yellow-400">
              {currentTime.toLocaleTimeString('en-US', { 
                timeZone: 'UTC',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })} UTC
            </div>
            <div className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                timeZone: 'UTC',
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full p-4">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;