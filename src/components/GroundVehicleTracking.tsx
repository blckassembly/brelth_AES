import React from 'react';
import { GroundVehicle } from '../types';
import { Truck, AlertTriangle, Zap, Wrench, Fuel, Navigation } from 'lucide-react';

interface GroundVehicleTrackingProps {
  vehicles: GroundVehicle[];
}

export const GroundVehicleTracking: React.FC<GroundVehicleTrackingProps> = ({ vehicles }) => {
  const getVehicleIcon = (type: GroundVehicle['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'pushback':
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'follow-me':
        return <Zap className="w-4 h-4 text-green-400" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-purple-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-yellow-400" />;
      default:
        return <Truck className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: GroundVehicle['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'emergency':
        return 'text-red-400 animate-pulse';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeColor = (type: GroundVehicle['type']) => {
    switch (type) {
      case 'emergency':
        return 'border-red-400/30 bg-red-400/5';
      case 'pushback':
        return 'border-blue-400/30 bg-blue-400/5';
      case 'follow-me':
        return 'border-green-400/30 bg-green-400/5';
      case 'maintenance':
        return 'border-purple-400/30 bg-purple-400/5';
      case 'fuel':
        return 'border-yellow-400/30 bg-yellow-400/5';
      default:
        return 'border-gray-400/30 bg-gray-400/5';
    }
  };

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const emergencyVehicles = vehicles.filter(v => v.status === 'emergency').length;

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">GROUND VEHICLE TRACKING</h2>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-green-400">● {activeVehicles} ACTIVE</span>
          {emergencyVehicles > 0 && (
            <span className="text-red-400 animate-pulse">● {emergencyVehicles} EMERGENCY</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`
              border rounded p-3 transition-all duration-200
              ${getTypeColor(vehicle.type)}
              ${vehicle.status === 'emergency' ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getVehicleIcon(vehicle.type)}
                <span className="font-mono text-yellow-400 font-bold">{vehicle.id}</span>
                <span className="text-xs text-gray-400 uppercase">{vehicle.type}</span>
              </div>
              <span className={`text-xs font-mono uppercase ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Position:</span>
                <div className="text-yellow-400 font-mono">
                  X:{Math.round(vehicle.position.x)} Y:{Math.round(vehicle.position.y)}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Last Update:</span>
                <div className="text-yellow-400 font-mono">
                  {vehicle.lastUpdate.toLocaleTimeString().slice(0, 5)}
                </div>
              </div>
            </div>

            {vehicle.assignedAircraft && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-gray-400 text-xs">Assigned:</span>
                <span className="text-blue-400 font-mono text-xs">{vehicle.assignedAircraft}</span>
              </div>
            )}

            {vehicle.status === 'emergency' && (
              <div className="mt-2 bg-red-400/20 border border-red-400/30 rounded px-2 py-1">
                <span className="text-red-400 text-xs font-mono">
                  ⚠ PRIORITY VEHICLE - CLEAR PATH REQUIRED
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Conflict Prevention */}
      <div className="mt-3 bg-green-400/10 border border-green-400/20 rounded p-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">AI CONFLICT PREVENTION: 40% reduction in incidents</span>
        </div>
      </div>
    </div>
  );
};