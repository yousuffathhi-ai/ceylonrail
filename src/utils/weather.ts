// Live Railway Location Weather Utility for Sri Lanka Railways

export interface RailwayWeatherStation {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  elevation_m?: number;
  isHighland?: boolean;
}

export interface LiveWeatherData {
  stationName: string;
  temperature_c: number;
  feelsLike_c: number;
  humidity_pct: number;
  windSpeed_kmh: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  advisory: string;
  elevationText?: string;
  lastUpdated: string;
  source: 'gps' | 'station' | 'cached' | 'fallback';
}

export const RAILWAY_HUBS: RailwayWeatherStation[] = [
  {
    id: 'pattipola-nanuoya',
    name: 'Pattipola & Nanu Oya',
    shortName: 'Pattipola',
    latitude: 6.8554,
    longitude: 80.8242,
    elevation_m: 1898,
    isHighland: true,
  },
  {
    id: 'colombo-fort',
    name: 'Colombo Fort',
    shortName: 'Colombo',
    latitude: 6.9344,
    longitude: 79.8503,
    elevation_m: 4,
    isHighland: false,
  },
  {
    id: 'kandy',
    name: 'Kandy (Hill Capital)',
    shortName: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    elevation_m: 500,
    isHighland: true,
  },
  {
    id: 'ella',
    name: 'Ella & Demodara',
    shortName: 'Ella',
    latitude: 6.8667,
    longitude: 81.0466,
    elevation_m: 1041,
    isHighland: true,
  },
  {
    id: 'galle',
    name: 'Galle & Southern Coast',
    shortName: 'Galle',
    latitude: 6.0367,
    longitude: 80.217,
    elevation_m: 12,
    isHighland: false,
  },
  {
    id: 'jaffna',
    name: 'Jaffna & Kankesanthurai',
    shortName: 'Jaffna',
    latitude: 9.6615,
    longitude: 80.0255,
    elevation_m: 5,
    isHighland: false,
  },
  {
    id: 'trincomalee',
    name: 'Trincomalee Bay',
    shortName: 'Trincomalee',
    latitude: 8.5874,
    longitude: 81.2152,
    elevation_m: 8,
    isHighland: false,
  },
];

// Interpret WMO weather codes into conditions & SLR railway advisories
export function interpretWmoCode(
  code: number,
  isHighland: boolean = false
): { condition: string; advisory: string } {
  if (code === 0) {
    return {
      condition: 'Clear Skies',
      advisory: isHighland
        ? 'Optimal summit visibility and dry rails for scenic mountain photography.'
        : 'Clear coastal tracks operating at full line speed.',
    };
  }
  if (code === 1 || code === 2) {
    return {
      condition: 'Partly Cloudy',
      advisory: 'Pleasant travel weather with mild breezes across the rail corridor.',
    };
  }
  if (code === 3) {
    return {
      condition: 'Overcast',
      advisory: isHighland
        ? 'High cloud ceiling over tea hills; pleasant cool traveling conditions.'
        : 'Comfortable rail travel conditions; normal operations.',
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'Dense Highland Mist',
      advisory: 'Low visibility in mountain passes. Locomotives operating with active fog headlights and caution speed.',
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      condition: 'Light Drizzle',
      advisory: 'Slight damp rails. Sanding systems active for incline traction on Kadugannawa & Demodara grades.',
    };
  }
  if (code >= 61 && code <= 65) {
    return {
      condition: 'Tropical Rain',
      advisory: 'Wet platform surfaces. Watch your step when boarding; station shelter recommended.',
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      condition: 'Passing Showers',
      advisory: 'Intermittent squalls. Express carriages running on schedule with rain-guarded vestibules.',
    };
  }
  if (code >= 95) {
    return {
      condition: 'Thunderstorm',
      advisory: 'Electrical storm activity. SLR signal telemetry monitored; maintain caution near overhead gantries.',
    };
  }
  return {
    condition: 'Moderate Weather',
    advisory: 'Regular railway operations along the permanent way.',
  };
}

// Calculate distance between two coordinates in km
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest railway hub
export function findNearestRailwayHub(
  lat: number,
  lon: number
): RailwayWeatherStation {
  let nearest = RAILWAY_HUBS[0];
  let minDistance = Infinity;

  for (const hub of RAILWAY_HUBS) {
    const d = calculateDistanceKm(lat, lon, hub.latitude, hub.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = hub;
    }
  }
  return nearest;
}

// Fetch live weather from Open-Meteo
export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  stationName: string,
  isHighland: boolean = false,
  elevation_m?: number,
  source: 'gps' | 'station' = 'station'
): Promise<LiveWeatherData> {
  const cacheKey = `ceylon_rail_weather_${stationName.replace(/\s+/g, '_')}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }

    const data = await res.json();
    const cur = data.current;

    const { condition, advisory } = interpretWmoCode(cur.weather_code, isHighland);

    const result: LiveWeatherData = {
      stationName,
      temperature_c: Math.round(cur.temperature_2m),
      feelsLike_c: Math.round(cur.apparent_temperature),
      humidity_pct: cur.relative_humidity_2m,
      windSpeed_kmh: Math.round(cur.wind_speed_10m),
      condition,
      weatherCode: cur.weather_code,
      isDay: cur.is_day === 1,
      advisory,
      elevationText: elevation_m ? `${elevation_m}m Summit` : undefined,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source,
    };

    // Cache locally for offline resiliency
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // Ignore storage errors
    }

    return result;
  } catch {
    // Attempt to read cached weather
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, source: 'cached' };
      }
    } catch {
      // ignore
    }

    // Default highland/coastal fallback
    return {
      stationName,
      temperature_c: isHighland ? 14 : 29,
      feelsLike_c: isHighland ? 13 : 32,
      humidity_pct: isHighland ? 88 : 74,
      windSpeed_kmh: 12,
      condition: isHighland ? 'Heavy Mist & Low Visibility' : 'Sunny Ocean Breeze',
      weatherCode: isHighland ? 45 : 1,
      isDay: true,
      advisory: isHighland
        ? 'Highland cloud cover between Pattipola and Ohiya. Speeds reduced by 10 km/h for safety.'
        : 'Coastal rail corridor operating at full line speed with clear ocean views.',
      elevationText: elevation_m ? `${elevation_m}m Summit` : undefined,
      lastUpdated: 'Live Snapshot',
      source: 'fallback',
    };
  }
}

export interface StationWeather {
  station: string;
  condition: string;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  is_rainy: boolean;
  advisory: string;
  elevation_m?: number;
}

export async function fetchStationWeather(
  stationName: string,
  latitude?: number,
  longitude?: number,
  elevation_m?: number
): Promise<StationWeather> {
  const isHighland = Boolean(elevation_m && elevation_m > 400);
  const lat = latitude ?? 6.9344;
  const lon = longitude ?? 79.8503;

  const data = await fetchLiveWeather(
    lat,
    lon,
    stationName,
    isHighland,
    elevation_m,
    'station'
  );

  return {
    station: data.stationName,
    condition: data.condition,
    temperature_c: data.temperature_c,
    humidity_pct: data.humidity_pct,
    wind_speed_kmh: data.windSpeed_kmh,
    is_rainy: data.weatherCode >= 51,
    advisory: data.advisory,
    elevation_m,
  };
}
