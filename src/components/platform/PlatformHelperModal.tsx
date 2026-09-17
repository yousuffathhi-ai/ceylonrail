import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Compass,
  Footprints,
  Train,
  CheckCircle2,
  Clock,
  Info,
  Layers,
  ArrowRight,
  LocateFixed,
  AlertTriangle,
  Coffee,
  Accessibility,
} from 'lucide-react';
import { Language } from '../../types';
import { STATIONS } from '../../data/timetableData';

interface PlatformHelperModalProps {
  onClose: () => void;
  language: Language;
  initialStationCode?: string;
}

interface PlatformGuide {
  number: number;
  lines: string;
  popularTrains: string;
  description: string;
  amenities: string[];
  stepsFromMainEntrance: string[];
  color: string;
}

const STATION_PLATFORM_DATA: Record<string, {
  name: string;
  code: string;
  lat: number;
  lon: number;
  platforms: PlatformGuide[];
  entrances: string[];
}> = {
  FOT: {
    name: 'Colombo Fort',
    code: 'FOT',
    lat: 6.9344,
    lon: 79.8501,
    entrances: [
      'Main Porch (Olcott Mawatha / Clock Tower)',
      'Ticket Hall Concourse A',
      'Overhead Footbridge North Stairs',
      'Bastian Mawatha Pedestrian Walkway (Bus Terminal Link)',
    ],
    platforms: [
      {
        number: 1,
        lines: 'Kelani Valley Line',
        popularTrains: 'KV Commuters to Avissawella & Homagama',
        description: 'Single bay platform on the western side of the station.',
        amenities: ['Ticket Validator', 'Shaded Benches', 'Drinking Fountain'],
        stepsFromMainEntrance: [
          'Enter through Main Porch turnstiles.',
          'Turn sharp right before reaching the main train sheds.',
          'Follow the covered canopy 40 meters to Platform 1.',
        ],
        color: '#758A80',
      },
      {
        number: 2,
        lines: 'Kelani Valley & Suburban',
        popularTrains: 'Maharawa & Padukka peak hour shuttles',
        description: 'Suburban commuter platform adjacent to Platform 1.',
        amenities: ['Digital Departures TV', 'Snack Kiosk'],
        stepsFromMainEntrance: [
          'Pass through the ticket barriers.',
          'Walk 35 meters down the western concourse.',
          'Platform 2 is situated to the right of Platform 3 track bed.',
        ],
        color: '#758A80',
      },
      {
        number: 3,
        lines: 'Main Line Up Country Express',
        popularTrains: 'Podi Menike (#1005), Ella Odyssey (#1041), Udarata Menike (#1015)',
        description: 'Main long-distance departure platform for Kandy, Nanu Oya, Ella & Badulla.',
        amenities: ['Observation Car Boarding Zone', 'Tea Stall', 'Wheelchair Ramp', 'Waiting Room'],
        stepsFromMainEntrance: [
          'Pass through Ticket Concourse A.',
          'Walk straight 20 meters; you will see the historic brass bell.',
          'Platform 3 is on your left directly under the British-era iron canopy.',
          'Coaches 1-4 stop on the city end; Observation Saloon stops at the far ocean end.',
        ],
        color: '#173024',
      },
      {
        number: 4,
        lines: 'Main Line Intercity & Express',
        popularTrains: 'Kandy Intercity (#1001), Rambukkana & Polgahawela Fast Commuters',
        description: 'Island platform shared with Platform 5 via overhead footbridge.',
        amenities: ['Digital Announcement Display', 'Drinking Water', 'Restrooms'],
        stepsFromMainEntrance: [
          'Walk past the Station Master office to the Central Overhead Footbridge.',
          'Take the footbridge stairs up 1 flight.',
          'Descend at the first flight of stairs marked "Platform 4 & 5".',
          'Platform 4 is on the northern track side.',
        ],
        color: '#2A523E',
      },
      {
        number: 5,
        lines: 'Coastal Line Southbound Express',
        popularTrains: 'Ruhunu Kumari (#8058), Galu Kumari (#8050), Samudra Devi (#8056)',
        description: 'Flagship departure platform for Galle, Matara & Beliatta coastal trains.',
        amenities: ['Ocean Breeze Seating', 'SLR Cafeteria', 'Newspaper Stand'],
        stepsFromMainEntrance: [
          'Walk onto the Central Overhead Footbridge from Concourse A.',
          'Cross track 3 and 4, then descend to Island Platform 5.',
          'Board South-bound trains facing the harbor mouth.',
        ],
        color: '#1F6B75',
      },
      {
        number: 6,
        lines: 'Coastal Line Commuter & Slow',
        popularTrains: 'Aluthgama, Kalutara South & Panadura stopping trains',
        description: 'High frequency commuter track for southern suburbs.',
        amenities: ['Commuter Benches', 'Ticket Validation QR Scanner'],
        stepsFromMainEntrance: [
          'Use either the Central or Eastern Footbridge.',
          'Descend at Platform 6 & 7.',
          'Platform 6 serves stopping trains towards Moratuwa/Panadura.',
        ],
        color: '#1F6B75',
      },
      {
        number: 7,
        lines: 'Northern Line Express',
        popularTrains: 'Yal Devi (#4077), Uttara Devi (#4021), Night Mail (#4040)',
        description: 'Direct express service to Anuradhapura, Vavuniya, Kilinochchi & Jaffna.',
        amenities: ['Air-Conditioned Waiting Lounge', 'Long Distance Luggage Trolleys'],
        stepsFromMainEntrance: [
          'Ascend Central Footbridge and cross to the second island.',
          'Descend on Platform 7.',
          'AC First Class coaches stop near the footbridge staircase.',
        ],
        color: '#8C3A27',
      },
      {
        number: 8,
        lines: 'Eastern Line Express',
        popularTrains: 'Udaya Devi (#6011) to Batticaloa, Trincomalee Night Mail',
        description: 'Platform dedicated to eastern agricultural and coast trains.',
        amenities: ['Restrooms', 'Water Refill', 'Porter Call Bell'],
        stepsFromMainEntrance: [
          'Cross via the North Walkway Footbridge directly to Platform 8.',
          'Follow signs for Eastern corridor trains.',
        ],
        color: '#C88A35',
      },
      {
        number: 9,
        lines: 'Puttalam & Chilaw Line',
        popularTrains: 'Muthu Kumari (#4445), Negombo & Katunayake Airport commuters',
        description: 'Outer platform serving north-western coastal services.',
        amenities: ['Ticket Booth', 'Covered Shed'],
        stepsFromMainEntrance: [
          'Use the easternmost footbridge crossing.',
          'Descend onto Platform 9.',
        ],
        color: '#607274',
      },
      {
        number: 10,
        lines: 'Puttalam Line & Special Charters',
        popularTrains: 'Noor Nagar & Bangadeniya stopping trains',
        description: 'Outer bay track with dedicated access to Bastian Mawatha gate.',
        amenities: ['Direct Bus Stand Exit', 'Bicycle Parking'],
        stepsFromMainEntrance: [
          'Walk along the outer eastern pedestrian gallery.',
          'Located near the Bastian Mawatha private bus terminal exit.',
        ],
        color: '#607274',
      },
    ],
  },
  KND: {
    name: 'Kandy Railway Station',
    code: 'KND',
    lat: 7.2906,
    lon: 80.6337,
    entrances: ['Main Heritage Concourse (William Gopallawa Mawatha)', 'Subway Platform Ramp'],
    platforms: [
      {
        number: 1,
        lines: 'Colombo Express & Intercity',
        popularTrains: 'Kandy - Colombo Intercity (#1002, #1026)',
        description: 'Main concourse-level platform. Zero stairs required.',
        amenities: ['VIP Lounge', 'Station Canteen', 'Left Luggage Counter'],
        stepsFromMainEntrance: [
          'Walk straight through the ticket gate.',
          'Platform 1 is immediately in front of you.',
        ],
        color: '#173024',
      },
      {
        number: 2,
        lines: 'Main Line Hill Country Up & Down',
        popularTrains: 'Udarata Menike, Podi Menike, Badulla connecting shuttles',
        description: 'Island platform accessed via the historical underpass subway.',
        amenities: ['Waiting Benches', 'Drinking Fountain'],
        stepsFromMainEntrance: [
          'Enter Platform 1 and turn left towards the pedestrian subway tunnel.',
          'Descend into the tiled tunnel and walk 25 meters.',
          'Ascend ramp marked "Platform 2".',
        ],
        color: '#2A523E',
      },
      {
        number: 3,
        lines: 'Matale Branch Line',
        popularTrains: 'Kandy - Matale Local Diesel Railcars',
        description: 'Outer track for scenic railbus and diesel trains to Matale.',
        amenities: ['Shaded Shed', 'Ticket Counter'],
        stepsFromMainEntrance: [
          'Use the subway tunnel to the far side of Platform 2.',
          'Platform 3 faces the Mahaweli hill slopes.',
        ],
        color: '#758A80',
      },
    ],
  },
  GLE: {
    name: 'Galle Railway Station',
    code: 'GLE',
    lat: 6.0367,
    lon: 80.2144,
    entrances: ['Galle Fort Facing Concourse', 'Station Road Entrance'],
    platforms: [
      {
        number: 1,
        lines: 'Colombo Fort Express & Coastal Commuters',
        popularTrains: 'Samudra Devi, Ruhunu Kumari, Galu Kumari to Colombo',
        description: 'Main platform connecting to the booking office and baggage hall.',
        amenities: ['Tourist Information Counter', 'Left Luggage', 'Cafe'],
        stepsFromMainEntrance: [
          'Walk through the main archway past the ticket windows.',
          'Platform 1 directly fronts the arrival/departure tracks.',
        ],
        color: '#1F6B75',
      },
      {
        number: 2,
        lines: 'Beliatta & Matara Southbound',
        popularTrains: 'Southbound extensions to Weligama, Matara, Beliatta',
        description: 'Opposite platform reached by level crossing or footbridge.',
        amenities: ['Benches', 'Water Fountain'],
        stepsFromMainEntrance: [
          'Cross via the footbridge at the southern end of Platform 1.',
          'Descend onto Platform 2.',
        ],
        color: '#2A523E',
      },
    ],
  },
  ELL: {
    name: 'Ella Railway Station',
    code: 'ELL',
    lat: 6.8744,
    lon: 81.0464,
    entrances: ['Ella Station Road Main Flower Garden Entrance'],
    platforms: [
      {
        number: 1,
        lines: 'Main Line Up & Down Express',
        popularTrains: 'Podi Menike, Ella Odyssey (#1041), Badulla Shuttles',
        description: 'Charming stone-built colonial platform with lush flower gardens.',
        amenities: ['Tea Kiosk', 'Luggage Cloakroom', 'Photo Spot'],
        stepsFromMainEntrance: [
          'Walk through the manicured rose garden entrance.',
          'Step directly onto Platform 1.',
        ],
        color: '#173024',
      },
      {
        number: 2,
        lines: 'Loop & Passing Track',
        popularTrains: 'Freight & passing train crossing maneuvers',
        description: 'Secondary track across the ballast bed.',
        amenities: ['Scenic Mountain View'],
        stepsFromMainEntrance: [
          'Cross via the timber level footway across Track 1.',
        ],
        color: '#758A80',
      },
    ],
  },
};

// Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const PlatformHelperModal: React.FC<PlatformHelperModalProps> = ({
  onClose,
  language,
  initialStationCode = 'FOT',
}) => {
  const [selectedStationCode, setSelectedStationCode] = useState(
    STATION_PLATFORM_DATA[initialStationCode] ? initialStationCode : 'FOT'
  );
  const [selectedPlatformNumber, setSelectedPlatformNumber] = useState<number>(3);
  const [selectedEntranceIdx, setSelectedEntranceIdx] = useState<number>(0);

  // Geolocation state
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'prompt' | 'loading' | 'granted' | 'denied'>('prompt');
  const [distanceToStation, setDistanceToStation] = useState<number | null>(null);

  const activeStation = STATION_PLATFORM_DATA[selectedStationCode] || STATION_PLATFORM_DATA.FOT;
  const activePlatform =
    activeStation.platforms.find((p) => p.number === selectedPlatformNumber) ||
    activeStation.platforms[0];

  // Request user GPS
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserCoords(coords);
        setGeoStatus('granted');
        const dist = getDistanceMeters(coords.lat, coords.lon, activeStation.lat, activeStation.lon);
        setDistanceToStation(dist);
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (userCoords) {
      const dist = getDistanceMeters(userCoords.lat, userCoords.lon, activeStation.lat, activeStation.lon);
      setDistanceToStation(dist);
    }
  }, [selectedStationCode, userCoords]);

  // Update selected platform when station changes
  useEffect(() => {
    setSelectedPlatformNumber(activeStation.platforms[0]?.number || 1);
  }, [selectedStationCode]);

  // Proximity description
  const isInsideStation = distanceToStation !== null && distanceToStation < 250;
  const isNearby = distanceToStation !== null && distanceToStation >= 250 && distanceToStation < 2000;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E0D7C6] max-h-[92vh] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Modal Header */}
        <div className="bg-[#173024] text-[#F4F0EA] p-4 sm:p-5 relative border-b border-[#2B4E3C]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#A7BCB0] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-[#5CE2A0]/20 text-[#5CE2A0]">
              <Navigation className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4A359]">
              Station Navigation & Walking Directions
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Platform Helper & Station Map
          </h2>
          <p className="text-xs text-[#A7BCB0] mt-0.5">
            Step-by-step indoor walking directions from concourses to your departure platform
          </p>

          {/* Station Selection Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
            {Object.entries(STATION_PLATFORM_DATA).map(([code, data]) => (
              <button
                key={code}
                onClick={() => setSelectedStationCode(code)}
                className={`px-3 py-1 rounded-full font-medium transition-all shrink-0 ${
                  selectedStationCode === code
                    ? 'bg-[#D4A359] text-[#173024] font-bold shadow-xs'
                    : 'bg-[#244233] text-[#D0DFD7] hover:bg-[#2F5542]'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Geolocation Status Card */}
          <div className="bg-[#FAF7F2] rounded-xl p-3.5 border border-[#DFD5C2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8E2D3] flex items-center justify-center text-[#173024] shrink-0">
                <LocateFixed className="w-4 h-4 text-[#173024]" />
              </div>
              <div>
                <div className="font-semibold text-[#1F2923]">
                  {geoStatus === 'granted' && distanceToStation !== null ? (
                    isInsideStation ? (
                      <span className="text-[#2F7E4E] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Inside Station Concourse (~{distanceToStation}m)
                      </span>
                    ) : isNearby ? (
                      <span>Nearby: ~{(distanceToStation / 1000).toFixed(1)} km away (~{Math.round(distanceToStation / 80)} min walk)</span>
                    ) : (
                      <span>GPS Active: ~{(distanceToStation / 1000).toFixed(1)} km from {activeStation.name}</span>
                    )
                  ) : (
                    <span>Find My Walking Distance</span>
                  )}
                </div>
                <p className="text-[11px] text-[#6E685D]">
                  {geoStatus === 'granted'
                    ? 'Directions tailored to your proximity from the platform.'
                    : 'Enable location for live distance and arrival estimates.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestLocation}
              disabled={geoStatus === 'loading'}
              className="bg-[#173024] hover:bg-[#204031] text-[#F4F0EA] text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors self-end sm:self-center shrink-0 disabled:opacity-50"
            >
              <Compass className={`w-3.5 h-3.5 ${geoStatus === 'loading' ? 'animate-spin' : ''}`} />
              <span>{geoStatus === 'loading' ? 'Locating...' : geoStatus === 'granted' ? 'Update GPS' : 'Use My GPS'}</span>
            </button>
          </div>

          {/* Platform Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E685D] flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-[#D4A359]" />
                Select Platform ({activeStation.name})
              </label>
              <span className="text-[11px] text-[#758A80] font-medium">
                {activeStation.platforms.length} Platforms Available
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {activeStation.platforms.map((p) => {
                const isSelected = selectedPlatformNumber === p.number;
                return (
                  <button
                    key={p.number}
                    onClick={() => setSelectedPlatformNumber(p.number)}
                    className={`p-2 rounded-xl text-center border font-semibold text-xs transition-all ${
                      isSelected
                        ? 'bg-[#173024] text-[#F4F0EA] border-[#173024] shadow-xs scale-105'
                        : 'bg-[#F2ECE0] text-[#1F2923] border-[#DFD5C2] hover:bg-[#EAE2D2]'
                    }`}
                  >
                    <div className="text-[10px] text-[#A7BCB0] font-normal uppercase">Plat</div>
                    <div className="text-sm font-bold">{p.number}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Schematic Station Layout Blueprint */}
          <div className="bg-[#122119] text-[#E0EBE4] rounded-2xl p-4 border border-[#244233] shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-[#203D2F] pb-2">
              <span className="font-mono text-[#D4A359] font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                CONCOURSE & TRACK SCHEMATIC - {activeStation.name.toUpperCase()}
              </span>
              <span className="text-[11px] bg-[#2A4B3A] text-[#86EFAC] px-2 py-0.5 rounded-full font-mono">
                Target: Platform {activePlatform.number}
              </span>
            </div>

            {/* SVG Station Blueprint */}
            <div className="relative w-full h-36 bg-[#0E1A14] rounded-xl border border-[#203D2F] overflow-hidden flex items-center justify-center p-2">
              <svg viewBox="0 0 600 160" className="w-full h-full">
                {/* Station Concourse Block */}
                <rect x="20" y="20" width="100" height="120" rx="8" fill="#1A3326" stroke="#2D543F" strokeWidth="1.5" />
                <text x="70" y="70" fill="#E5EDE8" fontSize="10" fontWeight="bold" textAnchor="middle">MAIN</text>
                <text x="70" y="84" fill="#8FA599" fontSize="8" textAnchor="middle">CONCOURSE</text>
                <text x="70" y="105" fill="#D4A359" fontSize="7" textAnchor="middle">TICKETS</text>

                {/* Overhead Footbridge */}
                <rect x="120" y="70" width="440" height="20" fill="#254737" stroke="#386B52" strokeWidth="1" strokeDasharray="3,3" />
                <text x="340" y="83" fill="#FFE2A4" fontSize="8" fontWeight="bold" textAnchor="middle">
                  COVERED OVERHEAD FOOTBRIDGE
                </text>

                {/* Platform tracks & islands */}
                {activeStation.platforms.slice(0, 6).map((plat, idx) => {
                  const y = 30 + idx * 20;
                  const isTarget = plat.number === selectedPlatformNumber;

                  return (
                    <g key={plat.number}>
                      {/* Railway tracks */}
                      <line x1="130" y1={y - 3} x2="570" y2={y - 3} stroke="#395045" strokeWidth="1.5" strokeDasharray="4,2" />
                      <line x1="130" y1={y + 3} x2="570" y2={y + 3} stroke="#395045" strokeWidth="1.5" strokeDasharray="4,2" />

                      {/* Platform Island */}
                      <rect
                        x="140"
                        y={y - 7}
                        width="420"
                        height="14"
                        rx="4"
                        fill={isTarget ? '#D4A359' : '#1E382A'}
                        stroke={isTarget ? '#FFF' : '#2C503D'}
                        strokeWidth={isTarget ? '1.5' : '1'}
                      />
                      <text
                        x="150"
                        y={y + 3}
                        fill={isTarget ? '#173024' : '#E0EBE4'}
                        fontSize="8"
                        fontWeight="bold"
                      >
                        Platform {plat.number}
                      </text>

                      {/* Active target beacon indicator */}
                      {isTarget && (
                        <g>
                          <circle cx="340" cy={y} r="5" fill="#EF4444" className="animate-ping" opacity="0.75" />
                          <circle cx="340" cy={y} r="4" fill="#EF4444" />
                          <text x="370" y={y + 3} fill="#173024" fontSize="7" fontWeight="bold">
                            BOARDING ZONE
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Summary of Active Platform */}
            <div className="bg-[#182C22] p-3 rounded-xl border border-[#2B4E3C] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F4F0EA]">
                  Platform {activePlatform.number}: {activePlatform.lines}
                </span>
                <span className="text-[11px] text-[#D4A359] font-mono">
                  ~2-4 min walking time
                </span>
              </div>
              <p className="text-[11px] text-[#A7BCB0]">
                {activePlatform.popularTrains}
              </p>
            </div>
          </div>

          {/* Starting Entrance Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E685D] block mb-1.5">
              Starting Concourse Entrance
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {activeStation.entrances.map((ent, idx) => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntranceIdx(idx)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-start gap-2 ${
                    selectedEntranceIdx === idx
                      ? 'bg-[#173024] text-white border-[#173024] shadow-xs'
                      : 'bg-[#F2ECE0] text-[#1F2923] border-[#DFD5C2] hover:bg-[#EAE2D2]'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selectedEntranceIdx === idx ? 'text-[#D4A359]' : 'text-[#758A80]'}`} />
                  <div>
                    <span className="font-semibold block">{ent}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step-by-Step Walking Directions */}
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#DFD5C2] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#173024] flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-[#5B7B6E]" />
              Step-by-Step Walking Directions to Platform {activePlatform.number}
            </h3>

            <div className="space-y-3 pl-2 border-l-2 border-[#D4A359]">
              {activePlatform.stepsFromMainEntrance.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2D2A26]">
                  <span className="w-5 h-5 rounded-full bg-[#173024] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Amenities & Facilities */}
          <div className="bg-[#ECE7DC] rounded-xl p-3.5 border border-[#D5CCB8] space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5A5751] flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-[#5B7B6E]" />
              Platform {activePlatform.number} Amenities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activePlatform.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="bg-[#FAF7F2] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#1F2923] border border-[#D5CAA4]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#173024] hover:bg-[#224433] text-white transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
