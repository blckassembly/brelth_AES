import React, { useState } from 'react';
import { Radio, Volume2, Lock, MessageSquare } from 'lucide-react';

interface CommunicationLog {
  id: string;
  timestamp: Date;
  frequency: string;
  from: string;
  to: string;
  message: string;
  encrypted: boolean;
}

export const GroundCommunications: React.FC = () => {
  const [activeFrequency, setActiveFrequency] = useState('121.9');
  const [volume, setVolume] = useState(75);

  // Mock communication logs
  const commsLog: CommunicationLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 30000),
      frequency: '121.9',
      from: 'UAL234',
      to: 'GND',
      message: 'Ground, UAL234, request pushback gate A12',
      encrypted: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000),
      frequency: '121.9',
      from: 'GND',
      to: 'DAL456',
      message: 'DAL456, taxi via Bravo, Charlie, hold short runway 09L',
      encrypted: true
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 90000),
      frequency: '121.9',
      from: 'SWA789',
      to: 'GND',
      message: 'Ground, SWA789, ready for taxi',
      encrypted: true
    }
  ];

  const frequencies = [
    { freq: '121.9', name: 'Ground Control', active: true },
    { freq: '118.1', name: 'Tower', active: false },
    { freq: '119.3', name: 'Clearance', active: false },
    { freq: '121.6', name: 'Ramp Control', active: false }
  ];

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">GROUND COMMUNICATIONS</h2>
        <div className="flex items-center space-x-2">
          <Lock className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">FIPS 140-2 ENCRYPTED</span>
        </div>
      </div>

      {/* Frequency Controls */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {frequencies.map((freq) => (
            <button
              key={freq.freq}
              onClick={() => setActiveFrequency(freq.freq)}
              className={`
                p-2 rounded border font-mono text-xs transition-all duration-200
                ${activeFrequency === freq.freq 
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' 
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400/50'
                }
              `}
            >
              <div className="font-bold">{freq.freq}</div>
              <div className="text-xs">{freq.name}</div>
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="w-4 h-4 text-yellow-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none slider"
          />
          <span className="text-yellow-400 font-mono text-sm w-8">{volume}</span>
        </div>
      </div>

      {/* Active Frequency Display */}
      <div className="mb-4 bg-gray-900 border border-yellow-400/20 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="w-5 h-5 text-green-400 animate-pulse" />
            <div>
              <div className="text-yellow-400 font-mono font-bold text-lg">{activeFrequency}</div>
              <div className="text-xs text-gray-400">
                {frequencies.find(f => f.freq === activeFrequency)?.name}
              </div>
            </div>
          </div>
          <div className="text-green-400 text-xs font-mono">
            ACTIVE • VOL {volume}%
          </div>
        </div>
      </div>

      {/* Communications Log */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-yellow-400 font-mono text-sm mb-2">COMMUNICATIONS LOG</h3>
        <div className="space-y-2">
          {commsLog.map((log) => (
            <div
              key={log.id}
              className="bg-gray-900 border border-yellow-400/20 rounded p-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{log.timestamp.toLocaleTimeString().slice(0, 8)}</span>
                  <span className="text-blue-400 font-mono">{log.frequency}</span>
                  {log.encrypted && <Lock className="w-2 h-2 text-green-400" />}
                </div>
                <div className="text-yellow-400 font-mono">
                  {log.from} → {log.to}
                </div>
              </div>
              <div className="text-gray-300 italic">
                "{log.message}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Commands */}
      <div className="mt-3 bg-blue-400/10 border border-blue-400/20 rounded p-2">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-400">QUICK COMMANDS</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <button className="bg-gray-800 hover:bg-gray-700 p-1 rounded text-left">
            Cleared for pushback
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 p-1 rounded text-left">
            Taxi via Alpha
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 p-1 rounded text-left">
            Hold short runway
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 p-1 rounded text-left">
            Contact tower
          </button>
        </div>
      </div>
    </div>
  );
};