import React from 'react';
import { FileText, Navigation, Clock, AlertCircle } from 'lucide-react';

export const FlightPlanManagement: React.FC = () => {
  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">FLIGHT PLAN MANAGEMENT</h2>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">PLAN PROCESSING</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flight Plan Management */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-mono text-sm">FLIGHT PLAN MANAGEMENT</span>
          </div>
          <div className="text-xs text-gray-300">
            Handles submission, amendment, and distribution of flight plans
          </div>
        </div>

        {/* Departure and Arrival Scheduling */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">DEPARTURE/ARRIVAL SCHEDULING</span>
          </div>
          <div className="text-xs text-gray-300">
            Optimizes sequencing for departures, arrivals, and gate availability
          </div>
        </div>

        {/* Runway Allocation */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm">RUNWAY ALLOCATION</span>
          </div>
          <div className="text-xs text-gray-300">
            Allocates active runways based on traffic, weather, and operational constraints
          </div>
        </div>

        {/* Sector Handoff Management */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-mono text-sm">SECTOR HANDOFF MANAGEMENT</span>
          </div>
          <div className="text-xs text-gray-300">
            Manages aircraft transitions between ATC sectors and FIR boundaries
          </div>
        </div>

        {/* Status Placeholder */}
        <div className="mt-8 bg-blue-400/10 border border-blue-400/20 rounded p-4">
          <div className="text-center">
            <div className="text-blue-400 text-lg mb-2">🚧</div>
            <div className="text-blue-400 font-mono text-sm">FLIGHT PLAN DASHBOARD</div>
            <div className="text-xs text-gray-400 mt-2">Under Development - Full Interface Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};