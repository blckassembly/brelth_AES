import React from 'react';
import { Runway, Taxiway } from '../types';
import { Plane, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RunwayTaxiwayStatusProps {
  runways: Runway[];
  taxiways: Taxiway[];
}

export const RunwayTaxiwayStatus: React.FC<RunwayTaxiwayStatusProps> = ({
  runways,
  taxiways
}) => {
  const getRunwayStatusIcon = (status: Runway['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'occupied': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'closed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getTaxiwayStatusIcon = (status: Taxiway['status']) => {
    switch (status) {
      case 'clear': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'occupied': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'closed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getCongestionColor = (level: Taxiway['congestionLevel']) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <h2 className="text-yellow-400 font-mono text-lg font-bold mb-4">RUNWAY & TAXIWAY STATUS</h2>
      
      <div className="space-y-6">
        {/* Runways */}
        <div>
          <h3 className="text-yellow-400 font-mono text-sm mb-3">RUNWAYS</h3>
          <div className="space-y-2">
            {runways.map((runway) => (
              <div key={runway.id} className="bg-gray-900 border border-yellow-400/20 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getRunwayStatusIcon(runway.status)}
                    <span className="font-mono text-yellow-400 font-bold">{runway.name}</span>
                    <span className="text-xs font-mono text-gray-400 uppercase">{runway.status}</span>
                  </div>
                  {runway.windDirection && runway.windSpeed && (
                    <div className="text-xs font-mono text-gray-300">
                      {runway.windDirection}°/{runway.windSpeed}kt
                    </div>
                  )}
                </div>
                
                {runway.occupiedBy && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Plane className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-mono text-gray-300">
                      OCCUPIED BY: {runway.occupiedBy}
                    </span>
                  </div>
                )}
                
                {runway.status === 'active' && (
                  <div className="mt-2 bg-green-400/10 border border-green-400/20 rounded px-2 py-1">
                    <span className="text-xs font-mono text-green-400">
                      ✓ OPTIMAL ROUTING AVAILABLE - FUEL SAVINGS: 30%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Taxiways */}
        <div>
          <h3 className="text-yellow-400 font-mono text-sm mb-3">TAXIWAYS</h3>
          <div className="grid grid-cols-2 gap-2">
            {taxiways.map((taxiway) => (
              <div key={taxiway.id} className="bg-gray-900 border border-yellow-400/20 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getTaxiwayStatusIcon(taxiway.status)}
                    <span className="font-mono text-yellow-400 text-sm font-bold">{taxiway.name}</span>
                  </div>
                  <span className={`text-xs font-mono ${getCongestionColor(taxiway.congestionLevel)}`}>
                    {taxiway.congestionLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-xs font-mono text-gray-400 uppercase">
                  {taxiway.status}
                </div>
                
                {taxiway.occupiedBy && (
                  <div className="text-xs font-mono text-gray-300 mt-1">
                    {taxiway.occupiedBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-blue-400/10 border border-blue-400/20 rounded p-3">
          <h4 className="text-blue-400 font-mono text-sm mb-2">AI ROUTING RECOMMENDATIONS</h4>
          <div className="space-y-1 text-xs font-mono text-gray-300">
            <div>• Route AAL1234 via Bravo-Charlie for 15% time reduction</div>
            <div>• Delay UAL567 pushback 2min to avoid Taxiway Alpha congestion</div>
            <div>• Prioritize emergency vehicle access on Taxiway Delta</div>
          </div>
        </div>
      </div>
    </div>
  );
};