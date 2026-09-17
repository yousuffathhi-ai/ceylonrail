import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Compass,
  Train,
  ArrowRight,
  Info,
  Layers,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Activity,
  Mountain,
  Ruler,
} from 'lucide-react';
import { Language, Station, RailwayLine, OperatingRegion, TrainSchedule } from '../../types';
import { translations } from '../../data/localization';
import { STATIONS, TRAIN_SCHEDULES } from '../../data/timetableData';
import { PredictiveStationInput } from '../common/PredictiveStationInput';

interface InteractiveMapViewProps {
  language: Language;
  onSelectStation: (station: Station) => void;
  onSelectTrain?: (train: TrainSchedule) => void;
}

// Coordinate mapping for Sri Lanka SVG
// Sri Lanka bounding box: Lat 5.8 to 9.9, Lon 79.5 to 81.9
const SVG_WIDTH = 560;
const SVG_HEIGHT = 700;

function latLonToSvg(lat: number, lon: number) {
  const minLat = 5.75;
  const maxLat = 10.0;
  const minLon = 79.4;
  const maxLon = 82.15;

  const x = ((lon - minLon) / (maxLon - minLon)) * (SVG_WIDTH - 80) + 40;
  const y = SVG_HEIGHT - (((lat - minLat) / (maxLat - minLat)) * (SVG_HEIGHT - 80) + 40);

  return { x, y };
}

// Colors according to Official Sri Lanka Railways Operating Regions
const REGION_COLORS: Record<OperatingRegion, { primary: string; bg: string; label: string }> = {
  Colombo: {
    primary: '#D32F2F', // Official Red
    bg: '#FFEBEE',
    label: 'Colombo Operating Region',
  },
  Nawalapitiya: {
    primary: '#2E7D32', // Official Green
    bg: '#E8F5E9',
    label: 'Nawalapitiya Operating Region (Highlands)',
  },
  Anuradhapura: {
    primary: '#1565C0', // Official Blue
    bg: '#E3F2FD',
    label: 'Anuradhapura Operating Region (North & East)',
  },
};

const LINE_COLORS: Record<RailwayLine, string> = {
  'Main Line': '#2E7D32',
  'Coastal Line': '#00838F',
  'Northern Line': '#1565C0',
  'Eastern Line': '#D84315',
  'Kelani Valley Line': '#4E342E',
  'Puttalam Line': '#6A1B9A',
};

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  language,
  onSelectStation,
  onSelectTrain,
}) => {
  const t = translations[language];

  const [colorMode, setColorMode] = useState<'region' | 'line'>('region');
  const [selectedRegion, setSelectedRegion] = useState<OperatingRegion | 'All'>('All');
  const [selectedLine, setSelectedLine] = useState<RailwayLine | 'All'>('All');
  const [selectedStation, setSelectedStation] = useState<Station | null>(
    STATIONS.find((s) => s.code === 'ELL') || STATIONS[0]
  );
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [showLiveTrains, setShowLiveTrains] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Distance calculator mode (measure distance between 2 stations)
  const [measureMode, setMeasureMode] = useState(false);
  const [stationA, setStationA] = useState<Station | null>(STATIONS.find((s) => s.code === 'FOT') || null);
  const [stationB, setStationB] = useState<Station | null>(STATIONS.find((s) => s.code === 'ELL') || null);

  // Filtered stations for display
  const filteredStations = useMemo(() => {
    return STATIONS.filter((s) => {
      if (colorMode === 'region' && selectedRegion !== 'All' && s.operating_region !== selectedRegion) {
        return false;
      }
      if (colorMode === 'line' && selectedLine !== 'All' && s.line !== selectedLine) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name_en.toLowerCase().includes(q) ||
          s.name_si.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [colorMode, selectedRegion, selectedLine, searchQuery]);

  // Generate railway network tracks by official sequence
  const trackSegments = useMemo(() => {
    // We break the tracks into official branches to ensure authentic alignment
    const branches = [
      // Main Line: Colombo Fort -> Rambukkana (Colombo Region)
      {
        id: 'main-colombo',
        region: 'Colombo' as OperatingRegion,
        line: 'Main Line' as RailwayLine,
        codes: ['FOT', 'MDA', 'RGM', 'GPH', 'VYG', 'MRG', 'PLG', 'RBK'],
      },
      // Main Line: Rambukkana -> Badulla (Nawalapitiya Region)
      {
        id: 'main-nawalapitiya',
        region: 'Nawalapitiya' as OperatingRegion,
        line: 'Main Line' as RailwayLine,
        codes: ['RBK', 'KGW', 'PDA', 'GMP', 'NWP', 'HTN', 'TWK', 'NOY', 'ABW', 'PPL', 'OHY', 'HPT', 'DTL', 'BDW', 'ELL', 'DMD', 'BDL'],
      },
      // Kandy / Matale branch (Nawalapitiya Region)
      {
        id: 'kandy-branch',
        region: 'Nawalapitiya' as OperatingRegion,
        line: 'Main Line' as RailwayLine,
        codes: ['PDA', 'KND', 'MTL'],
      },
      // Coastal Line: Colombo Fort -> Beliatta (Colombo Region)
      {
        id: 'coastal',
        region: 'Colombo' as OperatingRegion,
        line: 'Coastal Line' as RailwayLine,
        codes: ['FOT', 'MLV', 'PAN', 'KLT', 'ALT', 'AMB', 'HKD', 'GLE', 'WLG', 'MTR', 'BLT'],
      },
      // Northern Line lower: Polgahawela -> Maho Junction (Colombo Region)
      {
        id: 'northern-colombo',
        region: 'Colombo' as OperatingRegion,
        line: 'Northern Line' as RailwayLine,
        codes: ['PLG', 'KRN', 'MHO'],
      },
      // Northern Line upper: Maho -> Kankesanthurai (Anuradhapura Region)
      {
        id: 'northern-anuradhapura',
        region: 'Anuradhapura' as OperatingRegion,
        line: 'Northern Line' as RailwayLine,
        codes: ['MHO', 'GLG', 'TBT', 'ANP', 'MDW', 'VAV', 'MNK', 'KLN', 'PAL', 'JAF', 'KKS'],
      },
      // Mannar branch: Medawachchiya -> Talaimannar Pier (Anuradhapura Region)
      {
        id: 'mannar-branch',
        region: 'Anuradhapura' as OperatingRegion,
        line: 'Northern Line' as RailwayLine,
        codes: ['MDW', 'MNR', 'TLM'],
      },
      // Eastern Line: Maho -> Gal Oya -> Batticaloa (Anuradhapura Region)
      {
        id: 'eastern-batticaloa',
        region: 'Anuradhapura' as OperatingRegion,
        line: 'Eastern Line' as RailwayLine,
        codes: ['MHO', 'KKW', 'HBN', 'GOY', 'MNY', 'PLN', 'WLK', 'VLC', 'BTC'],
      },
      // Eastern Line: Gal Oya -> Trincomalee (Anuradhapura Region)
      {
        id: 'eastern-trinco',
        region: 'Anuradhapura' as OperatingRegion,
        line: 'Eastern Line' as RailwayLine,
        codes: ['GOY', 'KNT', 'CHB', 'TCO'],
      },
      // Kelani Valley Line: Colombo Fort -> Avissawella (Colombo Region)
      {
        id: 'kv-line',
        region: 'Colombo' as OperatingRegion,
        line: 'Kelani Valley Line' as RailwayLine,
        codes: ['FOT', 'MDA', 'AVS'],
      },
      // Puttalam Line: Ragama -> Puttalam (Colombo Region)
      {
        id: 'puttalam-line',
        region: 'Colombo' as OperatingRegion,
        line: 'Puttalam Line' as RailwayLine,
        codes: ['RGM', 'NGB', 'CHL', 'PUT'],
      },
    ];

    return branches.map((branch) => {
      const stationObjects = branch.codes
        .map((code) => STATIONS.find((s) => s.code === code))
        .filter(Boolean) as Station[];

      if (stationObjects.length < 2) return null;

      const points = stationObjects.map((s) => {
        const { x, y } = latLonToSvg(s.latitude, s.longitude);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });

      return {
        id: branch.id,
        region: branch.region,
        line: branch.line,
        pathData: `M ${points.join(' L ')}`,
      };
    }).filter(Boolean);
  }, []);

  // Station departures for selected station
  const stationDepartures = useMemo(() => {
    if (!selectedStation) return [];
    return TRAIN_SCHEDULES.filter((tr) => {
      return (
        tr.origin === selectedStation.name_en ||
        tr.destination === selectedStation.name_en ||
        tr.stops.some((st) => st.station_code === selectedStation.code)
      );
    }).slice(0, 4);
  }, [selectedStation]);

  // Distance between station A and B
  const calculatedDistance = useMemo(() => {
    if (!stationA || !stationB) return null;
    const distA = stationA.distance_from_fort_km ?? 0;
    const distB = stationB.distance_from_fort_km ?? 0;

    // Direct difference if on same continuous line or from Fort
    const diff = Math.abs(distB - distA);
    const elevDiff = Math.abs((stationB.elevation_m || 5) - (stationA.elevation_m || 5));

    return {
      distance_km: diff.toFixed(1),
      elevation_diff_m: elevDiff,
      climbing: (stationB.elevation_m || 0) > (stationA.elevation_m || 0),
    };
  }, [stationA, stationB]);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Official SLR Network Header */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#DFD5C2] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C88A35]" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#173024]">
                Sri Lanka Railway Network Map
              </h2>
            </div>
            <p className="text-xs text-[#6B655B] mt-0.5">
              Official operating regions, mainline junctions & live station elevations
            </p>
          </div>

          {/* Mode & Zoom Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#EFE9DC] p-1 rounded-xl border border-[#D5CCB8] text-xs font-semibold">
              <button
                onClick={() => setColorMode('region')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  colorMode === 'region'
                    ? 'bg-[#173024] text-white shadow-xs'
                    : 'text-[#4A463E] hover:text-black'
                }`}
              >
                3 Regions
              </button>
              <button
                onClick={() => setColorMode('line')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  colorMode === 'line'
                    ? 'bg-[#173024] text-white shadow-xs'
                    : 'text-[#4A463E] hover:text-black'
                }`}
              >
                Lines
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#EFE9DC] p-1 rounded-xl border border-[#D5CCB8]">
              <button
                onClick={() => setZoom((z) => Math.min(1.7, z + 0.15))}
                className="p-1 rounded-lg hover:bg-[#DDD5C3] text-[#4A463E]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.85, z - 0.15))}
                className="p-1 rounded-lg hover:bg-[#DDD5C3] text-[#4A463E]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 rounded-lg hover:bg-[#DDD5C3] text-[#4A463E]"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Distance Calculator Button */}
            <button
              onClick={() => setMeasureMode(!measureMode)}
              className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                measureMode
                  ? 'bg-[#D4A359] text-[#173024] border-[#B8873B] font-bold shadow-xs'
                  : 'bg-[#EFE9DC] text-[#4A463E] border-[#D5CCB8] hover:bg-[#DDD5C3]'
              }`}
              title="Measure Railway Distance"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Measure</span>
            </button>

            {/* Live Trains Toggle */}
            <button
              onClick={() => setShowLiveTrains(!showLiveTrains)}
              className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                showLiveTrains
                  ? 'bg-[#173024] text-[#D4A359] border-[#173024] font-bold shadow-xs'
                  : 'bg-[#EFE9DC] text-[#4A463E] border-[#D5CCB8] hover:bg-[#DDD5C3]'
              }`}
              title="Toggle Live Simulated Trains"
            >
              <Train className="w-3.5 h-3.5 text-[#D4A359]" />
              <span className="hidden sm:inline">Live Trains</span>
            </button>

            {/* Landmarks Toggle */}
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                showLandmarks
                  ? 'bg-[#758A80] text-white border-[#758A80] font-bold shadow-xs'
                  : 'bg-[#EFE9DC] text-[#4A463E] border-[#D5CCB8] hover:bg-[#DDD5C3]'
              }`}
              title="Toggle Scenic Landmarks"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landmarks</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 bg-[#F2ECE0] px-3 py-1.5 border border-[#D5CAA4]/80 rounded-xl focus-within:border-[#758A80] transition-colors">
            <PredictiveStationInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSelectStation={(station) => {
                setSearchQuery(station.name_en);
                setSelectedStation(station);
                if (colorMode === 'region' && selectedRegion !== 'All' && station.operating_region !== selectedRegion) {
                  setSelectedRegion('All');
                }
                if (colorMode === 'line' && selectedLine !== 'All' && station.line !== selectedLine) {
                  setSelectedLine('All');
                }
              }}
              placeholder="Search station (e.g. Ella, Kandy, Galle)..."
              language={language}
            />
          </div>

          {colorMode === 'region' ? (
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="bg-[#EAE3D5] text-[#24211C] border border-[#D6CDBC] rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer font-medium"
            >
              <option value="All">All 3 Operating Regions</option>
              <option value="Colombo">Colombo Region (Red)</option>
              <option value="Nawalapitiya">Nawalapitiya Region (Green)</option>
              <option value="Anuradhapura">Anuradhapura Region (Blue)</option>
            </select>
          ) : (
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value as any)}
              className="bg-[#EAE3D5] text-[#24211C] border border-[#D6CDBC] rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer font-medium"
            >
              <option value="All">{t.allLines}</option>
              <option value="Main Line">Main Line (Highlands)</option>
              <option value="Coastal Line">Coastal Line (South)</option>
              <option value="Northern Line">Northern Line (Jaffna/Mannar)</option>
              <option value="Eastern Line">Eastern Line (Trinco/Batti)</option>
              <option value="Kelani Valley Line">Kelani Valley Line</option>
              <option value="Puttalam Line">Puttalam Line</option>
            </select>
          )}
        </div>

        {/* Offline Cache Status Confirmation Banner */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#E8EFE9] border border-[#BCD4C1] rounded-xl text-[11px] text-[#1E5434]">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Interactive Route Map & Coordinates Cached via Service Worker (Offline Ready)</span>
          </span>
          <span className="text-[10px] text-[#4F735D] hidden sm:inline">50+ Stations • 6 Railway Lines</span>
        </div>

        {/* Distance Calculator Banner */}
        {measureMode && (
          <div className="bg-[#EFE7D8] p-3 rounded-xl border border-[#D8CEBA] text-xs animate-fadeIn space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173024] flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C88A35]" />
                Railway Track Distance & Incline Calculator
              </span>
              <span className="text-[10px] text-[#6B655B]">Click any station on map to assign</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD4C2]">
                <span className="w-5 h-5 rounded-full bg-[#173024] text-white flex items-center justify-center text-[10px] font-bold">
                  A
                </span>
                <select
                  value={stationA?.code || ''}
                  onChange={(e) => setStationA(STATIONS.find((s) => s.code === e.target.value) || null)}
                  className="bg-transparent font-semibold text-[#173024] outline-none text-xs flex-1 cursor-pointer"
                >
                  {STATIONS.map((s) => (
                    <option key={`a-${s.code}`} value={s.code}>
                      {s.name_en} ({s.distance_from_fort_km} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD4C2]">
                <span className="w-5 h-5 rounded-full bg-[#C88A35] text-white flex items-center justify-center text-[10px] font-bold">
                  B
                </span>
                <select
                  value={stationB?.code || ''}
                  onChange={(e) => setStationB(STATIONS.find((s) => s.code === e.target.value) || null)}
                  className="bg-transparent font-semibold text-[#173024] outline-none text-xs flex-1 cursor-pointer"
                >
                  {STATIONS.map((s) => (
                    <option key={`b-${s.code}`} value={s.code}>
                      {s.name_en} ({s.distance_from_fort_km} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {calculatedDistance && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D5CAA4]/60">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-[#7A7367] block">Track Distance</span>
                    <span className="font-bold text-sm text-[#173024] font-mono">
                      {calculatedDistance.distance_km} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A7367] block">Altitude Delta</span>
                    <span className="font-bold text-sm text-[#173024] font-mono">
                      {calculatedDistance.climbing ? '▲ +' : '▼ -'}
                      {calculatedDistance.elevation_diff_m} m
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (stationA && stationB) {
                      onSelectStation(stationA);
                    }
                  }}
                  className="bg-[#173024] hover:bg-[#254A36] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <span>Search Trains on Route</span>
                  <ArrowRight className="w-3 h-3 text-[#D4A359]" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SVG Canvas Container */}
      <div className="relative w-full bg-[#EAE4D7] rounded-2xl border border-[#D8CEBA] overflow-hidden shadow-inner flex items-center justify-center p-2 min-h-[500px] sm:min-h-[620px]">
        {/* SVG Graphic */}
        <div
          className="transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full max-w-[540px] h-auto drop-shadow-md select-none"
          >
            <defs>
              <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Sri Lanka Realistic Coastline Vector Path */}
            <path
              d="M 175,38 
                 C 185,32 205,32 215,42
                 C 225,52 225,70 215,85
                 C 205,100 215,115 240,140
                 C 265,165 295,190 320,210
                 C 345,230 380,265 390,300
                 C 398,335 410,380 415,430
                 C 420,480 395,530 365,575
                 C 335,620 290,650 250,655
                 C 210,660 170,640 145,615
                 C 120,590 100,550 90,490
                 C 80,430 85,380 95,330
                 C 100,290 85,260 85,220
                 C 85,180 110,140 135,100
                 C 155,70 165,45 175,38 Z"
              fill="#F7F3E9"
              stroke="#D3C7B0"
              strokeWidth="2.5"
              filter="url(#shadow)"
            />

            {/* Mannar Peninsula Spit */}
            <path
              d="M 135,170 C 110,175 80,185 60,195 C 75,198 105,190 130,185 Z"
              fill="#F7F3E9"
              stroke="#D3C7B0"
              strokeWidth="1.5"
            />

            {/* Kalpitiya Lagoon Spit */}
            <path
              d="M 95,290 C 85,265 80,240 85,220 C 90,240 95,265 100,290 Z"
              fill="#F7F3E9"
              stroke="#D3C7B0"
              strokeWidth="1.2"
            />

            {/* Central Highlands Elevation Ring (contour tint) */}
            <path
              d="M 180,420 
                 C 195,380 230,370 260,390
                 C 290,410 300,450 285,490
                 C 270,530 230,540 200,520
                 C 170,500 165,460 180,420 Z"
              fill="#EFE8D6"
              stroke="#DCCEB5"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.8"
            />
            <text x="220" y="455" fontSize="8" fill="#A89E8D" fontWeight="bold" letterSpacing="1">
              CENTRAL HIGHLANDS
            </text>

            {/* Proposed / Under Construction Line: Beliatta to Hambantota & Kataragama (Dashed Blue) */}
            <g opacity="0.6">
              <path
                d="M 235,640 C 270,645 310,635 345,610"
                fill="none"
                stroke="#1565C0"
                strokeWidth="2.5"
                strokeDasharray="5,4"
              />
              <text x="270" y="650" fontSize="7" fill="#1565C0" fontWeight="bold">
                Beliatta - Kataragama (Under Construction)
              </text>
            </g>

            {/* Railway Track Lines */}
            {trackSegments.map((segment) => {
              if (!segment) return null;

              // Determine styling based on colorMode
              let strokeColor = '#333';
              let isDimmed = false;

              if (colorMode === 'region') {
                strokeColor = REGION_COLORS[segment.region].primary;
                if (selectedRegion !== 'All' && segment.region !== selectedRegion) {
                  isDimmed = true;
                }
              } else {
                strokeColor = LINE_COLORS[segment.line] || '#333';
                if (selectedLine !== 'All' && segment.line !== selectedLine) {
                  isDimmed = true;
                }
              }

              return (
                <g key={segment.id} opacity={isDimmed ? 0.2 : 1}>
                  {/* Track Outer Glow/Ballast */}
                  <path
                    d={segment.pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Railway Sleeper Ties */}
                  <path
                    d={segment.pathData}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="2.5,4"
                  />
                </g>
              );
            })}

            {/* Key Junction Label Highlights */}
            {/* Polgahawela Junction */}
            <circle cx={latLonToSvg(7.3328, 80.2975).x} cy={latLonToSvg(7.3328, 80.2975).y} r="8" fill="none" stroke="#D4A359" strokeWidth="1.5" strokeDasharray="2,2" />
            {/* Maho Junction */}
            <circle cx={latLonToSvg(7.8247, 80.3014).x} cy={latLonToSvg(7.8247, 80.3014).y} r="8" fill="none" stroke="#D4A359" strokeWidth="1.5" strokeDasharray="2,2" />
            {/* Gal Oya Junction */}
            <circle cx={latLonToSvg(8.1186, 80.8925).x} cy={latLonToSvg(8.1186, 80.8925).y} r="8" fill="none" stroke="#D4A359" strokeWidth="1.5" strokeDasharray="2,2" />

            {/* Station Pins */}
            {filteredStations.map((station) => {
              const { x, y } = latLonToSvg(station.latitude, station.longitude);
              const isSelected = selectedStation?.id === station.id;
              const isA = stationA?.id === station.id;
              const isB = stationB?.id === station.id;

              const pinColor =
                colorMode === 'region' && station.operating_region
                  ? REGION_COLORS[station.operating_region].primary
                  : LINE_COLORS[station.line] || '#173024';

              return (
                <g
                  key={station.id}
                  transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})`}
                  onClick={() => {
                    setSelectedStation(station);
                    if (measureMode) {
                      if (!stationA) setStationA(station);
                      else setStationB(station);
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {/* Ripple pulse on major junction hubs */}
                  {station.majorHub && (
                    <circle
                      r="10"
                      fill={pinColor}
                      opacity="0.2"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    r={station.majorHub ? 6.5 : 4.5}
                    fill={isSelected ? '#D4A359' : isA ? '#173024' : isB ? '#C88A35' : '#FFFFFF'}
                    stroke={pinColor}
                    strokeWidth={isSelected || isA || isB ? 3 : 2}
                    className="transition-transform group-hover:scale-150"
                  />

                  {/* Inner dot */}
                  <circle
                    r={station.majorHub ? 2.5 : 1.5}
                    fill={isSelected ? '#FFFFFF' : pinColor}
                  />

                  {/* Station Label on hover, major hubs, or zoomed in */}
                  {(station.majorHub || isSelected || isA || isB || zoom >= 1.25) && (
                    <g className="pointer-events-none select-none">
                      <rect
                        x={9}
                        y={-9}
                        width={station.name_en.length * 6 + 10}
                        height="15"
                        rx="4"
                        fill="#FAF7F2"
                        stroke="#DFD5C2"
                        strokeWidth="0.8"
                        opacity="0.92"
                      />
                      <text
                        x={14}
                        y={2}
                        fontSize="8.5"
                        fontWeight="bold"
                        fill="#173024"
                      >
                        {station.name_en}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Scenic Heritage & Engineering Landmarks */}
            {showLandmarks && (
              <g className="landmarks-layer select-none">
                {/* Demodara Nine Arch Bridge */}
                <g transform="translate(346, 508)">
                  <rect x="-4" y="-4" width="8" height="8" fill="#C88A35" stroke="#FFFFFF" strokeWidth="1" transform="rotate(45)" />
                  <text x="8" y="3" fontSize="7.5" fontWeight="bold" fill="#8C5819">
                    ★ Nine Arch Bridge
                  </text>
                </g>

                {/* Pattipola Summit */}
                <g transform="translate(322, 490)">
                  <polygon points="0,-6 5,4 -5,4" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="1" />
                  <text x="8" y="2" fontSize="7.5" fontWeight="bold" fill="#1E5422">
                    ▲ Pattipola Summit (1,898 m)
                  </text>
                </g>

                {/* Galle Dutch Fort */}
                <g transform="translate(182, 608)">
                  <rect x="-3" y="-3" width="6" height="6" fill="#00838F" stroke="#FFFFFF" strokeWidth="1" />
                  <text x="7" y="3" fontSize="7" fontWeight="bold" fill="#005B64">
                    🏰 Galle Fort
                  </text>
                </g>
              </g>
            )}

            {/* Simulated Live Train Telemetry Positions */}
            {showLiveTrains && (
              <g className="live-trains-layer select-none">
                {/* Train 1: Podi Menike near Nanu Oya */}
                <g
                  transform="translate(305, 480)"
                  className="cursor-pointer"
                  onClick={() => {
                    const tr = TRAIN_SCHEDULES.find((s) => s.train_id === '1005');
                    if (tr && onSelectTrain) onSelectTrain(tr);
                  }}
                >
                  <circle r="12" fill="#D4A359" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#173024" stroke="#D4A359" strokeWidth="2" />
                  <circle r="2" fill="#D4A359" />
                  <rect x={9} y={-9} width="95" height="16" rx="4" fill="#173024" stroke="#D4A359" strokeWidth="1" opacity="0.95" />
                  <text x={14} y={2.5} fontSize="7.5" fontWeight="bold" fill="#D4A359">
                    🚆 #1005 Podi Menike
                  </text>
                </g>

                {/* Train 2: Ruhunu Kumari near Galle */}
                <g
                  transform="translate(180, 595)"
                  className="cursor-pointer"
                  onClick={() => {
                    const tr = TRAIN_SCHEDULES.find((s) => s.train_id === '8058');
                    if (tr && onSelectTrain) onSelectTrain(tr);
                  }}
                >
                  <circle r="12" fill="#00838F" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#00838F" stroke="#FFFFFF" strokeWidth="2" />
                  <circle r="2" fill="#FFFFFF" />
                  <rect x={9} y={-9} width="105" height="16" rx="4" fill="#00838F" stroke="#FFFFFF" strokeWidth="1" opacity="0.95" />
                  <text x={14} y={2.5} fontSize="7.5" fontWeight="bold" fill="#FFFFFF">
                    🌊 #8058 Ruhunu Kumari
                  </text>
                </g>

                {/* Train 3: Yal Devi near Anuradhapura */}
                <g
                  transform="translate(230, 230)"
                  className="cursor-pointer"
                  onClick={() => {
                    const tr = TRAIN_SCHEDULES.find((s) => s.train_id === '4077');
                    if (tr && onSelectTrain) onSelectTrain(tr);
                  }}
                >
                  <circle r="12" fill="#1565C0" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#1565C0" stroke="#FFFFFF" strokeWidth="2" />
                  <circle r="2" fill="#FFFFFF" />
                  <rect x={9} y={-9} width="90" height="16" rx="4" fill="#1565C0" stroke="#FFFFFF" strokeWidth="1" opacity="0.95" />
                  <text x={14} y={2.5} fontSize="7.5" fontWeight="bold" fill="#FFFFFF">
                    🏛️ #4077 Yal Devi
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Selected Station Inspection Card */}
        {selectedStation && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-[#FAF7F2]/95 backdrop-blur-md p-4 rounded-2xl border-2 border-[#173024] shadow-2xl text-xs space-y-2.5 animate-fadeIn z-20">
            {/* Header badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#173024] text-[#D4A359]">
                  {selectedStation.code}
                </span>
                {selectedStation.distance_from_fort_km !== undefined && (
                  <span className="text-[10px] font-mono font-semibold bg-[#EFE9DC] px-2 py-0.5 rounded border border-[#DDD4C2] text-[#4A463E]">
                    {selectedStation.distance_from_fort_km.toFixed(1)} km from Fort
                  </span>
                )}
              </div>

              {selectedStation.operating_region && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: REGION_COLORS[selectedStation.operating_region].bg,
                    color: REGION_COLORS[selectedStation.operating_region].primary,
                  }}
                >
                  {selectedStation.operating_region} Region
                </span>
              )}
            </div>

            {/* Name */}
            <div>
              <h3 className="font-serif font-bold text-base text-[#173024]">
                {selectedStation.name_en}
              </h3>
              <p className="text-[11px] text-[#69655E]">
                {selectedStation.name_si} • {selectedStation.name_ta}
              </p>
            </div>

            {/* Stats: Elevation & Platforms */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E8E1D3] text-[11px]">
              <div>
                <span className="text-[#7A7468] block flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-[#5B7B6E]" />
                  Elevation
                </span>
                <span className="font-bold text-[#173024] font-mono">
                  {selectedStation.elevation_m || 5} m ({Math.round((selectedStation.elevation_m || 5) * 3.28)} ft)
                </span>
              </div>
              <div>
                <span className="text-[#7A7468] block flex items-center gap-1">
                  <Train className="w-3 h-3 text-[#C88A35]" />
                  Line & Platforms
                </span>
                <span className="font-bold text-[#173024]">
                  {selectedStation.platforms || 2} Pl. • {selectedStation.line}
                </span>
              </div>
            </div>

            {/* Serving Trains Preview */}
            {stationDepartures.length > 0 && (
              <div className="pt-1 border-t border-[#E8E1D3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">
                  Departures via {selectedStation.name_en}
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {stationDepartures.map((tr) => (
                    <div
                      key={tr.train_id}
                      onClick={() => onSelectTrain && onSelectTrain(tr)}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-[#F2ECE0] hover:bg-[#EBE2D3] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[9px] font-bold px-1 rounded bg-[#173024] text-white">
                          #{tr.train_id}
                        </span>
                        <span className="font-semibold text-[#173024] truncate">
                          {tr.train_name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#5B7B6E] shrink-0 ml-1">
                        {tr.departure_time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={() => onSelectStation(selectedStation)}
              className="w-full mt-1 flex items-center justify-center gap-1.5 bg-[#173024] hover:bg-[#254A36] text-white py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Explore All Trains for this Station</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4A359]" />
            </button>
          </div>
        )}
      </div>

      {/* Official Map Legend */}
      <section className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DFD5C2] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif font-bold text-[#173024] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C88A35]" />
            Official Sri Lanka Railways Legend
          </span>
          <span className="text-[10px] text-[#7A7367]">
            Click any legend item to isolate tracks
          </span>
        </div>

        {colorMode === 'region' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {Object.entries(REGION_COLORS).map(([regionKey, data]) => {
              const isActive = selectedRegion === regionKey;
              return (
                <button
                  key={regionKey}
                  onClick={() => setSelectedRegion(isActive ? 'All' : (regionKey as OperatingRegion))}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    isActive ? 'bg-[#FAF0E6] border-[#D4A359]' : 'bg-[#F2ECE0] border-[#E0D7C4] hover:bg-[#EBE2D3]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: data.primary }}
                  />
                  <div>
                    <span className="font-bold text-[#173024] block text-xs">
                      {regionKey} Region
                    </span>
                    <span className="text-[10px] text-[#6E685D] block leading-tight">
                      {regionKey === 'Colombo' && 'Coastal, Kelani Valley & Puttalam'}
                      {regionKey === 'Nawalapitiya' && 'Kandy, Nuwara Eliya & Badulla'}
                      {regionKey === 'Anuradhapura' && 'Jaffna, Mannar, Trinco & Batti'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-around gap-2 text-xs">
            {Object.entries(LINE_COLORS).map(([line, color]) => (
              <button
                key={line}
                onClick={() => setSelectedLine(selectedLine === line ? 'All' : (line as RailwayLine))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#EFE9DD] transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-[11px] ${selectedLine === line ? 'font-bold text-[#173024]' : 'text-[#4A463F]'}`}>
                  {line}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
