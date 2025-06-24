import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getAlertIcon = (type: Alert['type'], severity: Alert['severity']) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (severity) {
      case 'critical':
        return <AlertTriangle {...iconProps} className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'high':
        return <AlertTriangle {...iconProps} className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertCircle {...iconProps} className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <AlertCircle {...iconProps} className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle {...iconProps} className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400/50 bg-red-400/10 text-red-400';
      case 'high':
        return 'border-red-400/30 bg-red-400/5 text-red-400';
      case 'medium':
        return 'border-yellow-400/30 bg-yellow-400/5 text-yellow-400';
      case 'low':
        return 'border-blue-400/30 bg-blue-400/5 text-blue-400';
      default:
        return 'border-gray-400/30 bg-gray-400/5 text-gray-400';
    }
  };

  const getTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'incursion':
        return 'RUNWAY INCURSION';
      case 'conflict':
        return 'TRAFFIC CONFLICT';
      case 'weather':
        return 'WEATHER ALERT';
      case 'emergency':
        return 'EMERGENCY';
      default:
        return type.toUpperCase();
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">ALERTS & WARNINGS</h2>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-red-400">● {activeAlerts.length} ACTIVE</span>
          <span className="text-green-400">● {resolvedAlerts.length} RESOLVED</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {/* Active Alerts */}
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              border rounded p-3 transition-all duration-200
              ${getSeverityColor(alert.severity)}
              ${alert.severity === 'critical' ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getAlertIcon(alert.type, alert.severity)}
                <span className="font-mono text-xs font-bold uppercase">
                  {getTypeLabel(alert.type)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase">{alert.severity}</span>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {alert.timestamp.toLocaleTimeString().slice(0, 5)}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-300 mb-2">
              {alert.message}
            </div>

            {alert.location && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Location:</span>
                <span className="text-xs font-mono text-yellow-400">{alert.location}</span>
              </div>
            )}

            {alert.severity === 'critical' && (
              <div className="mt-2 bg-red-400/20 border border-red-400/30 rounded px-2 py-1">
                <span className="text-red-400 text-xs font-mono">
                  ⚠ IMMEDIATE ATTENTION REQUIRED
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Resolved Alerts (collapsed view) */}
        {resolvedAlerts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-green-400 font-mono text-sm mb-2">RESOLVED ALERTS</h3>
            {resolvedAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="border border-green-400/20 bg-green-400/5 rounded p-2 mb-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-mono text-green-400">
                      {getTypeLabel(alert.type)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {alert.timestamp.toLocaleTimeString().slice(0, 5)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Active Alerts */}
        {activeAlerts.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <span className="text-green-400 font-mono text-sm">ALL CLEAR</span>
              <div className="text-xs text-gray-400 mt-1">No active alerts</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Alert Prevention Stats */}
      <div className="mt-3 bg-purple-400/10 border border-purple-400/20 rounded p-2">
        <div className="flex items-center space-x-2">
          <XCircle className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-400">AI PREVENTION: 40% reduction in incidents</span>
        </div>
      </div>
    </div>
  );
};