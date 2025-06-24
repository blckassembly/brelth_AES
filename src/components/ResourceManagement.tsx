import React from 'react';
import { Settings, Users, Database, Shield } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">RESOURCE MANAGEMENT</h2>
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">SYSTEM ACTIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Resource Management Service */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-mono text-sm">RESOURCE MANAGEMENT</span>
          </div>
          <div className="text-xs text-gray-300">
            Tracks and schedules controller staffing, runways, and airspace resources
          </div>
        </div>

        {/* User Authentication */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">USER AUTHENTICATION & ACCESS</span>
          </div>
          <div className="text-xs text-gray-300">
            Manages role-based access for controllers, supervisors, and system admins
          </div>
        </div>

        {/* Event Logging */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-mono text-sm">EVENT LOGGING & REPLAY</span>
          </div>
          <div className="text-xs text-gray-300">
            Captures and replays historical operational data for audits and investigations
          </div>
        </div>

        {/* System Health Monitoring */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm">SYSTEM HEALTH MONITORING</span>
          </div>
          <div className="text-xs text-gray-300">
            Tracks the status of ATC infrastructure, software, and communication systems
          </div>
        </div>

        {/* Status Placeholder */}
        <div className="mt-8 bg-blue-400/10 border border-blue-400/20 rounded p-4">
          <div className="text-center">
            <div className="text-blue-400 text-lg mb-2">🚧</div>
            <div className="text-blue-400 font-mono text-sm">RESOURCE MANAGEMENT DASHBOARD</div>
            <div className="text-xs text-gray-400 mt-2">Under Development - Full Interface Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};