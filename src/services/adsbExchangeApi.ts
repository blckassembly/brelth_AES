/**
 * ADSB Exchange API Service
 * Integrates with ADSB Exchange v2 API for real-time and historical aircraft tracking
 */

const API_ROOT = "https://api.adsbexchange.com/api/aircraft/v2";
const API_KEY = "65c5053c-908b-48f9-b68a-f6d17699f27d";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 6;

interface TracePoint {
  dt_offset: number;
  lat: number;
  lon: number;
  alt: number | string | null; // Can be altitude in feet or "ground"
  gs: number; // Ground speed in knots
  track: number; // Track or heading in degrees
  flags: number;
  vrate: number; // Vertical rate in fpm
  pos_source: string;
  geom_alt: number;
  geom_vrate: number;
  ias: number; // Indicated airspeed
  roll: number;
}

interface TraceResponse {
  timestamp: number;
  trace: number[][]; // Raw trace data arrays
}

interface LastKnownPosition {
  icao: string;
  latitude: number;
  longitude: number;
  altitude: number | string;
  groundSpeed: number;
  heading: number;
  timestamp: Date;
  status: 'active' | 'historical' | 'unknown';
  source: 'recent' | 'historical';
}

interface OperationsItem {
  time: number;
  eventType: string;
  airport?: string;
  airportIcao?: string;
  runway?: string;
  lat?: number;
  lon?: number;
}

class AdsbExchangeError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'AdsbExchangeError';
  }
}

const _headers = (): Record<string, string> => ({
  "X-Api-Key": API_KEY,
  "Accept-Encoding": "gzip",
  "User-Agent": "AES-ATC/2.1.0",
  "Accept": "application/json"
});

const _request = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = { ..._headers(), ...options.headers };
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT)
      });

      // Handle rate limiting and server errors with exponential backoff
      if ([429, 500, 502, 503, 504].includes(response.status)) {
        if (attempt === MAX_RETRIES - 1) {
          throw new AdsbExchangeError(
            `API request failed after ${MAX_RETRIES} attempts: ${response.status} ${response.statusText}`,
            response.status
          );
        }
        const delay = Math.min(Math.pow(2, attempt) * 1000, 60000); // Max 60s delay
        console.warn(`ADSB API rate limited/error (${response.status}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        if (error instanceof AdsbExchangeError) throw error;
        throw new AdsbExchangeError(
          `Network error after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`ADSB API network error, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new AdsbExchangeError('Unreachable retry loop');
};

const _traceUrlRecent = (icaoLower: string): string => {
  const folder = icaoLower.slice(-2);
  return `${API_ROOT}/traces/${folder}/trace_recent_${icaoLower}.json`;
};

const _traceUrlHistorical = (icaoLower: string, date: Date): string => {
  const folder = icaoLower.slice(-2);
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${API_ROOT}/traces-hist/${year}/${month}/${day}/traces/${folder}/trace_full_${icaoLower}.json`;
};

/**
 * Fetch trace data from ADSB Exchange API
 */
const fetchTraceJson = async (url: string): Promise<TraceResponse | null> => {
  try {
    const response = await _request(url);
    
    if (response.status === 404) {
      return null; // No data available for this aircraft/date
    }
    
    if (!response.ok) {
      throw new AdsbExchangeError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as TraceResponse;
  } catch (error) {
    if (error instanceof AdsbExchangeError) throw error;
    throw new AdsbExchangeError(`Failed to fetch trace data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Parse raw trace point data into structured format
 */
const parseTracePoint = (baseTimestamp: number, rawPoint: number[]): TracePoint | null => {
  if (!rawPoint || rawPoint.length < 6) return null;
  
  try {
    return {
      dt_offset: rawPoint[0] || 0,
      lat: rawPoint[1] || 0,
      lon: rawPoint[2] || 0,
      alt: rawPoint[3] !== null ? rawPoint[3] : 0,
      gs: rawPoint[4] || 0,
      track: rawPoint[5] || 0,
      flags: rawPoint[6] || 0,
      vrate: rawPoint[7] || 0,
      pos_source: rawPoint[9] || 'unknown',
      geom_alt: rawPoint[10] || 0,
      geom_vrate: rawPoint[11] || 0,
      ias: rawPoint[12] || 0,
      roll: rawPoint[13] || 0
    };
  } catch (error) {
    console.warn('Failed to parse trace point:', rawPoint);
    return null;
  }
};

/**
 * Get the last known position for an aircraft
 * Tries recent data first, then falls back to historical data
 */
export const gatherLastKnownPosition = async (icaoHex: string): Promise<LastKnownPosition | null> => {
  const icaoLower = icaoHex.toLowerCase();
  
  try {
    // Try recent data first (today)
    const recentUrl = _traceUrlRecent(icaoLower);
    const recentData = await fetchTraceJson(recentUrl);
    
    if (recentData && recentData.trace && recentData.trace.length > 0) {
      const lastRawPoint = recentData.trace[recentData.trace.length - 1];
      const lastPoint = parseTracePoint(recentData.timestamp, lastRawPoint);
      
      if (lastPoint && lastPoint.lat !== 0 && lastPoint.lon !== 0) {
        const absoluteTimestamp = recentData.timestamp + lastPoint.dt_offset;
        
        return {
          icao: icaoHex.toUpperCase(),
          latitude: lastPoint.lat,
          longitude: lastPoint.lon,
          altitude: lastPoint.alt,
          groundSpeed: lastPoint.gs,
          heading: lastPoint.track,
          timestamp: new Date(absoluteTimestamp * 1000),
          status: 'active',
          source: 'recent'
        };
      }
    }

    // Fall back to historical data (try last 7 days)
    for (let daysBack = 1; daysBack <= 7; daysBack++) {
      const date = new Date();
      date.setDate(date.getDate() - daysBack);
      
      const histUrl = _traceUrlHistorical(icaoLower, date);
      const histData = await fetchTraceJson(histUrl);
      
      if (histData && histData.trace && histData.trace.length > 0) {
        const lastRawPoint = histData.trace[histData.trace.length - 1];
        const lastPoint = parseTracePoint(histData.timestamp, lastRawPoint);
        
        if (lastPoint && lastPoint.lat !== 0 && lastPoint.lon !== 0) {
          const absoluteTimestamp = histData.timestamp + lastPoint.dt_offset;
          
          return {
            icao: icaoHex.toUpperCase(),
            latitude: lastPoint.lat,
            longitude: lastPoint.lon,
            altitude: lastPoint.alt,
            groundSpeed: lastPoint.gs,
            heading: lastPoint.track,
            timestamp: new Date(absoluteTimestamp * 1000),
            status: 'historical',
            source: 'historical'
          };
        }
      }
    }

    return null; // No data found
  } catch (error) {
    if (error instanceof AdsbExchangeError) throw error;
    throw new AdsbExchangeError(`Failed to gather last known position: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Search for multiple aircraft by pattern (e.g., airline code)
 */
export const searchAircraftByPattern = async (pattern: string): Promise<LastKnownPosition[]> => {
  // This would require a different API endpoint or approach
  // For now, we'll return an empty array and suggest using specific ICAO hex codes
  console.warn('Pattern-based aircraft search not yet implemented');
  return [];
};

/**
 * Get operations (takeoff/landing events) for an aircraft
 */
export const fetchOperations = async (
  icaoHex: string, 
  fromDate?: Date, 
  toDate?: Date
): Promise<OperationsItem[]> => {
  const from = fromDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default: 1 year ago
  const to = toDate || new Date();
  
  const timeFrom = Math.floor(from.getTime() / 1000);
  const timeTo = Math.floor(to.getTime() / 1000);
  
  const url = `${API_ROOT}/operations/icao/${icaoHex}?page=1&time_from=${timeFrom}&time_to=${timeTo}`;
  
  try {
    const response = await _request(url);
    
    if (response.status === 404) {
      return []; // No operations data
    }
    
    if (!response.ok) {
      throw new AdsbExchangeError(
        `Operations API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    if (error instanceof AdsbExchangeError) throw error;
    throw new AdsbExchangeError(`Failed to fetch operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Format position data for display
 */
export const formatPosition = (position: LastKnownPosition): string => {
  const timeAgo = Math.floor((Date.now() - position.timestamp.getTime()) / 1000);
  const timeDisplay = timeAgo < 3600 
    ? `${Math.floor(timeAgo / 60)} minutes ago`
    : timeAgo < 86400
    ? `${Math.floor(timeAgo / 3600)} hours ago`
    : `${Math.floor(timeAgo / 86400)} days ago`;

  const altitudeDisplay = typeof position.altitude === 'number' 
    ? `${position.altitude.toLocaleString()} ft`
    : position.altitude === 'ground'
    ? 'On Ground'
    : 'Unknown altitude';

  return `🛩️ AIRCRAFT LOCATED: ${position.icao}
📍 Position: ${position.latitude.toFixed(6)}°, ${position.longitude.toFixed(6)}°
🏔️ Altitude: ${altitudeDisplay}
🧭 Heading: ${position.heading}°
⚡ Ground Speed: ${position.groundSpeed} knots
🕐 Last Seen: ${timeDisplay} (${position.timestamp.toISOString()})
📡 Data Source: ${position.source === 'recent' ? 'Real-time' : 'Historical'}
⚠️ Status: ${position.status === 'active' ? 'Recently Active' : 'Historical Data'}`;
};

export { AdsbExchangeError };
export type { LastKnownPosition, TracePoint, OperationsItem };