// Sri Lanka Stations Weather Utility using Open-Meteo public API with offline fallback
export interface StationWeather {
  station: string;
  temperature_c: number;
  condition: string;
  humidity_pct: number;
  wind_speed_kmh: number;
  feels_like_c: number;
  is_rainy: boolean;
  advisory: string;
  elevation_m?: number;
}

// Station climate heuristics for realistic instant response & offline resilience
const REGION_WEATHER_DEFAULTS: Record<string, Partial<StationWeather>> = {
  // Hill Country
  'Nanu Oya (Nuwara Eliya)': { temperature_c: 16, condition: 'Misty & Cool', humidity_pct: 88, wind_speed_kmh: 12, is_rainy: false, advisory: 'Cool mountain air. Carry warm layers and rain jacket.' },
  'Nanu Oya': { temperature_c: 16, condition: 'Misty & Cool', humidity_pct: 88, wind_speed_kmh: 12, is_rainy: false, advisory: 'Cool mountain air. Carry warm layers.' },
  'Pattipola': { temperature_c: 13, condition: 'Mountain Fog', humidity_pct: 92, wind_speed_kmh: 15, is_rainy: false, advisory: 'Highest rail point in Sri Lanka. Cold mountain mist.' },
  'Ella': { temperature_c: 21, condition: 'Pleasant & Breezy', humidity_pct: 75, wind_speed_kmh: 10, is_rainy: false, advisory: 'Mild hill-country climate. Ideal for hiking Nine Arch Bridge.' },
  'Kandy': { temperature_c: 25, condition: 'Partly Cloudy', humidity_pct: 78, wind_speed_kmh: 8, is_rainy: false, advisory: 'Moderate highland warmth. Light sweater recommended for evening.' },
  'Badulla': { temperature_c: 24, condition: 'Mild Valleys', humidity_pct: 72, wind_speed_kmh: 7, is_rainy: false, advisory: 'Warm valley temperatures with scenic mountain backdrop.' },
  'Hatton': { temperature_c: 18, condition: 'Passing Mist', humidity_pct: 85, wind_speed_kmh: 14, is_rainy: false, advisory: 'Gateway to Adams Peak. Cool and humid.' },
  
  // Coast & Lowlands
  'Colombo Fort': { temperature_c: 30, condition: 'Warm & Tropical', humidity_pct: 74, wind_speed_kmh: 16, is_rainy: false, advisory: 'Tropical coastal heat. Light cotton clothing recommended.' },
  'Galle': { temperature_c: 29, condition: 'Ocean Breeze', humidity_pct: 76, wind_speed_kmh: 18, is_rainy: false, advisory: 'Fresh Indian Ocean breeze. Perfect for strolling Galle Fort.' },
  'Matara': { temperature_c: 29, condition: 'Coastal Sunny', humidity_pct: 75, wind_speed_kmh: 15, is_rainy: false, advisory: 'Warm coastal weather with gentle sea breeze.' },
  'Beliatta': { temperature_c: 30, condition: 'Sunny & Humid', humidity_pct: 73, wind_speed_kmh: 14, is_rainy: false, advisory: 'Sunny southern terrain.' },
  
  // North & East
  'Jaffna': { temperature_c: 31, condition: 'Dry & Sunny', humidity_pct: 65, wind_speed_kmh: 19, is_rainy: false, advisory: 'Warm dry zone sun. High UV index; stay hydrated.' },
  'Kankesanthurai': { temperature_c: 30, condition: 'Coastal Warmth', humidity_pct: 68, wind_speed_kmh: 20, is_rainy: false, advisory: 'Palmyrah breeze from the northern sea.' },
  'Trincomalee': { temperature_c: 31, condition: 'Sunny Ocean Skies', humidity_pct: 66, wind_speed_kmh: 16, is_rainy: false, advisory: 'Deep natural harbor breezes. Ideal beach weather.' },
  'Batticaloa': { temperature_c: 30, condition: 'Warm Lagoon Sun', humidity_pct: 70, wind_speed_kmh: 13, is_rainy: false, advisory: 'Warm eastern coastal sunshine.' },
  'Anuradhapura': { temperature_c: 32, condition: 'Warm Cultural Dry Zone', humidity_pct: 60, wind_speed_kmh: 11, is_rainy: false, advisory: 'Warm dry plains. Bring hat and water when visiting stupas.' },
};

function decodeWeatherCode(code: number): { condition: string; is_rainy: boolean } {
  if (code === 0) return { condition: 'Clear Sky', is_rainy: false };
  if (code <= 3) return { condition: 'Partly Cloudy', is_rainy: false };
  if (code === 45 || code === 48) return { condition: 'Misty Fog', is_rainy: false };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', is_rainy: true };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', is_rainy: true };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', is_rainy: true };
  if (code >= 95) return { condition: 'Thunderstorm', is_rainy: true };
  return { condition: 'Fair Weather', is_rainy: false };
}

export async function fetchStationWeather(
  stationName: string,
  lat?: number,
  lon?: number,
  elevation?: number
): Promise<StationWeather> {
  const fallback = REGION_WEATHER_DEFAULTS[stationName] || {
    temperature_c: 28,
    condition: 'Tropical Fair',
    humidity_pct: 75,
    wind_speed_kmh: 14,
    is_rainy: false,
    advisory: 'Comfortable tropical weather for train travel.',
  };

  if (!lat || !lon) {
    return {
      station: stationName,
      temperature_c: fallback.temperature_c!,
      condition: fallback.condition!,
      humidity_pct: fallback.humidity_pct!,
      wind_speed_kmh: fallback.wind_speed_kmh!,
      feels_like_c: fallback.temperature_c! + 2,
      is_rainy: fallback.is_rainy!,
      advisory: fallback.advisory!,
      elevation_m: elevation,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      const decoded = decodeWeatherCode(current.weather_code);

      let advisory = fallback.advisory || 'Pleasant weather for railway arrival.';
      if (decoded.is_rainy) {
        advisory = 'Rain expected upon arrival. Bring an umbrella or raincoat.';
      } else if (current.temperature_2m < 18) {
        advisory = 'Crisp mountain cold upon arrival. Warm layers advised.';
      } else if (current.temperature_2m > 31) {
        advisory = 'Hot tropical sun upon arrival. Stay hydrated and wear sun hat.';
      }

      return {
        station: stationName,
        temperature_c: Math.round(current.temperature_2m),
        condition: decoded.condition,
        humidity_pct: Math.round(current.relative_humidity_2m),
        wind_speed_kmh: Math.round(current.wind_speed_10m),
        feels_like_c: Math.round(current.apparent_temperature),
        is_rainy: decoded.is_rainy,
        advisory,
        elevation_m: elevation,
      };
    }
  } catch (err) {
    // Graceful fallback to offline heuristic
  }

  return {
    station: stationName,
    temperature_c: fallback.temperature_c!,
    condition: fallback.condition!,
    humidity_pct: fallback.humidity_pct!,
    wind_speed_kmh: fallback.wind_speed_kmh!,
    feels_like_c: fallback.temperature_c! + 2,
    is_rainy: fallback.is_rainy!,
    advisory: fallback.advisory!,
    elevation_m: elevation,
  };
}
