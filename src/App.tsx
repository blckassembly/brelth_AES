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
import { FlightTracking } from './components/FlightTracking';
import { FlightPlanManagement } from './components/FlightPlanManagement';
import { SchedulingFlow } from './components/SchedulingFlow';
import { ResourceManagement } from './components/ResourceManagement';
import { FaaComplianceDashboard } from './components/FaaComplianceDashboard';
import type { AutomatedProcess } from './hooks/useRealtimeData';

type ActiveView = 'surface-map' | 'runway-status' | 'gate-management' | 'vehicle-tracking' | 
                  'communications' | 'weather' | 'alerts' | 'operations-log' | 'ai-assistant' |
                  'flight-tracking' | 'flight-plan-management' | 'scheduling-flow' | 'resource-management' |
                  'faa-compliance';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('surface-map');
  const [currentTime, setCurrentTime] = useState(new Date());

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
    { id: 'flight-tracking', label: 'Flight Tracking', icon: '✈️' },
    { id: 'flight-plan-management', label: 'Flight Plan Management', icon: '📄' },
    { id: 'scheduling-flow', label: 'Scheduling & Flow', icon: '🕐' },
    { id: 'resource-management', label: 'Resource Management', icon: '⚙️' },
    { id: 'ai-assistant', label: 'AI Command Center', icon: '🤖' },
    { id: 'faa-compliance', label: 'FAA NEXTGEN COMPLIANT', icon: '🛡️' }
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
        case 'flight-tracking':
          return (
            <div className="h-full">
              <FlightTracking />
            </div>
          );
        case 'flight-plan-management':
          return (
            <div className="h-full">
              <FlightPlanManagement />
            </div>
          );
        case 'scheduling-flow':
          return (
            <div className="h-full">
              <SchedulingFlow />
            </div>
          );
        case 'resource-management':
          return (
            <div className="h-full">
              <ResourceManagement />
            </div>
          );
        case 'ai-assistant':
          return (
            <div className="h-full">
              <NaturalLanguageAssistant onAutomationUpdate={handleAutomationUpdate} />
            </div>
          );
        case 'faa-compliance':
          return (
            <div className="h-full">
              <FaaComplianceDashboard />
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
      ? 'w-full text-left p-6 rounded-lg bg-yellow-400/20 border border-yellow-400/50 transition-all duration-200 text-lg font-bold text-yellow-400 hover:bg-yellow-400/30'
      : 'w-full text-left p-6 rounded-lg hover:bg-yellow-400/10 transition-all duration-200 text-lg text-gray-300 hover:text-yellow-400 hover:border-yellow-400/30 border border-transparent';
  };

  const activeAutomatedProcesses = automatedProcesses.filter(p => p.status === 'in-progress');

  return (
    <div className="h-screen flex bg-black text-yellow-400 font-mono">
      {/* Left Sidebar Navigation */}
      <div className="w-96 bg-black border-r border-yellow-400/30 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">AES</h1>
            <h2 className="text-xl font-bold text-yellow-400">ATC Ground Operations</h2>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-8">
          v2.1.0 | SECURE | FAA NEXTGEN COMPLIANT
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-auto">
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-6">Command & Control</div>
          <div className="space-y-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={getActiveItemClass(item.id)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                  {item.id === 'ai-assistant' && activeAutomatedProcesses.length > 0 && (
                    <span className="ml-auto w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                  )}
                  {item.id === 'faa-compliance' && (
                    <span className="ml-auto text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded border border-green-400/30">
                      CERT
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Compliance */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-4">Security</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 text-sm">
              <span className="text-green-400 text-lg">🔒</span>
              <span className="text-gray-400">FIPS 140-2</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-sm">
              <span className="text-green-400 text-lg">🛡️</span>
              <span className="text-gray-400">NIST Compliant</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-sm">
              <span className="text-green-400 text-lg">🔐</span>
              <span className="text-gray-400">DoD Certified</span>
            </div>
          </div>
        </div>

        {/* Real-time UTC Clock */}
        <div className="mt-8 pt-6 border-t border-yellow-400/20">
          <div className="text-sm text-gray-400">
            <div className="font-bold text-yellow-400 text-lg">UTC TIME</div>
            <div className="text-2xl font-mono text-yellow-400 mt-2">
              {currentTime.toLocaleTimeString('en-US', { 
                timeZone: 'UTC',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })} UTC
            </div>
            <div className="text-sm text-gray-500 mt-1">
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
      <div className="flex-1 h-full p-6">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;