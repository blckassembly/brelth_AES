import React from 'react';
import { Aircraft, GroundVehicle, Runway, Taxiway } from '../types';
import { Plane, Truck, AlertTriangle, Navigation, Zap } from 'lucide-react';

interface AirportSurfaceMapProps {
  aircraft: Aircraft[];
  vehicles: GroundVehicle[];
  runways: Runway[];
  taxiways: Taxiway[];
}

export const AirportSurfaceMap: React.FC<AirportSurfaceMapProps> = ({
  aircraft,
  vehicles,
  runways,
  taxiways
}) => {
  const getAircraftColor = (status: Aircraft['status']) => {
    switch (status) {
      case 'taxiing': return 'text-yellow-400';
      case 'holding': return 'text-orange-400';
      case 'pushback': return 'text-blue-400';
      case 'parked': return 'text-gray-400';
      default: return 'text-yellow-400';
    }
  };

  const getVehicleColor = (type: GroundVehicle['type']) => {
    switch (type) {
      case 'emergency': return 'text-red-400';
      case 'pushback': return 'text-blue-400';
      case 'follow-me': return 'text-green-400';
      case 'maintenance': return 'text-purple-400';
      case 'fuel': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const renderAutomatedRoute = (aircraft: Aircraft) => {
    if (!aircraft.automatedRoute || aircraft.automatedRoute.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated route path */}
        <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M ${aircraft.position.x} ${aircraft.position.y} L ${aircraft.position.x + 100} ${aircraft.position.y + 50} L ${aircraft.position.x + 200} ${aircraft.position.y + 25} L ${aircraft.position.x + 300} ${aircraft.position.y + 75}`}
            stroke="url(#routeGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            filter="url(#glow)"
            className="animate-pulse"
          />
        </svg>

        {/* Route waypoint indicators */}
        {aircraft.automatedRoute.map((waypoint, index) => (
          <div
            key={`${aircraft.id}-waypoint-${index}`}
            className="absolute w-4 h-4 rounded-full bg-blue-400/30 border-2 border-blue-400 animate-pulse"
            style={{
              left: `${aircraft.position.x + (index + 1) * 80}px`,
              top: `${aircraft.position.y + 30 + index * 15}px`
            }}
          >
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-blue-400 whitespace-nowrap">
              {waypoint}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">NEWARK AIRPORT SURFACE MOVEMENT</h2>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="text-green-400">● ACTIVE</span>
          <span className="text-yellow-400">● MONITORING</span>
          <span className="text-blue-400">● AUTOMATED</span>
          <span className="text-red-400">● ALERT</span>
        </div>
      </div>

      <div className="relative bg-gray-900 border border-yellow-400/20 rounded h-96 overflow-hidden">
        {/* Newark Airport Layout */}
        <div className="absolute inset-4">
          {/* Primary runway 04L/22R */}
          <div className="absolute top-1/2 left-8 right-8 h-8 bg-gray-700 border border-yellow-400/50 transform -translate-y-1/2">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-xs font-mono">04L</div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-xs font-mono">22R</div>
          </div>
          
          {/* Secondary runway 04R/22L */}
          <div className="absolute top-1/3 left-12 right-12 h-6 bg-gray-700 border border-yellow-400/50 transform -translate-y-1/2">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-xs font-mono">04R</div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-xs font-mono">22L</div>
          </div>

          {/* Cross runway 11/29 */}
          <div className="absolute top-8 bottom-8 left-2/3 w-6 bg-gray-700 border border-yellow-400/50 transform -translate-x-1/2">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs font-mono rotate-90">11</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs font-mono rotate-90">29</div>
          </div>

          {/* Newark Terminal Buildings */}
          <div className="absolute top-4 left-4 w-16 h-12 bg-gray-600 border border-gray-500 rounded">
            <div className="text-xs text-yellow-400 text-center mt-2">Terminal A</div>
          </div>
          <div className="absolute top-4 left-24 w-16 h-12 bg-gray-600 border border-gray-500 rounded">
            <div className="text-xs text-yellow-400 text-center mt-2">Terminal B</div>
          </div>
          <div className="absolute top-4 left-44 w-16 h-12 bg-gray-600 border border-gray-500 rounded">
            <div className="text-xs text-yellow-400 text-center mt-2">Terminal C</div>
          </div>

          {/* Taxiway network */}
          {taxiways.map((taxiway, index) => (
            <div
              key={taxiway.id}
              className={`absolute w-4 h-4 rounded-full border-2 ${
                taxiway.status === 'occupied' ? 'border-red-400 bg-red-400/20' : 
                taxiway.status === 'closed' ? 'border-gray-600 bg-gray-600/20' :
                'border-green-400 bg-green-400/20'
              }`}
              style={{
                left: `${60 + index * 55}px`,
                top: `${80 + index * 35}px`
              }}
            >
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-yellow-400">
                {taxiway.name.charAt(0)}
              </span>
            </div>
          ))}

          {/* Render automated routes first (behind aircraft) */}
          {aircraft.map((aircraft) => renderAutomatedRoute(aircraft))}

          {/* Aircraft positions */}
          {aircraft.map((aircraft) => (
            <div
              key={aircraft.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000"
              style={{
                left: `${Math.max(20, Math.min(880, aircraft.position.x))}px`,
                top: `${Math.max(20, Math.min(360, aircraft.position.y))}px`,
                transform: `translate(-50%, -50%) rotate(${aircraft.heading}deg)`
              }}
            >
              <div className="relative">
                <Plane className={`w-4 h-4 ${getAircraftColor(aircraft.status)}`} />
                
                {/* Automated process indicator */}
                {aircraft.automatedRoute && (
                  <div className="absolute -top-2 -right-2">
                    <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
                  </div>
                )}
                
                {/* Aircraft callsign */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-yellow-400 whitespace-nowrap bg-black/80 px-1 rounded">
                  {aircraft.callsign}
                  {aircraft.status === 'pushback' && (
                    <div className="text-blue-400 text-xs">PUSHBACK</div>
                  )}
                  {aircraft.status === 'taxiing' && aircraft.automatedRoute && (
                    <div className="text-green-400 text-xs">AUTO TAXI</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Ground vehicles */}
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${Math.max(15, Math.min(885, vehicle.position.x))}px`,
                top: `${Math.max(15, Math.min(365, vehicle.position.y))}px`
              }}
            >
              <div className="relative">
                <Truck className={`w-3 h-3 ${getVehicleColor(vehicle.type)}`} />
                
                {/* Emergency indicator */}
                {vehicle.status === 'emergency' && (
                  <AlertTriangle className="w-2 h-2 text-red-400 absolute -top-1 -right-1 animate-pulse" />
                )}
                
                {/* Automated task indicator */}
                {vehicle.automatedTask && (
                  <Navigation className="w-2 h-2 text-blue-400 absolute -top-1 -left-1 animate-pulse" />
                )}
                
                {/* Vehicle ID */}
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-300 whitespace-nowrap">
                  {vehicle.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <h3 className="text-yellow-400 mb-2">AIRCRAFT STATUS</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Plane className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-300">Taxiing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="w-3 h-3 text-orange-400" />
              <span className="text-gray-300">Holding</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">Pushback</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">Parked</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-yellow-400 mb-2">GROUND VEHICLES</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3 text-red-400" />
              <span className="text-gray-300">Emergency</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">Pushback</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">Follow-me</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-300">Fuel</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-yellow-400 mb-2">AUTOMATION</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">Automated Process</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">AI Route Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded"></div>
              <span className="text-gray-300">Automated Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* Newark-specific AI stats */}
      <div className="mt-3 bg-blue-400/10 border border-blue-400/20 rounded p-2">
        <div className="text-xs text-blue-400 mb-1">NEWARK (EWR) AI OPTIMIZATION:</div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
          <div>• 31% delay reduction</div>
          <div>• 67% conflict prevention</div>
          <div>• 89 aircraft tracked</div>
        </div>
      </div>
    </div>
  );
};