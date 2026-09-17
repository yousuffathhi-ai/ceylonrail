import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudFog,
  Wind,
  Droplets,
  Mountain,
  AlertCircle,
  Thermometer,
  Sparkles,
} from 'lucide-react';
import { fetchStationWeather, StationWeather } from '../../utils/weather';
import { STATIONS } from '../../data/timetableData';

interface WeatherWidgetProps {
  stationName: string;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ stationName, className = '' }) => {
  const [weather, setWeather] = useState<StationWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const station = STATIONS.find(
      (s) =>
        s.name_en.toLowerCase() === stationName.toLowerCase() ||
        stationName.toLowerCase().includes(s.name_en.toLowerCase())
    );

    setLoading(true);
    fetchStationWeather(
      stationName,
      station?.latitude,
      station?.longitude,
      station?.elevation_m
    ).then((w) => {
      if (mounted) {
        setWeather(w);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [stationName]);

  const getWeatherIcon = (condition: string, isRainy: boolean) => {
    if (isRainy) return <CloudRain className="w-6 h-6 text-[#4F84B8]" />;
    if (condition.toLowerCase().includes('fog') || condition.toLowerCase().includes('mist')) {
      return <CloudFog className="w-6 h-6 text-[#7E8B9B]" />;
    }
    if (condition.toLowerCase().includes('cloud') || condition.toLowerCase().includes('overcast')) {
      return <Cloud className="w-6 h-6 text-[#6B7D74]" />;
    }
    return <Sun className="w-6 h-6 text-[#E5A93C]" />;
  };

  if (loading && !weather) {
    return (
      <div className={`bg-[#EDE7DA] rounded-xl p-3 border border-[#D5CCB8] animate-pulse flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#D4CAB6]" />
          <div className="space-y-1">
            <div className="w-24 h-3 bg-[#D4CAB6] rounded" />
            <div className="w-16 h-2.5 bg-[#D4CAB6] rounded" />
          </div>
        </div>
        <div className="w-10 h-6 bg-[#D4CAB6] rounded" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`bg-gradient-to-br from-[#EFE8DC] to-[#E5DDD0] rounded-xl p-3.5 border border-[#D2C8B4] text-[#1F2923] shadow-xs ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBA]/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#635F57] flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-[#5B7B6E]" />
            Destination Arrival Weather
          </span>
        </div>
        {weather.elevation_m !== undefined && weather.elevation_m > 50 && (
          <span className="text-[10px] font-mono text-[#524E47] bg-[#DDD4C2] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Mountain className="w-2.5 h-2.5 text-[#5B7B6E]" />
            {weather.elevation_m}m elevation
          </span>
        )}
      </div>

      {/* Main Stats Row */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DDD4C2] shadow-2xs">
            {getWeatherIcon(weather.condition, weather.is_rainy)}
          </div>
          <div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[#173024] leading-tight">
              {weather.temperature_c}°C
            </div>
            <div className="text-xs font-semibold text-[#4A463F]">
              {weather.condition}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[10px] text-[#7A746B] flex items-center justify-end gap-1">
              <Droplets className="w-2.5 h-2.5 text-[#5B7B6E]" />
              Humidity
            </div>
            <div className="text-xs font-mono font-bold text-[#1F2923]">
              {weather.humidity_pct}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#7A746B] flex items-center justify-end gap-1">
              <Wind className="w-2.5 h-2.5 text-[#5B7B6E]" />
              Wind
            </div>
            <div className="text-xs font-mono font-bold text-[#1F2923]">
              {weather.wind_speed_kmh} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Travel Advice Tip */}
      <div className="mt-2.5 pt-2 border-t border-[#D8CEBA]/80 flex items-start gap-1.5 text-[11px] text-[#4A463F] leading-snug">
        <Sparkles className="w-3.5 h-3.5 text-[#C88A35] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#173024] font-medium">{weather.station}:</strong> {weather.advisory}
        </span>
      </div>
    </div>
  );
};
