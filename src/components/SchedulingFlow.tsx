import React from 'react';
import { Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';

export const SchedulingFlow: React.FC = () => {
  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">SCHEDULING & FLOW</h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">FLOW OPTIMIZATION</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Traffic Flow Optimization */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-mono text-sm">TRAFFIC FLOW OPTIMIZATION</span>
          </div>
          <div className="text-xs text-gray-300">
            Automates rerouting and metering for congestion management
          </div>
        </div>

        {/* Arrival/Departure Prediction */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">ARRIVAL/DEPARTURE PREDICTION</span>
          </div>
          <div className="text-xs text-gray-300">
            Uses AI/ML to predict arrival times and optimize sequencing
          </div>
        </div>

        {/* Dynamic Sectorization */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-mono text-sm">DYNAMIC SECTORIZATION</span>
          </div>
          <div className="text-xs text-gray-300">
            Adjusts sector boundaries in real time based on traffic volume and complexity
          </div>
        </div>

        {/* Conflict Resolution Suggestions */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm">CONFLICT RESOLUTION SUGGESTIONS</span>
          </div>
          <div className="text-xs text-gray-300">
            Recommends heading, altitude, or speed adjustments to resolve conflicts
          </div>
        </div>

        {/* Status Placeholder */}
        <div className="mt-8 bg-blue-400/10 border border-blue-400/20 rounded p-4">
          <div className="text-center">
            <div className="text-blue-400 text-lg mb-2">🚧</div>
            <div className="text-blue-400 font-mono text-sm">SCHEDULING & FLOW DASHBOARD</div>
            <div className="text-xs text-gray-400 mt-2">Under Development - Full Interface Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};