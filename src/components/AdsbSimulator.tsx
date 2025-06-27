import React, { useState, useEffect } from 'react';
import { Radar, Play, Pause, Square, Settings, Database, Zap, Globe, Activity, FileText, Download } from 'lucide-react';

interface AircraftData {
  icao_address: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  ground_speed: number;
  heading: number;
  timestamp: string;
  squawk: string;
  aircraft_type: 'jet' | 'prop';
  status: 'normal' | 'emergency' | 'conflict';
}

interface SimulatorStats {
  totalAircraft: number;
  messagesPerSecond: number;
  totalMessages: number;
  avgLatency: number;
  emergencyCount: number;
  conflictCount: number;
  uptime: number;
}

export const AdsbSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [aircraft, setAircraft] = useState<AircraftData[]>([]);
  const [stats, setStats] = useState<SimulatorStats>({
    totalAircraft: 0,
    messagesPerSecond: 0,
    totalMessages: 0,
    avgLatency: 0,
    emergencyCount: 0,
    conflictCount: 0,
    uptime: 0
  });
  const [config, setConfig] = useState({
    numAircraft: 75,
    messageInterval: 2,
    emergencyFrequency: 0.02,
    separationFrequency: 0.01,
    geographicRegion: 'global'
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Generate mock ICAO address
  const generateICAO = (): string => {
    return Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  };

  // Generate realistic callsign
  const generateCallsign = (): string => {
    const airlines = ['UAL', 'DAL', 'AAL', 'SWA', 'JBU', 'DL', 'AA', 'UA', 'WN', 'B6'];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${airline}${flightNumber}`;
  };

  // Generate aircraft with realistic parameters
  const generateAircraft = (): AircraftData => {
    const isJet = Math.random() > 0.3;
    const aircraft: AircraftData = {
      icao_address: generateICAO(),
      callsign: generateCallsign(),
      latitude: (Math.random() - 0.5) * 160, // -80 to 80 degrees
      longitude: (Math.random() - 0.5) * 360, // -180 to 180 degrees
      altitude: Math.floor(Math.random() * 40000) + 5000, // 5,000 to 45,000 ft
      ground_speed: isJet 
        ? Math.floor(Math.random() * 300) + 300 // 300-600 knots for jets
        : Math.floor(Math.random() * 100) + 100, // 100-200 knots for props
      heading: Math.floor(Math.random() * 360),
      timestamp: new Date().toISOString(),
      squawk: '1200',
      aircraft_type: isJet ? 'jet' : 'prop',
      status: 'normal'
    };

    // Add emergency scenarios
    if (Math.random() < config.emergencyFrequency) {
      aircraft.squawk = ['7700', '7600', '7500'][Math.floor(Math.random() * 3)];
      aircraft.status = 'emergency';
    }

    return aircraft;
  };

  // Update aircraft position based on realistic flight dynamics
  const updateAircraft = (aircraft: AircraftData): AircraftData => {
    const timeStep = config.messageInterval / 3600; // Convert seconds to hours
    const distanceKm = (aircraft.ground_speed * 1.852) * timeStep; // Convert knots to km/h
    
    // Earth radius in km
    const earthRadius = 6371;
    
    // Convert heading to radians
    const bearing = (aircraft.heading * Math.PI) / 180;
    
    // Current position in radians
    const lat1 = (aircraft.latitude * Math.PI) / 180;
    const lon1 = (aircraft.longitude * Math.PI) / 180;
    
    // Calculate new position using great circle formula
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceKm / earthRadius) +
      Math.cos(lat1) * Math.sin(distanceKm / earthRadius) * Math.cos(bearing)
    );
    
    const lon2 = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(distanceKm / earthRadius) * Math.cos(lat1),
      Math.cos(distanceKm / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
    );

    // Add realistic variations
    const headingChange = (Math.random() - 0.5) * 10; // ±5 degrees
    const altitudeChange = (Math.random() - 0.5) * 1000; // ±500 feet
    const speedChange = (Math.random() - 0.5) * 20; // ±10 knots

    return {
      ...aircraft,
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lon2 * 180) / Math.PI,
      heading: (aircraft.heading + headingChange + 360) % 360,
      altitude: Math.max(1000, Math.min(60000, aircraft.altitude + altitudeChange)),
      ground_speed: Math.max(100, Math.min(600, aircraft.ground_speed + speedChange)),
      timestamp: new Date().toISOString()
    };
  };

  // Check for separation conflicts
  const checkSeparation = (aircraftList: AircraftData[]): AircraftData[] => {
    return aircraftList.map(aircraft => {
      for (const other of aircraftList) {
        if (other.icao_address === aircraft.icao_address) continue;
        
        // Calculate distance (simplified)
        const latDiff = aircraft.latitude - other.latitude;
        const lonDiff = aircraft.longitude - other.longitude;
        const horizontalDistance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 60; // Rough NM conversion
        const verticalSeparation = Math.abs(aircraft.altitude - other.altitude);
        
        // Check if within separation minimums (5 NM horizontal, 1000 ft vertical)
        if (horizontalDistance < 5 && verticalSeparation < 1000) {
          return { ...aircraft, status: 'conflict' as const };
        }
      }
      return aircraft;
    });
  };

  // Start simulator
  const startSimulator = () => {
    setIsRunning(true);
    const initialAircraft = Array.from({ length: config.numAircraft }, generateAircraft);
    setAircraft(initialAircraft);
    addLog(`Simulator started with ${config.numAircraft} aircraft`);
  };

  // Stop simulator
  const stopSimulator = () => {
    setIsRunning(false);
    setAircraft([]);
    addLog('Simulator stopped');
  };

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 99)]);
  };

  // Export simulator data
  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      config,
      stats,
      aircraft,
      logs: logs.slice(0, 50)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adsb_simulator_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAircraft(prev => {
        const updated = prev.map(updateAircraft);
        const withSeparationCheck = checkSeparation(updated);
        
        // Update stats
        const emergencyCount = withSeparationCheck.filter(a => a.status === 'emergency').length;
        const conflictCount = withSeparationCheck.filter(a => a.status === 'conflict').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalAircraft: withSeparationCheck.length,
          messagesPerSecond: withSeparationCheck.length / config.messageInterval,
          totalMessages: prevStats.totalMessages + withSeparationCheck.length,
          avgLatency: Math.random() * 50 + 25, // Simulated latency
          emergencyCount,
          conflictCount,
          uptime: prevStats.uptime + config.messageInterval
        }));

        if (emergencyCount > 0) {
          addLog(`${emergencyCount} emergency aircraft detected`);
        }
        if (conflictCount > 0) {
          addLog(`${conflictCount} separation conflicts detected`);
        }

        return withSeparationCheck;
      });
    }, config.messageInterval * 1000);

    return () => clearInterval(interval);
  }, [isRunning, config.messageInterval, config.emergencyFrequency]);

  const getStatusColor = (status: AircraftData['status']) => {
    switch (status) {
      case 'emergency': return 'text-red-400';
      case 'conflict': return 'text-orange-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Radar className="w-6 h-6 text-yellow-400" />
          <h2 className="text-yellow-400 font-mono text-xl font-bold">ADS-B DATA SIMULATOR</h2>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className={`font-mono ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
              {isRunning ? 'ACTIVE' : 'STOPPED'}
            </span>
          </div>
          <span className="text-gray-400">v2.1.0 | PYTHON KAFKA</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-4 bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
        <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3">SIMULATOR CONTROLS</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-yellow-400 font-mono text-xs mb-1">Aircraft Count</label>
            <input
              type="number"
              value={config.numAircraft}
              onChange={(e) => setConfig(prev => ({ ...prev, numAircraft: parseInt(e.target.value) || 50 }))}
              disabled={isRunning}
              className="w-full bg-black border border-yellow-400/30 rounded px-2 py-1 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none disabled:opacity-50"
              min="10"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-yellow-400 font-mono text-xs mb-1">Update Interval (sec)</label>
            <input
              type="number"
              value={config.messageInterval}
              onChange={(e) => setConfig(prev => ({ ...prev, messageInterval: parseFloat(e.target.value) || 1 }))}
              disabled={isRunning}
              className="w-full bg-black border border-yellow-400/30 rounded px-2 py-1 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none disabled:opacity-50"
              min="0.5"
              max="10"
              step="0.5"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-3">
          {!isRunning ? (
            <button
              onClick={startSimulator}
              className="flex items-center space-x-2 bg-green-400/20 hover:bg-green-400/30 border border-green-400/50 rounded px-3 py-2 text-green-400 font-mono text-sm transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              <span>START SIMULATOR</span>
            </button>
          ) : (
            <button
              onClick={stopSimulator}
              className="flex items-center space-x-2 bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded px-3 py-2 text-red-400 font-mono text-sm transition-all duration-200"
            >
              <Square className="w-4 h-4" />
              <span>STOP SIMULATOR</span>
            </button>
          )}
          
          <button
            onClick={exportData}
            disabled={aircraft.length === 0}
            className="flex items-center space-x-2 bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 rounded px-3 py-2 text-blue-400 font-mono text-sm transition-all duration-200 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT DATA</span>
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="mb-4 bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
        <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3">PERFORMANCE METRICS</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-black border border-blue-400/20 rounded p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400 font-mono text-xs">AIRCRAFT</span>
            </div>
            <div className="text-blue-400 font-mono font-bold text-lg">{stats.totalAircraft}</div>
          </div>
          <div className="bg-black border border-green-400/20 rounded p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-mono text-xs">MSG/SEC</span>
            </div>
            <div className="text-green-400 font-mono font-bold text-lg">{stats.messagesPerSecond.toFixed(1)}</div>
          </div>
          <div className="bg-black border border-purple-400/20 rounded p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-mono text-xs">LATENCY</span>
            </div>
            <div className="text-purple-400 font-mono font-bold text-lg">{stats.avgLatency.toFixed(0)}ms</div>
          </div>
          <div className="bg-black border border-yellow-400/20 rounded p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Database className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-xs">TOTAL MSG</span>
            </div>
            <div className="text-yellow-400 font-mono font-bold text-lg">{stats.totalMessages.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Live Aircraft Data */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
          <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3">LIVE AIRCRAFT DATA</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {aircraft.slice(0, 10).map((ac) => (
              <div key={ac.icao_address} className="bg-black border border-gray-600 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-yellow-400 font-mono font-bold">{ac.callsign}</span>
                  <span className={`font-mono ${getStatusColor(ac.status)}`}>
                    {ac.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>ICAO: {ac.icao_address}</div>
                  <div>ALT: {ac.altitude.toLocaleString()}ft</div>
                  <div>SPD: {ac.ground_speed}kt</div>
                  <div>HDG: {ac.heading.toFixed(0)}°</div>
                </div>
                {ac.squawk !== '1200' && (
                  <div className="text-red-400 font-mono text-xs mt-1">
                    SQUAWK: {ac.squawk}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-3">
          <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3">SYSTEM LOGS</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs text-gray-300 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 bg-gradient-to-r from-yellow-400/10 to-black border border-yellow-400/20 rounded p-2">
        <div className="grid grid-cols-6 gap-2 text-xs text-center">
          <div>
            <div className="text-red-400 font-bold">{stats.emergencyCount}</div>
            <div className="text-gray-400">Emergency</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold">{stats.conflictCount}</div>
            <div className="text-gray-400">Conflicts</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">{Math.floor(stats.uptime / 60)}m</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">Kafka</div>
            <div className="text-gray-400">Connected</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold">JSON</div>
            <div className="text-gray-400">Format</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">Python 3.10+</div>
            <div className="text-gray-400">Runtime</div>
          </div>
        </div>
      </div>
    </div>
  );
};