import React, { useState, useEffect } from 'react';
import {
  X,
  CloudSun,
  CloudRain,
  Sun,
  CloudFog,
  CloudLightning,
  MapPin,
  Navigation,
  RefreshCw,
  Compass,
  Wind,
  Droplets,
  Mountain,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  RAILWAY_HUBS,
  RailwayWeatherStation,
  LiveWeatherData,
  fetchLiveWeather,
  findNearestRailwayHub,
} from '../../utils/weather';

interface LiveWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStationId: string;
  onSelectStation: (station: RailwayWeatherStation, weatherData: LiveWeatherData) => void;
}

export const LiveWeatherModal: React.FC<LiveWeatherModalProps> = ({
  isOpen,
  onClose,
  currentStationId,
  onSelectStation,
}) => {
  const [selectedHub, setSelectedHub] = useState<RailwayWeatherStation>(() => {
    const found = RAILWAY_HUBS.find((h) => h.id === currentStationId);
    return found || RAILWAY_HUBS[0];
  });

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLocationName, setGpsLocationName] = useState<string | null>(null);

  // Load weather for selected hub
  const loadWeatherForStation = async (station: RailwayWeatherStation) => {
    setLoading(true);
    setGpsError(null);
    try {
      const data = await fetchLiveWeather(
        station.latitude,
        station.longitude,
        station.name,
        station.isHighland,
        station.elevation_m,
        'station'
      );
      setWeather(data);
      onSelectStation(station, data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWeatherForStation(selectedHub);
    }
  }, [isOpen, selectedHub.id]);

  // Request GPS Live Location
  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearestHub = findNearestRailwayHub(latitude, longitude);
        const isHighland = latitude > 6.7 && latitude < 7.5 && longitude > 80.4 && longitude < 81.2;

        try {
          const liveData = await fetchLiveWeather(
            latitude,
            longitude,
            `Live GPS: Near ${nearestHub.shortName}`,
            isHighland,
            nearestHub.elevation_m,
            'gps'
          );
          setWeather(liveData);
          setSelectedHub(nearestHub);
          setGpsLocationName(`Near ${nearestHub.shortName} Station`);
          onSelectStation(
            {
              ...nearestHub,
              name: `Live GPS (${nearestHub.shortName})`,
            },
            liveData
          );
        } catch {
          setGpsError('Could not fetch weather for current GPS coordinates.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location access was denied. Please allow location permissions to see live railway weather.');
        } else {
          setGpsError('Could not retrieve GPS location. Showing Pattipola summit weather.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  const getWeatherIcon = (code: number, isHighland?: boolean) => {
    if (code >= 95) return <CloudLightning className="w-10 h-10 text-amber-400" />;
    if (code >= 51) return <CloudRain className="w-10 h-10 text-cyan-400" />;
    if (code === 45 || code === 48 || isHighland) return <CloudFog className="w-10 h-10 text-[#C7DDD4]" />;
    if (code === 0) return <Sun className="w-10 h-10 text-[#F59E0B]" />;
    return <CloudSun className="w-10 h-10 text-[#D4A359]" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0A1610]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F2] text-[#173024] rounded-2xl max-w-lg w-full border border-[#D5CAA4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#173024] text-[#F4F0EA] px-5 py-4 flex items-center justify-between border-b border-[#2C4F3D] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#234534] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base tracking-wide text-white flex items-center gap-2">
                Live Railway Weather ☁️
              </h3>
              <p className="text-[11px] text-[#A7C2B3]">
                Open-Meteo Real-Time Telemetry & Ceylon Track Conditions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#234534] hover:bg-[#2F5A44] text-[#C5D9CE] hover:text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* GPS Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#EFE9DC] p-3 rounded-xl border border-[#DDD3BF]">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#173024] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#173024] block">
                  {gpsLocationName ? `Detected: ${gpsLocationName}` : 'Auto-Detect My Station Weather'}
                </span>
                <span className="text-[10px] text-[#6E685D]">
                  Uses device GPS coordinates for live track forecasts
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseGpsLocation}
              disabled={gpsLoading}
              className="flex items-center justify-center gap-1.5 bg-[#173024] hover:bg-[#244737] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-transform active:scale-95 disabled:opacity-60 shadow-xs shrink-0"
            >
              {gpsLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A359]" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Use My Location</span>
                </>
              )}
            </button>
          </div>

          {gpsError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Featured Live Weather Stage */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#173024] via-[#1E3B2D] to-[#12241C] text-white p-5 border border-[#325844] shadow-md">
            <div className="absolute top-2 right-2 opacity-10">
              <Compass className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D4A359]/20 text-[#F0D5A5] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#D4A359]/30">
                      LIVE SLR METEOROLOGY
                    </span>
                    {weather?.elevationText && (
                      <span className="bg-[#758A80]/30 text-[#D8E6DE] text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-[#D4A359]" />
                        {weather.elevationText}
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                    {weather?.stationName || selectedHub.name}
                  </h4>
                  <p className="text-xs text-[#A5C1B3] mt-0.5 flex items-center gap-1.5">
                    <span>{weather?.condition || 'Updating telemetric data...'}</span>
                    <span>•</span>
                    <span>{weather?.lastUpdated ? `Updated ${weather.lastUpdated}` : 'Real-time'}</span>
                  </p>
                </div>

                <div className="p-2 bg-[#12241C]/60 rounded-xl border border-[#2D503E]/80 shrink-0">
                  {getWeatherIcon(weather?.weatherCode || 0, selectedHub.isHighland)}
                </div>
              </div>

              {/* Temperature & Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#294B39]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9AB3A6] block">
                    Temperature
                  </span>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                    <span>{weather?.temperature_c ?? '--'}°C</span>
                    <span className="text-[10px] text-[#A5C1B3] font-normal">
                      (Feels {weather?.feelsLike_c ?? '--'}°)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9AB3A6] flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>Humidity</span>
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {weather?.humidity_pct ?? '--'}%
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9AB3A6] flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#D4A359]" />
                    <span>Wind Speed</span>
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {weather?.windSpeed_kmh ?? '--'} km/h
                  </div>
                </div>
              </div>

              {/* Railway Safety & Sightseeing Advisory */}
              {weather?.advisory && (
                <div className="mt-4 bg-[#102319] p-2.5 rounded-xl border border-[#2B4B39] text-xs text-[#D5E3DC] flex items-start gap-2">
                  <span className="text-[#D4A359] font-bold shrink-0">SLR Advisory:</span>
                  <span>{weather.advisory}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Hub Station Selector */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#6E685D] mb-2 flex items-center justify-between">
              <span>Select Railway Hub</span>
              <span className="text-[10px] font-normal text-[#8A8275]">
                Tap to check weather along SLR lines
              </span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RAILWAY_HUBS.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => {
                      setSelectedHub(hub);
                      setGpsLocationName(null);
                      loadWeatherForStation(hub);
                    }}
                    className={`flex items-start justify-between p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#173024] text-white border-[#173024] shadow-xs'
                        : 'bg-[#F2ECE0] text-[#1F2923] border-[#DDD3BF] hover:bg-[#EAE2D2]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold leading-tight">
                        {hub.name}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-[#C5D8CE]' : 'text-[#7A7468]'
                        }`}
                      >
                        {hub.isHighland ? `${hub.elevation_m}m • Highland` : 'Coastal Line'}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#D4A359] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#EFE9DC] border-t border-[#DDD3BF] flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-[11px] text-[#6E685D]">
            Source: Open-Meteo High-Resolution Model
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#173024] hover:bg-[#254A38] text-white rounded-xl font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
