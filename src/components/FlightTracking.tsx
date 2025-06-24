import React from 'react';
import { Plane, Radar, MapPin, Clock } from 'lucide-react';

export const FlightTracking: React.FC = () => {
  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">FLIGHT TRACKING</h2>
        <div className="flex items-center space-x-2">
          <Radar className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400">ACTIVE TRACKING</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flight Position Monitoring */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-mono text-sm">FLIGHT POSITION MONITORING</span>
          </div>
          <div className="text-xs text-gray-300">
            Continuously tracks aircraft position via radar, ADS-B, and satellite
          </div>
        </div>

        {/* Conflict Detection */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Plane className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-mono text-sm">CONFLICT DETECTION</span>
          </div>
          <div className="text-xs text-gray-300">
            Analyzes proximity of aircraft and alerts for potential separation violations
          </div>
        </div>

        {/* Airspace Surveillance */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Radar className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">AIRSPACE SURVEILLANCE</span>
          </div>
          <div className="text-xs text-gray-300">
            Aggregates radar, ADS-B, SSR, and military feeds into unified situational picture
          </div>
        </div>

        {/* Flight Identification */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-mono text-sm">FLIGHT IDENTIFICATION</span>
          </div>
          <div className="text-xs text-gray-300">
            Correlates transponder codes, ADS-B identifiers, and flight plans
          </div>
        </div>

        {/* Status Placeholder */}
        <div className="mt-8 bg-blue-400/10 border border-blue-400/20 rounded p-4">
          <div className="text-center">
            <div className="text-blue-400 text-lg mb-2">🚧</div>
            <div className="text-blue-400 font-mono text-sm">FLIGHT TRACKING DASHBOARD</div>
            <div className="text-xs text-gray-400 mt-2">Under Development - Full Interface Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};