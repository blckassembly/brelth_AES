import React from 'react';
import { WeatherData } from '../types';
import { Wind, Thermometer, Eye, Gauge, CloudRain } from 'lucide-react';

interface WeatherPanelProps {
  weather: WeatherData | null;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex items-center justify-center">
        <span className="text-gray-400 font-mono">Loading weather data...</span>
      </div>
    );
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getVisibilityStatus = (visibility: number) => {
    if (visibility >= 6) return { color: 'text-green-400', status: 'EXCELLENT' };
    if (visibility >= 3) return { color: 'text-yellow-400', status: 'GOOD' };
    if (visibility >= 1) return { color: 'text-orange-400', status: 'POOR' };
    return { color: 'text-red-400', status: 'CRITICAL' };
  };

  const visibilityStatus = getVisibilityStatus(weather.visibility);

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-yellow-400 font-mono text-lg font-bold">WEATHER CONDITIONS</h2>
        <div className="text-xs text-gray-400">
          Updated: {weather.lastUpdate.toLocaleTimeString().slice(0, 5)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Wind Information */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-mono text-sm">WIND</span>
            </div>
            <span className="text-yellow-400 font-mono font-bold">
              {weather.windDirection}°/{weather.windSpeed}kt
            </span>
          </div>
          <div className="text-xs text-gray-300">
            Direction: {getWindDirection(weather.windDirection)} ({weather.windDirection}°)
          </div>
          <div className="text-xs text-gray-300">
            Speed: {weather.windSpeed} knots
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-mono text-sm">VISIBILITY</span>
            </div>
            <span className="text-yellow-400 font-mono font-bold">
              {weather.visibility} SM
            </span>
          </div>
          <div className={`text-xs font-mono ${visibilityStatus.color}`}>
            STATUS: {visibilityStatus.status}
          </div>
        </div>

        {/* Temperature & Pressure */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-900 border border-yellow-400/20 rounded p-2">
            <div className="flex items-center space-x-2 mb-1">
              <Thermometer className="w-3 h-3 text-red-400" />
              <span className="text-red-400 font-mono text-xs">TEMP</span>
            </div>
            <div className="text-yellow-400 font-mono font-bold">
              {weather.temperature}°C
            </div>
          </div>
          
          <div className="bg-gray-900 border border-yellow-400/20 rounded p-2">
            <div className="flex items-center space-x-2 mb-1">
              <Gauge className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-mono text-xs">QNH</span>
            </div>
            <div className="text-yellow-400 font-mono font-bold">
              {weather.pressure}"
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-sm">CONDITIONS</span>
          </div>
          <div className="text-yellow-400 font-mono font-bold">
            {weather.conditions}
          </div>
        </div>

        {/* Ground Operations Impact */}
        <div className="bg-blue-400/10 border border-blue-400/20 rounded p-2">
          <div className="text-xs text-blue-400 mb-1">GROUND OPS IMPACT:</div>
          <div className="text-xs text-gray-300">
            {weather.visibility >= 6 && weather.windSpeed < 25 
              ? "✓ Optimal conditions for all ground operations"
              : weather.visibility >= 3 && weather.windSpeed < 35
              ? "⚠ Reduced visibility - exercise caution"
              : "⚠ Adverse conditions - limited operations"
            }
          </div>
        </div>
      </div>
    </div>
  );
};