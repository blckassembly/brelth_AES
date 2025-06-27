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
import { AdsbSimulator } from './components/AdsbSimulator';
import type { AutomatedProcess } from './hooks/useRealtimeData';

type ActiveView = 'surface-map' | 'runway-status' | 'gate-management' | 'vehicle-tracking' | 
                  'communications' | 'weather' | 'alerts' | 'operations-log' | 'ai-assistant' |
                  'flight-tracking' | 'flight-plan-management' | 'scheduling-flow' | 'resource-management' |
                  'faa-compliance' | 'adsb-simulator';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface NavigationSection {
  type: 'category' | 'item';
  label?: string;
  items?: NavigationItem[];
  id?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

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

  const navigationSections: NavigationSection[] = [
    {
      type: 'category',
      label: 'Ground Operations',
      items: [
        { id: 'surface-map', label: 'Surface Movement', icon: '🗺️' },
        { id: 'runway-status', label: 'Runway Status', icon: '🛫' },
        { id: 'gate-management', label: 'Gate Management', icon: '🚪' },
        { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: '🚛' },
        { id: 'communications', label: 'Communications', icon: '📡' },
        { id: 'weather', label: 'Weather Data', icon: '🌤️' },
        { id: 'alerts', label: 'Alerts & Warnings', icon: '⚠️' },
        { id: 'operations-log', label: 'Operations Log', icon: '📋' }
      ]
    },
    {
      type: 'category',
      label: 'Air Traffic Management',
      items: [
        { id: 'flight-tracking', label: 'Flight Tracking', icon: '✈️' },
        { id: 'flight-plan-management', label: 'Flight Plan Management', icon: '📄' },
        { id: 'scheduling-flow', label: 'Scheduling & Flow', icon: '🕐' },
        { id: 'resource-management', label: 'Resource Management', icon: '⚙️' }
      ]
    },
    {
      type: 'category',
      label: 'Simulation & Compliance',
      items: [
        { id: 'adsb-simulator', label: 'ADS-B Simulator', icon: '📡', badge: 'PYTHON', badgeColor: 'blue' },
        { id: 'faa-compliance', label: 'FAA NEXTGEN COMPLIANT', icon: '🛡️', badge: 'CERT', badgeColor: 'green' }
      ]
    },
    {
      type: 'item',
      id: 'ai-assistant',
      label: 'AI Command Center',
      icon: '🤖'
    }
  ];

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
        case 'adsb-simulator':
          return (
            <div className="h-full">
              <AdsbSimulator />
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
      ? 'w-full text-left p-4 rounded-lg bg-yellow-400/20 border-l-4 border-l-yellow-400 border-r border-t border-b border-yellow-400/50 transition-all duration-200 text-lg font-bold text-yellow-400 hover:bg-yellow-400/30 shadow-lg shadow-yellow-400/10'
      : 'w-full text-left p-4 rounded-lg hover:bg-yellow-400/10 transition-all duration-200 text-lg text-gray-300 hover:text-yellow-400 hover:border-yellow-400/30 hover:border-l-2 hover:border-l-yellow-400/50 border border-transparent hover:shadow-md hover:shadow-yellow-400/5';
  };

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'green':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'purple':
        return 'bg-purple-400/20 text-purple-400 border-purple-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
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

        {/* Enhanced Navigation */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-6">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.type === 'category' ? (
                  <>
                    {/* Category Header */}
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-4 font-bold border-b border-gray-700 pb-2">
                      {section.label}
                    </div>
                    
                    {/* Category Items */}
                    <div className="space-y-2 mb-6">
                      {section.items?.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id as ActiveView)}
                          className={getActiveItemClass(item.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-semibold flex-1">{item.label}</span>
                            
                            {/* Special indicators */}
                            {item.id === 'ai-assistant' && activeAutomatedProcesses.length > 0 && (
                              <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                            )}
                            
                            {/* Badges */}
                            {item.badge && (
                              <span className={`text-xs px-2 py-1 rounded border font-mono ${getBadgeColor(item.badgeColor)}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Standalone Item */
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-4 font-bold border-b border-gray-700 pb-2">
                      Command Center
                    </div>
                    <button
                      key={section.id}
                      onClick={() => setActiveView(section.id as ActiveView)}
                      className={getActiveItemClass(section.id!)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{section.icon}</span>
                        <span className="font-semibold flex-1">{section.label}</span>
                        
                        {/* AI Assistant special indicator */}
                        {section.id === 'ai-assistant' && activeAutomatedProcesses.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded border border-yellow-400/30 font-mono">
                              {activeAutomatedProcesses.length} ACTIVE
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ))}
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