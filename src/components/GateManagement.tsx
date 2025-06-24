import React, { useState } from 'react';
import { Gate } from '../types';
import { Plane, Clock, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface GateManagementProps {
  gates: Gate[];
}

export const GateManagement: React.FC<GateManagementProps> = ({ gates }) => {
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  const getStatusIcon = (status: Gate['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'occupied':
        return <Plane className="w-4 h-4 text-yellow-400" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusColor = (status: Gate['status']) => {
    switch (status) {
      case 'available':
        return 'border-green-400/30 bg-green-400/5';
      case 'occupied':
        return 'border-yellow-400/30 bg-yellow-400/5';
      case 'maintenance':
        return 'border-red-400/30 bg-red-400/5';
      default:
        return 'border-green-400/30 bg-green-400/5';
    }
  };

  const availableGates = gates.filter(g => g.status === 'available').length;
  const occupiedGates = gates.filter(g => g.status === 'occupied').length;
  const maintenanceGates = gates.filter(g => g.status === 'maintenance').length;

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">GATE MANAGEMENT</h2>
        <div className="flex items-center space-x-4 text-xs">
          <span className="text-green-400">● {availableGates} AVAIL</span>
          <span className="text-yellow-400">● {occupiedGates} OCCUP</span>
          <span className="text-red-400">● {maintenanceGates} MAINT</span>
        </div>
      </div>

      {/* Gate Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-5 gap-2">
          {gates.map((gate) => (
            <div
              key={gate.id}
              className={`
                border rounded p-2 cursor-pointer transition-all duration-200 hover:border-yellow-400/50
                ${getStatusColor(gate.status)}
                ${selectedGate === gate.id ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : ''}
              `}
              onClick={() => setSelectedGate(selectedGate === gate.id ? null : gate.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-yellow-400">{gate.number}</span>
                {getStatusIcon(gate.status)}
              </div>
              
              <div className="text-xs text-gray-400 uppercase mb-1">
                {gate.status}
              </div>
              
              {gate.type && (
                <div className="text-xs text-gray-300 uppercase">
                  {gate.type}
                </div>
              )}

              {gate.scheduledDeparture && (
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-2 h-2 text-blue-400" />
                  <span className="text-xs text-blue-400">
                    DEP {format(gate.scheduledDeparture, 'HH:mm')}
                  </span>
                </div>
              )}

              {gate.scheduledArrival && (
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-2 h-2 text-green-400" />
                  <span className="text-xs text-green-400">
                    ARR {format(gate.scheduledArrival, 'HH:mm')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Gate Details */}
      {selectedGate && (
        <div className="mt-4 bg-gray-900 border border-yellow-400/20 rounded p-3">
          <h3 className="text-yellow-400 font-bold mb-2">GATE {selectedGate.replace('G', '')} DETAILS</h3>
          {(() => {
            const gate = gates.find(g => g.id === selectedGate);
            if (!gate) return null;
            
            return (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400 uppercase">{gate.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-yellow-400 uppercase">{gate.type}</span>
                </div>
                {gate.scheduledDeparture && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Departure:</span>
                    <span className="text-blue-400">{format(gate.scheduledDeparture, 'HH:mm')}</span>
                  </div>
                )}
                {gate.scheduledArrival && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Arrival:</span>
                    <span className="text-green-400">{format(gate.scheduledArrival, 'HH:mm')}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* AI Optimization Banner */}
      <div className="mt-3 bg-blue-400/10 border border-blue-400/20 rounded p-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-400">AMADEUS API: 12% faster turnarounds optimized</span>
        </div>
      </div>
    </div>
  );
};