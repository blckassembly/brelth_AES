import React, { useState } from 'react';
import { Clock, Search, Filter, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'clearance' | 'movement' | 'alert' | 'communication';
  aircraft?: string;
  location?: string;
  description: string;
  operator: string;
}

export const OperationsLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock log entries
  const logEntries: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 120000),
      type: 'clearance',
      aircraft: 'UAL234',
      location: 'Gate A12',
      description: 'Pushback clearance issued',
      operator: 'GND_001'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 180000),
      type: 'movement',
      aircraft: 'DAL456',
      location: 'Taxiway Bravo',
      description: 'Aircraft entered Taxiway Bravo from Charlie',
      operator: 'SYSTEM'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 240000),
      type: 'alert',
      location: 'Runway 09L',
      description: 'Potential runway incursion detected - Alert resolved',
      operator: 'AI_SYSTEM'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 300000),
      type: 'communication',
      aircraft: 'SWA789',
      description: 'Ground control frequency contact established',
      operator: 'GND_002'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 360000),
      type: 'clearance',
      aircraft: 'JBU123',
      location: 'Runway 27R',
      description: 'Taxi clearance to runway via Alpha, Bravo',
      operator: 'GND_001'
    }
  ];

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'clearance': return '✓';
      case 'movement': return '→';
      case 'alert': return '⚠';
      case 'communication': return '📡';
      default: return '•';
    }
  };

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'clearance': return 'text-green-400';
      case 'movement': return 'text-blue-400';
      case 'alert': return 'text-red-400';
      case 'communication': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const filteredEntries = logEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.aircraft?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">OPERATIONS LOG</h2>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-400">Real-time logging active</span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-yellow-400/20 rounded pl-7 pr-3 py-1 text-xs text-yellow-400 font-mono focus:border-yellow-400/50 focus:outline-none"
          />
        </div>
        
        <div className="relative">
          <Filter className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-yellow-400/20 rounded pl-7 pr-8 py-1 text-xs text-yellow-400 font-mono focus:border-yellow-400/50 focus:outline-none appearance-none"
          >
            <option value="all">All Types</option>
            <option value="clearance">Clearances</option>
            <option value="movement">Movements</option>
            <option value="alert">Alerts</option>
            <option value="communication">Communications</option>
          </select>
        </div>

        <button className="bg-gray-900 border border-yellow-400/20 rounded p-1 hover:border-yellow-400/50 transition-colors">
          <Download className="w-3 h-3 text-yellow-400" />
        </button>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-auto space-y-1">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-900 border border-yellow-400/20 rounded p-2 hover:border-yellow-400/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-sm ${getTypeColor(entry.type)}`}>
                  {getTypeIcon(entry.type)}
                </span>
                <span className="text-xs text-gray-400">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
                <span className={`text-xs font-mono uppercase ${getTypeColor(entry.type)}`}>
                  {entry.type}
                </span>
                {entry.aircraft && (
                  <span className="text-xs font-mono text-yellow-400">
                    {entry.aircraft}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {entry.operator}
              </span>
            </div>
            
            <div className="text-xs text-gray-300">
              {entry.description}
            </div>
            
            {entry.location && (
              <div className="text-xs text-blue-400 font-mono mt-1">
                📍 {entry.location}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Log Statistics */}
      <div className="mt-3 bg-gray-900 border border-yellow-400/20 rounded p-2">
        <div className="grid grid-cols-4 gap-2 text-xs text-center">
          <div>
            <div className="text-green-400 font-bold">{logEntries.filter(e => e.type === 'clearance').length}</div>
            <div className="text-gray-400">Clearances</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">{logEntries.filter(e => e.type === 'movement').length}</div>
            <div className="text-gray-400">Movements</div>
          </div>
          <div>
            <div className="text-red-400 font-bold">{logEntries.filter(e => e.type === 'alert').length}</div>
            <div className="text-gray-400">Alerts</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold">{logEntries.filter(e => e.type === 'communication').length}</div>
            <div className="text-gray-400">Comms</div>
          </div>
        </div>
      </div>
    </div>
  );
};