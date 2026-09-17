import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
  Check,
  Train,
  Compass,
  DollarSign,
  Mountain,
  ChevronRight,
} from 'lucide-react';
import { Station, Language, RailwayLine, TrainSchedule } from '../../types';
import { STATIONS, TRAIN_SCHEDULES } from '../../data/timetableData';

interface TripPlannerModalProps {
  onClose: () => void;
  language: Language;
  onSearchSegment?: (from: string, to: string) => void;
}

interface CuratedTrip {
  id: string;
  title: string;
  tagline: string;
  stationCodes: string[];
  description: string;
}

const CURATED_TRIPS: CuratedTrip[] = [
  {
    id: 'highland-tea',
    title: 'The Highland Tea Trails & Mountain Vistas',
    tagline: 'Colombo ➔ Kandy ➔ Nanu Oya ➔ Ella ➔ Badulla',
    stationCodes: ['FOT', 'KND', 'NOY', 'ELL', 'BDL'],
    description: 'The world-famous scenic train journey through misty emerald tea plantations, 46 tunnels, and the Demodara Nine Arch Bridge.',
  },
  {
    id: 'southern-coast',
    title: 'The Southern Coastal Ocean Line',
    tagline: 'Colombo ➔ Aluthgama ➔ Hikkaduwa ➔ Galle ➔ Matara',
    stationCodes: ['FOT', 'ALT', 'HKD', 'GLE', 'MTR'],
    description: 'Hugs the surf and sandy shores of the Indian Ocean, historic Dutch Galle Fort, and stilt fishermen beaches.',
  },
  {
    id: 'cultural-triangle',
    title: 'Ancient Kingdoms & Wildlife Corridor',
    tagline: 'Colombo ➔ Kurunegala ➔ Anuradhapura ➔ Polonnaruwa',
    stationCodes: ['FOT', 'KRN', 'ANP', 'PLN'],
    description: 'Journey through 2,500 years of civilization, giant stupas, royal ruins, and elephant sanctuary forests.',
  },
  {
    id: 'northern-express',
    title: 'The Grand Northern Lifeline',
    tagline: 'Colombo ➔ Anuradhapura ➔ Vavuniya ➔ Jaffna ➔ Kankesanthurai',
    stationCodes: ['FOT', 'ANP', 'VAV', 'JAF', 'KKS'],
    description: 'Traverse the ancient dry plains, Elephant Pass lagoon causeway, and the cultural heart of Jaffna.',
  },
];

const SAVED_TRIPS_KEY = 'ceylon_rail_saved_itineraries';

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  onClose,
  language,
  onSearchSegment,
}) => {
  // Itinerary stops state
  const [selectedStationCodes, setSelectedStationCodes] = useState<string[]>([
    'FOT',
    'KND',
    'NOY',
    'ELL',
  ]);
  const [itineraryTitle, setItineraryTitle] = useState('My Sri Lanka Rail Expedition');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Selected stations objects
  const stationsInOrder = useMemo(() => {
    return selectedStationCodes
      .map((code) => STATIONS.find((s) => s.code === code))
      .filter(Boolean) as Station[];
  }, [selectedStationCodes]);

  // Compute segments
  const segments = useMemo(() => {
    const list: Array<{
      from: Station;
      to: Station;
      distanceKm: number;
      estimatedMinutes: number;
      fare3rd: number;
      fare2nd: number;
      fare1st: number;
      connectingTrain?: TrainSchedule;
    }> = [];

    for (let i = 0; i < stationsInOrder.length - 1; i++) {
      const from = stationsInOrder[i];
      const to = stationsInOrder[i + 1];

      const distFrom = from.distance_from_fort_km ?? 0;
      const distTo = to.distance_from_fort_km ?? 0;
      const distanceKm = Math.max(10, Math.abs(distTo - distFrom));

      // Estimated railway speed ~35-45 km/h depending on line
      const isHill = from.elevation_m! > 300 || to.elevation_m! > 300;
      const speedKmh = isHill ? 28 : 45;
      const estimatedMinutes = Math.round((distanceKm / speedKmh) * 60) + 15;

      // Find connecting train if available
      const directTrain = TRAIN_SCHEDULES.find((tr) => {
        const hasFrom = tr.origin === from.name_en || tr.stops.some((st) => st.station_code === from.code);
        const hasTo = tr.destination === to.name_en || tr.stops.some((st) => st.station_code === to.code);
        return hasFrom && hasTo;
      });

      // Rough fare calculation
      const fare3rd = Math.max(150, Math.round(distanceKm * 3.5));
      const fare2nd = Math.round(fare3rd * 2);
      const fare1st = Math.round(fare3rd * 4.5);

      list.push({
        from,
        to,
        distanceKm,
        estimatedMinutes,
        fare3rd,
        fare2nd,
        fare1st,
        connectingTrain: directTrain,
      });
    }
    return list;
  }, [stationsInOrder]);

  // Totals
  const totalMinutes = useMemo(() => {
    return segments.reduce((acc, s) => acc + s.estimatedMinutes, 0);
  }, [segments]);

  const totalDistanceKm = useMemo(() => {
    return segments.reduce((acc, s) => acc + s.distanceKm, 0);
  }, [segments]);

  const totalFare3rd = useMemo(() => {
    return segments.reduce((acc, s) => acc + s.fare3rd, 0);
  }, [segments]);

  const totalFare2nd = useMemo(() => {
    return segments.reduce((acc, s) => acc + s.fare2nd, 0);
  }, [segments]);

  // Add a stop
  const handleAddStop = (code: string) => {
    if (!selectedStationCodes.includes(code)) {
      setSelectedStationCodes([...selectedStationCodes, code]);
    }
  };

  // Remove a stop
  const handleRemoveStop = (idx: number) => {
    if (selectedStationCodes.length <= 2) return;
    const next = [...selectedStationCodes];
    next.splice(idx, 1);
    setSelectedStationCodes(next);
  };

  // Move stop up
  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...selectedStationCodes];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    setSelectedStationCodes(next);
  };

  // Move stop down
  const handleMoveDown = (idx: number) => {
    if (idx === selectedStationCodes.length - 1) return;
    const next = [...selectedStationCodes];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    setSelectedStationCodes(next);
  };

  // Load curated trip
  const handleLoadCurated = (trip: CuratedTrip) => {
    setSelectedStationCodes(trip.stationCodes);
    setItineraryTitle(trip.title);
  };

  // Save itinerary to localStorage
  const handleSaveItinerary = () => {
    try {
      const raw = localStorage.getItem(SAVED_TRIPS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const newTrip = {
        id: 'trip_' + Date.now(),
        title: itineraryTitle,
        stations: selectedStationCodes,
        totalMinutes,
        totalDistanceKm,
        totalFare3rd,
        savedAt: Date.now(),
      };
      list.unshift(newTrip);
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(list));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // fallback
    }
  };

  // Copy itinerary text
  const handleCopySummary = () => {
    const lines = [
      `🚆 ${itineraryTitle}`,
      `Stops: ${stationsInOrder.map((s) => s.name_en).join(' ➔ ')}`,
      `Total Rail Travel Time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      `Total Track Distance: ${totalDistanceKm.toFixed(1)} km`,
      `Estimated Fares: 3rd Class ~${totalFare3rd} LKR | 2nd Class ~${totalFare2nd} LKR`,
      '',
      'Segment Breakdown:',
      ...segments.map(
        (seg, i) =>
          `Leg ${i + 1}: ${seg.from.name_en} ➔ ${seg.to.name_en} (~${Math.floor(seg.estimatedMinutes / 60)}h ${seg.estimatedMinutes % 60}m, ${seg.distanceKm.toFixed(1)} km)${seg.connectingTrain ? ` [Train: ${seg.connectingTrain.train_name} #${seg.connectingTrain.train_id}]` : ''}`
      ),
      '',
      'Planned with Ceylon Rail Guide',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Remaining available stations to add
  const availableStationsToAdd = useMemo(() => {
    return STATIONS.filter((s) => !selectedStationCodes.includes(s.code));
  }, [selectedStationCodes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#D8CEBA] max-h-[92vh] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Header */}
        <div className="bg-[#173024] text-[#F4F0EA] p-4 sm:p-5 relative border-b border-[#2A4E3B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4A359] text-[#173024] flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                Multi-Stop Rail Itinerary Planner
              </h2>
              <p className="text-xs text-[#A8BEB1]">
                Calculate total travel times, fares & connecting trains across multiple segments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#A7BCB0] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">
          {/* Preset Curated Itineraries Quick Selector */}
          <div className="bg-[#EFE8DC] p-3 rounded-xl border border-[#D5CAA4]/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#686358] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C88A35]" />
                Curated Iconic Itineraries
              </span>
              <span className="text-[10px] text-[#7A7468]">Click to load pre-built circuit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CURATED_TRIPS.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => handleLoadCurated(trip)}
                  className="text-left bg-[#FAF7F2] hover:bg-white p-2.5 rounded-xl border border-[#DCD3C0] hover:border-[#758A80] transition-all shadow-2xs group"
                >
                  <div className="text-xs font-bold font-serif text-[#173024] group-hover:text-[#5B7B6E]">
                    {trip.title}
                  </div>
                  <div className="text-[10px] text-[#6E685D] mt-0.5 truncate font-medium">
                    {trip.tagline}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trip Summary Dashboard Metric Card */}
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#DFD5C2] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2D8C6]">
              <input
                type="text"
                value={itineraryTitle}
                onChange={(e) => setItineraryTitle(e.target.value)}
                className="font-serif font-bold text-base sm:text-lg text-[#173024] bg-transparent border-b border-dashed border-[#B8AE99] pb-0.5 outline-none focus:border-[#758A80]"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveItinerary}
                  className="flex items-center gap-1 text-xs font-medium bg-[#758A80] hover:bg-[#5C756B] text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Saved!' : 'Save Itinerary'}</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-xs font-medium bg-[#EAE3D5] hover:bg-[#DDD5C3] text-[#302D28] px-3 py-1.5 rounded-lg border border-[#D1C7B2] transition-colors"
                  title="Copy full itinerary summary to clipboard"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-[#2E8555]" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied' : 'Share / Copy'}</span>
                </button>
              </div>
            </div>

            {/* Total Metrics Display */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center">
              <div className="bg-[#F2ECE0] p-2.5 rounded-xl border border-[#DDD4C2]">
                <div className="text-[10px] uppercase font-bold text-[#6D675C] flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-[#5B7B6E]" />
                  Total Rail Time
                </div>
                <div className="font-mono font-bold text-sm sm:text-base text-[#173024] mt-0.5">
                  {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                </div>
              </div>

              <div className="bg-[#F2ECE0] p-2.5 rounded-xl border border-[#DDD4C2]">
                <div className="text-[10px] uppercase font-bold text-[#6D675C] flex items-center justify-center gap-1">
                  <Mountain className="w-3 h-3 text-[#5B7B6E]" />
                  Track Distance
                </div>
                <div className="font-mono font-bold text-sm sm:text-base text-[#173024] mt-0.5">
                  {totalDistanceKm.toFixed(1)} km
                </div>
              </div>

              <div className="bg-[#F2ECE0] p-2.5 rounded-xl border border-[#DDD4C2]">
                <div className="text-[10px] uppercase font-bold text-[#6D675C] flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#D4A359]" />
                  Est. 3rd / 2nd Fare
                </div>
                <div className="font-mono font-bold text-xs sm:text-sm text-[#173024] mt-0.5">
                  ~{totalFare3rd} / ~{totalFare2nd} LKR
                </div>
              </div>
            </div>
          </div>

          {/* Stops List & Segments Timeline */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D574D] flex items-center justify-between">
              <span>Itinerary Route Sequence ({stationsInOrder.length} Stops)</span>
              <span className="text-[11px] text-[#7A7468] font-normal">
                Use arrows to reorder stops
              </span>
            </h3>

            <div className="space-y-2">
              {stationsInOrder.map((station, idx) => {
                const isOrigin = idx === 0;
                const isFinal = idx === stationsInOrder.length - 1;
                const segmentAfter = segments[idx];

                return (
                  <div key={`${station.code}-${idx}`} className="space-y-2">
                    {/* Station Node Card */}
                    <div className="flex items-center justify-between bg-[#FAF7F2] p-3 rounded-xl border border-[#DFD5C2] shadow-2xs">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isOrigin || isFinal
                              ? 'bg-[#173024] text-[#D4A359]'
                              : 'bg-[#758A80] text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div>
                          <div className="font-semibold text-sm text-[#173024] flex items-center gap-2">
                            <span>{station.name_en}</span>
                            <span className="font-mono text-[10px] text-[#696357] px-1.5 py-0.5 rounded bg-[#EAE3D5]">
                              {station.code}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#7A7468] flex items-center gap-2">
                            <span>{station.line}</span>
                            {station.elevation_m !== undefined && station.elevation_m > 50 && (
                              <span>• {station.elevation_m}m elevation</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={isOrigin}
                          className="p-1 rounded hover:bg-[#EAE2D2] disabled:opacity-30 text-[#4E493F]"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={isFinal}
                          className="p-1 rounded hover:bg-[#EAE2D2] disabled:opacity-30 text-[#4E493F]"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveStop(idx)}
                          disabled={stationsInOrder.length <= 2}
                          className="p-1 rounded hover:bg-[#FBEAEA] text-[#D32F2F] disabled:opacity-30 ml-1"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Segment Connecting Details (Between Stop idx and idx+1) */}
                    {segmentAfter && (
                      <div className="ml-8 pl-4 py-1.5 border-l-2 border-dashed border-[#C5BBA7] flex items-center justify-between text-xs text-[#524D43]">
                        <div className="flex items-center gap-2">
                          <Train className="w-3.5 h-3.5 text-[#5B7B6E]" />
                          <span>
                            <strong>{segmentAfter.distanceKm.toFixed(1)} km</strong> (~{Math.floor(segmentAfter.estimatedMinutes / 60)}h {segmentAfter.estimatedMinutes % 60}m)
                          </span>
                          {segmentAfter.connectingTrain && (
                            <span className="bg-[#D9EFE3] text-[#194D31] px-2 py-0.5 rounded text-[10px] font-semibold">
                              #{segmentAfter.connectingTrain.train_id} {segmentAfter.connectingTrain.train_name}
                            </span>
                          )}
                        </div>

                        {onSearchSegment && (
                          <button
                            onClick={() => {
                              onSearchSegment(segmentAfter.from.name_en, segmentAfter.to.name_en);
                              onClose();
                            }}
                            className="text-[11px] text-[#173024] font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <span>Find Trains</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Next Station Dropdown */}
            {availableStationsToAdd.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DFD5C2]">
                  <Plus className="w-4 h-4 text-[#5B7B6E]" />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddStop(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#173024] outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      + Add another station stop to itinerary...
                    </option>
                    {availableStationsToAdd.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name_en} ({st.line} • {st.distance_from_fort_km} km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center justify-between">
          <div className="text-xs text-[#524D44]">
            {stationsInOrder.length} stops • {segments.length} train segments
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#173024] hover:bg-[#234533] text-white transition-colors"
          >
            Done Planning
          </button>
        </div>
      </div>
    </div>
  );
};
