import React, { useState, useMemo } from 'react';
import { Search, Radar, Plane, MapPin, Clock, Filter, Download, Eye } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { Aircraft } from '../types';

export const AdsbRealtimeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  const { aircraft } = useRealtimeData();

  // Filter aircraft based on search criteria
  const filteredAircraft = useMemo(() => {
    return aircraft.filter(ac => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        ac.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ac.gate && ac.gate.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || ac.status === statusFilter;

      // Type filter  
      const matchesType = typeFilter === 'all' || ac.type.includes(typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [aircraft, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: Aircraft['status']) => {
    switch (status) {
      case 'taxiing': return 'text-yellow-400 bg-yellow-400/10';
      case 'holding': return 'text-orange-400 bg-orange-400/10';
      case 'pushback': return 'text-blue-400 bg-blue-400/10';
      case 'parked': return 'text-gray-400 bg-gray-400/10';
      case 'grounded': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: Aircraft['status']) => {
    switch (status) {
      case 'taxiing': return '→';
      case 'holding': return '⏸';
      case 'pushback': return '←';
      case 'parked': return '□';
      case 'grounded': return '⚠';
      default: return '•';
    }
  };

  const exportResults = () => {
    const csvData = [
      ['Callsign', 'ICAO', 'Type', 'Status', 'Position X', 'Position Y', 'Heading', 'Gate', 'Last Update'],
      ...filteredAircraft.map(ac => [
        ac.callsign,
        ac.id,
        ac.type,
        ac.status,
        ac.position.x.toFixed(2),
        ac.position.y.toFixed(2),
        ac.heading.toString(),
        ac.gate || 'N/A',
        ac.lastUpdate.toISOString()
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adsb_search_results_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Radar className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 font-mono">ADS-B REAL-TIME SEARCH</h1>
            <p className="text-sm text-gray-400 font-mono">Aviation Efficiency Surveillance - Live Aircraft Tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400">REAL-TIME</span>
          </div>
          <div className="text-gray-400">{aircraft.length} Aircraft Tracked</div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="mb-6 bg-gray-900 border border-yellow-400/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-yellow-400 font-mono text-sm mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Aircraft
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter callsign, ICAO, type, or gate..."
              className="w-full bg-black border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-yellow-400 font-mono text-sm mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="taxiing">Taxiing</option>
              <option value="holding">Holding</option>
              <option value="pushback">Pushback</option>
              <option value="parked">Parked</option>
              <option value="grounded">Grounded</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-yellow-400 font-mono text-sm mb-2">
              <Plane className="w-4 h-4 inline mr-2" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-black border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 font-mono text-sm focus:border-yellow-400/50 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="B737">Boeing 737</option>
              <option value="A320">Airbus 320</option>
              <option value="B777">Boeing 777</option>
              <option value="A350">Airbus 350</option>
              <option value="C172">Cessna 172</option>
            </select>
          </div>
        </div>

        {/* Results Summary & Export */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-mono text-gray-400">
            Found <span className="text-yellow-400 font-bold">{filteredAircraft.length}</span> aircraft
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <button
            onClick={exportResults}
            disabled={filteredAircraft.length === 0}
            className="flex items-center space-x-2 bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 rounded px-3 py-1 text-xs text-blue-400 font-mono transition-all duration-200 disabled:opacity-50"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {filteredAircraft.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-gray-900 border border-yellow-400/20 rounded-lg">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 font-mono text-lg">No aircraft found</div>
              <div className="text-gray-500 font-mono text-sm mt-2">
                {searchTerm ? `Try adjusting your search criteria` : `Enter search terms to filter aircraft`}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-yellow-400/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-yellow-400/10 border-b border-yellow-400/20">
                <tr>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">CALLSIGN</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">ICAO</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">TYPE</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">STATUS</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">POSITION</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">HEADING</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">GATE</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">LAST UPDATE</th>
                  <th className="text-left p-3 font-mono text-sm text-yellow-400">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAircraft.map((aircraft) => (
                  <tr 
                    key={aircraft.id} 
                    className="border-b border-gray-700 hover:bg-yellow-400/5 transition-colors duration-200"
                  >
                    <td className="p-3 font-mono text-sm text-yellow-400 font-bold">
                      {aircraft.callsign}
                    </td>
                    <td className="p-3 font-mono text-sm text-gray-300">
                      {aircraft.id}
                    </td>
                    <td className="p-3 font-mono text-sm text-blue-400">
                      {aircraft.type}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${getStatusColor(aircraft.status)}`}>
                        <span className="mr-1">{getStatusIcon(aircraft.status)}</span>
                        {aircraft.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        <span>{aircraft.position.x.toFixed(0)}, {aircraft.position.y.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-sm text-gray-300">
                      {aircraft.heading}°
                    </td>
                    <td className="p-3 font-mono text-sm text-green-400">
                      {aircraft.gate || '—'}
                    </td>
                    <td className="p-3 font-mono text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{aircraft.lastUpdate.toLocaleTimeString().slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedAircraft(aircraft)}
                        className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-yellow-400/50 rounded px-2 py-1 text-xs text-gray-300 hover:text-yellow-400 font-mono transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Aircraft Detail Modal */}
      {selectedAircraft && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-yellow-400/50 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-400 font-mono text-lg font-bold">AIRCRAFT DETAILS</h3>
              <button
                onClick={() => setSelectedAircraft(null)}
                className="text-gray-400 hover:text-yellow-400 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Callsign:</span>
                <span className="text-yellow-400 font-bold">{selectedAircraft.callsign}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ICAO Address:</span>
                <span className="text-gray-300">{selectedAircraft.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aircraft Type:</span>
                <span className="text-blue-400">{selectedAircraft.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={getStatusColor(selectedAircraft.status).split(' ')[0]}>
                  {selectedAircraft.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-purple-400">
                  {selectedAircraft.position.x.toFixed(2)}, {selectedAircraft.position.y.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Heading:</span>
                <span className="text-gray-300">{selectedAircraft.heading}°</span>
              </div>
              {selectedAircraft.gate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Gate:</span>
                  <span className="text-green-400">{selectedAircraft.gate}</span>
                </div>
              )}
              {selectedAircraft.runway && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Runway:</span>
                  <span className="text-orange-400">{selectedAircraft.runway}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Last Update:</span>
                <span className="text-gray-400">{selectedAircraft.lastUpdate.toLocaleString()}</span>
              </div>
              {selectedAircraft.groundedReason && (
                <div className="mt-4 p-3 bg-red-400/10 border border-red-400/20 rounded">
                  <div className="text-red-400 font-bold mb-1">GROUNDED</div>
                  <div className="text-red-300 text-xs">{selectedAircraft.groundedReason}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-6 bg-gradient-to-r from-yellow-400/10 to-black border border-yellow-400/20 rounded p-3">
        <div className="grid grid-cols-5 gap-4 text-center text-sm font-mono">
          <div>
            <div className="text-yellow-400 font-bold text-lg">{filteredAircraft.length}</div>
            <div className="text-gray-400 text-xs">Results</div>
          </div>
          <div>
            <div className="text-green-400 font-bold text-lg">
              {filteredAircraft.filter(a => a.status === 'taxiing').length}
            </div>
            <div className="text-gray-400 text-xs">Taxiing</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">
              {filteredAircraft.filter(a => a.status === 'parked').length}
            </div>
            <div className="text-gray-400 text-xs">Parked</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold text-lg">
              {filteredAircraft.filter(a => a.status === 'holding').length}
            </div>
            <div className="text-gray-400 text-xs">Holding</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-lg">
              {filteredAircraft.filter(a => a.status === 'grounded').length}
            </div>
            <div className="text-gray-400 text-xs">Grounded</div>
          </div>
        </div>
      </div>
    </div>
  );
};