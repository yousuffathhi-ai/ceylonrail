import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowRightLeft,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  Sparkles,
  Train,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import {
  Language,
  RailwayLine,
  TrainType,
  TrainSchedule,
} from '../../types';
import { translations } from '../../data/localization';
import { STATIONS, TRAIN_SCHEDULES } from '../../data/timetableData';
import { generateGoogleCalendarUrl } from '../../utils/calendar';
import { toggleBookmark, isBookmarked } from '../../utils/offlineStorage';
import { TrainComparisonModal } from './TrainComparisonModal';
import { PredictiveStationInput } from '../common/PredictiveStationInput';

interface SearchViewProps {
  language: Language;
  initialFrom?: string;
  initialTo?: string;
  initialLine?: RailwayLine | 'All';
  travelDate: string;
  onSelectTrain: (train: TrainSchedule) => void;
  onBookmarkChanged?: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  language,
  initialFrom = '',
  initialTo = '',
  initialLine = 'All',
  travelDate,
  onSelectTrain,
  onBookmarkChanged,
}) => {
  const t = translations[language];

  const [fromQuery, setFromQuery] = useState(initialFrom);
  const [toQuery, setToQuery] = useState(initialTo);
  const [selectedLine, setSelectedLine] = useState<RailwayLine | 'All'>(initialLine);
  const [selectedType, setSelectedType] = useState<TrainType | 'All'>('All');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Night'>('All');
  const [sortBy, setSortBy] = useState<'departure' | 'duration' | 'fare'>('departure');
  const [syncedTrainId, setSyncedTrainId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Voice Search State
  const [isListening, setIsListening] = useState<'from' | 'to' | 'both' | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Best-match station helper
  const matchStationName = (spoken: string): string => {
    const clean = spoken.toLowerCase().trim();
    if (clean.includes('colombo') || clean.includes('fort')) return 'Colombo Fort';
    if (clean.includes('kandy')) return 'Kandy';
    if (clean.includes('ella')) return 'Ella';
    if (clean.includes('galle')) return 'Galle';
    if (clean.includes('badulla')) return 'Badulla';
    if (clean.includes('jaffna')) return 'Jaffna';
    if (clean.includes('nanu') || clean.includes('nuwara') || clean.includes('eliya')) return 'Nanu Oya';
    if (clean.includes('matara')) return 'Matara';
    if (clean.includes('anuradhapura')) return 'Anuradhapura';
    if (clean.includes('trinco') || clean.includes('trincomalee')) return 'Trincomalee';
    if (clean.includes('batticaloa')) return 'Batticaloa';
    if (clean.includes('beliatta')) return 'Beliatta';
    if (clean.includes('polgahawela')) return 'Polgahawela';
    if (clean.includes('hatton')) return 'Hatton';
    if (clean.includes('hikkaduwa')) return 'Hikkaduwa';

    // Fuzzy search against station dictionary
    const found = STATIONS.find((s) => s.name_en.toLowerCase().includes(clean) || clean.includes(s.name_en.toLowerCase()));
    return found ? found.name_en : spoken;
  };

  const startVoiceSearch = (target: 'from' | 'to' | 'both') => {
    setVoiceError(null);
    setVoiceTranscript(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please type station name.');
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(target);

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setVoiceTranscript(text);

        if (target === 'from') {
          setFromQuery(matchStationName(text));
        } else if (target === 'to') {
          setToQuery(matchStationName(text));
        } else if (target === 'both') {
          // Parse "from X to Y" or "X to Y"
          const parts = text.toLowerCase().split(/\s+(?:to|until|towards|and)\s+/);
          if (parts.length >= 2) {
            setFromQuery(matchStationName(parts[0].replace(/^(from|departing)\s+/i, '')));
            setToQuery(matchStationName(parts[1]));
          } else {
            // Default to matching To or From
            setFromQuery(matchStationName(text));
          }
        }

        setTimeout(() => {
          setIsListening(null);
          setVoiceTranscript(null);
        }, 1500);
      };

      recognition.onerror = (event: any) => {
        setIsListening(null);
        if (event.error !== 'no-speech') {
          setVoiceError(`Voice input: ${event.error}. Please try speaking clearly.`);
          setTimeout(() => setVoiceError(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(null);
      };

      recognition.start();
    } catch (err) {
      setIsListening(null);
      setVoiceError('Could not access microphone.');
      setTimeout(() => setVoiceError(null), 4000);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(null);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setSelectedForCompare((prev) => {
      if (prev.includes(trainId)) {
        return prev.filter((id) => id !== trainId);
      }
      if (prev.length >= 2) {
        return [prev[1], trainId];
      }
      return [...prev, trainId];
    });
  };

  const handleSwapCompare = () => {
    if (selectedForCompare.length === 2) {
      setSelectedForCompare([selectedForCompare[1], selectedForCompare[0]]);
    }
  };

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  const handleReset = () => {
    setFromQuery('');
    setToQuery('');
    setSelectedLine('All');
    setSelectedType('All');
    setTimeFilter('All');
    setSortBy('departure');
  };

  // Filtered and sorted train schedules
  const filteredTrains = useMemo(() => {
    return TRAIN_SCHEDULES.filter((train) => {
      // Filter by Line
      if (selectedLine !== 'All' && train.line !== selectedLine) {
        return false;
      }

      // Filter by Type
      if (selectedType !== 'All' && train.train_type !== selectedType) {
        return false;
      }

      // Filter by Departure Time
      if (timeFilter !== 'All') {
        const hour = parseInt(train.departure_time.split(':')[0], 10);
        if (timeFilter === 'Morning' && (hour < 5 || hour >= 12)) return false;
        if (timeFilter === 'Afternoon' && (hour < 12 || hour >= 17)) return false;
        if (timeFilter === 'Night' && (hour < 17 && hour >= 5)) return false;
      }

      // Filter by From
      if (fromQuery.trim()) {
        const fq = fromQuery.toLowerCase();
        const matchesOrigin = train.origin.toLowerCase().includes(fq);
        const matchesStop = train.stops.some((st) => st.station_name.toLowerCase().includes(fq));
        if (!matchesOrigin && !matchesStop) return false;
      }

      // Filter by To
      if (toQuery.trim()) {
        const tq = toQuery.toLowerCase();
        const matchesDest = train.destination.toLowerCase().includes(tq);
        const matchesStop = train.stops.some((st) => st.station_name.toLowerCase().includes(tq));
        if (!matchesDest && !matchesStop) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'departure') {
        return a.departure_time.localeCompare(b.departure_time);
      }
      if (sortBy === 'duration') {
        return a.duration_minutes - b.duration_minutes;
      }
      if (sortBy === 'fare') {
        return a.estimated_fare_lkr.third - b.estimated_fare_lkr.third;
      }
      return 0;
    });
  }, [selectedLine, selectedType, timeFilter, fromQuery, toQuery, sortBy]);

  const handleQuickCalendarSync = (e: React.MouseEvent, train: TrainSchedule) => {
    e.stopPropagation();
    const url = generateGoogleCalendarUrl(train, travelDate);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSyncedTrainId(train.train_id);
    setTimeout(() => setSyncedTrainId(null), 3000);
  };

  const handleToggleBookmark = (e: React.MouseEvent, train: TrainSchedule) => {
    e.stopPropagation();
    toggleBookmark({
      train_id: train.train_id,
      train_name: train.train_name,
      from_station: train.origin,
      to_station: train.destination,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      date: travelDate,
      line: train.line,
    });
    if (onBookmarkChanged) onBookmarkChanged();
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Search and Filters Header Card */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-sm space-y-3.5">
        {/* Origin / Destination Search Inputs with Predictive Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-center">
          <div className="relative bg-[#F2ECE0] p-2.5 rounded-xl border border-[#D5CAA4]/70 focus-within:border-[#758A80] transition-colors">
            <PredictiveStationInput
              label={t.from}
              value={fromQuery}
              onChange={setFromQuery}
              placeholder="e.g. Colombo Fort, Kandy, Galle..."
              language={language}
              rightElement={
                <button
                  type="button"
                  onClick={() => (isListening === 'from' ? stopVoiceSearch() : startVoiceSearch('from'))}
                  className={`p-1 rounded-full transition-all ${
                    isListening === 'from'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-[#758A80] hover:text-[#173024] hover:bg-[#E2D9C8]'
                  }`}
                  title="Dictate departure station with voice"
                >
                  {isListening === 'from' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              }
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="w-8 h-8 rounded-full bg-[#758A80] hover:bg-[#5C756B] text-white flex items-center justify-center self-center justify-self-center shadow-xs transition-transform active:rotate-180"
            title="Swap Origin & Destination"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <div className="relative bg-[#F2ECE0] p-2.5 rounded-xl border border-[#D5CAA4]/70 focus-within:border-[#758A80] transition-colors">
            <PredictiveStationInput
              label={t.to}
              value={toQuery}
              onChange={setToQuery}
              placeholder="e.g. Ella, Badulla, Matara..."
              language={language}
              rightElement={
                <button
                  type="button"
                  onClick={() => (isListening === 'to' ? stopVoiceSearch() : startVoiceSearch('to'))}
                  className={`p-1 rounded-full transition-all ${
                    isListening === 'to'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-[#758A80] hover:text-[#173024] hover:bg-[#E2D9C8]'
                  }`}
                  title="Dictate destination station with voice"
                >
                  {isListening === 'to' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              }
            />
          </div>
        </div>

        {/* Voice Search Quick Bar & Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => (isListening === 'both' ? stopVoiceSearch() : startVoiceSearch('both'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isListening === 'both'
                ? 'bg-red-600 text-white shadow-xs animate-pulse'
                : 'bg-[#ECE5D8] hover:bg-[#E2DACB] text-[#2C2925] border border-[#D5CAA4]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>
              {isListening === 'both'
                ? 'Listening... Speak route (e.g. "Colombo to Kandy")'
                : 'Dictate Route with Voice'}
            </span>
          </button>

          {isListening && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              <span>Listening to your speech...</span>
            </div>
          )}

          {voiceTranscript && (
            <div className="text-xs text-[#2F7E4E] font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Heard: "{voiceTranscript}"
            </div>
          )}

          {voiceError && (
            <div className="text-xs text-amber-800 font-medium">
              {voiceError}
            </div>
          )}
        </div>

        {/* Filter Pills: Railway Line */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(
            [
              'All',
              'Main Line',
              'Coastal Line',
              'Northern Line',
              'Eastern Line',
              'Kelani Valley Line',
            ] as Array<RailwayLine | 'All'>
          ).map((line) => (
            <button
              key={line}
              onClick={() => setSelectedLine(line)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border ${
                selectedLine === line
                  ? 'bg-[#173024] text-white border-[#173024] font-medium'
                  : 'bg-[#ECE5D7] text-[#4A463F] border-[#D6CDBC] hover:bg-[#DFD7C6]'
              }`}
            >
              {line === 'All' ? t.allLines : line}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Train Type & Time of Day & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E8E1D3] text-xs">
          {/* Train Types */}
          <div className="flex items-center gap-1">
            {(['All', 'ICE', 'Express', 'Night Mail'] as Array<TrainType | 'All'>).map((tp) => (
              <button
                key={tp}
                onClick={() => setSelectedType(tp)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedType === tp
                    ? 'bg-[#758A80] text-white'
                    : 'bg-[#EFE9DD] text-[#555047] hover:bg-[#E3DCCF]'
                }`}
              >
                {tp === 'All' ? t.allTypes : tp}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#7A7468]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#EAE3D5] text-[#24211C] border border-[#D6CDBC] rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
            >
              <option value="departure">Departure Time</option>
              <option value="duration">Fastest Duration</option>
              <option value="fare">Lowest Fare</option>
            </select>

            {(fromQuery || toQuery || selectedLine !== 'All' || selectedType !== 'All') && (
              <button
                onClick={handleReset}
                className="text-[#758A80] hover:text-[#173024] p-1 rounded hover:bg-[#EAE3D5]"
                title={t.clearFilters}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[#6A655C]">
        <div className="font-semibold text-[#173024]">
          {filteredTrains.length} {filteredTrains.length === 1 ? 'train' : 'trains'} scheduled
        </div>
        <div className="text-[11px]">
          Travel Date: <span className="font-medium text-[#1F2923]">{travelDate}</span>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-3">
        {filteredTrains.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center border border-[#DFD5C2] text-[#6E695F] space-y-2">
            <Train className="w-10 h-10 mx-auto text-[#A8A092]" />
            <h3 className="font-serif font-bold text-base text-[#24211C]">
              No direct trains found
            </h3>
            <p className="text-xs max-w-sm mx-auto text-[#7D766A]">
              Try searching with broader station names or clear active line filters.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 bg-[#758A80] hover:bg-[#5C756B] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredTrains.map((train) => {
            const isBooked = isBookmarked(train.train_id);
            const isJustSynced = syncedTrainId === train.train_id;
            const isSelectedForCompare = selectedForCompare.includes(train.train_id);

            return (
              <div
                key={train.train_id}
                onClick={() => onSelectTrain(train)}
                className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group shadow-2xs hover:shadow-sm ${
                  isSelectedForCompare
                    ? 'bg-[#F5EFE3] border-[#173024] ring-2 ring-[#173024]/25'
                    : 'bg-[#FAF7F2] hover:bg-[#FFFDF9] border-[#DFD5C2] hover:border-[#758A80]'
                }`}
              >
                {/* Top Train Identity Bar */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8E1D3]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#173024] text-[#D4A359]">
                      #{train.train_id}
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#173024] group-hover:text-[#5B7B6E] transition-colors">
                      {train.train_name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        train.train_type === 'ICE'
                          ? 'bg-[#D9EFE3] text-[#194D31]'
                          : train.train_type === 'Night Mail'
                          ? 'bg-[#EBE5F7] text-[#482A79]'
                          : 'bg-[#EDE7DB] text-[#554F43]'
                      }`}
                    >
                      {train.train_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Compare select button */}
                    <button
                      onClick={(e) => handleToggleCompare(e, train.train_id)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                        isSelectedForCompare
                          ? 'bg-[#173024] text-[#D4A359]'
                          : 'bg-[#EFE9DD] hover:bg-[#D5CCBA] text-[#544E43]'
                      }`}
                      title={isSelectedForCompare ? 'Remove from comparison' : 'Select for side-by-side compare'}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isSelectedForCompare ? 'Compared' : 'Compare'}
                      </span>
                    </button>

                    {/* Google Calendar sync direct button */}
                    <button
                      onClick={(e) => handleQuickCalendarSync(e, train)}
                      className="p-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#758A80] text-[#544E43] hover:text-white transition-colors"
                      title={t.addToCalendar}
                    >
                      {isJustSynced ? (
                        <Check className="w-3.5 h-3.5 text-[#52D288]" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Bookmark toggle */}
                    <button
                      onClick={(e) => handleToggleBookmark(e, train)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBooked
                          ? 'bg-[#D4A359] text-[#12241C]'
                          : 'bg-[#EFE9DD] hover:bg-[#D5CCBA] text-[#544E43]'
                      }`}
                      title="Bookmark train"
                    >
                      {isBooked ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Journey Times and Route */}
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-3">
                  <div>
                    <div className="font-mono text-base sm:text-lg font-bold text-[#173024]">
                      {train.departure_time}
                    </div>
                    <div className="text-xs font-medium text-[#403C35]">
                      {train.origin}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-[#7A7468] font-medium">
                      {Math.floor(train.duration_minutes / 60)}h {train.duration_minutes % 60}m
                    </span>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#C9BFAC] relative my-1">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#758A80] rounded-full" />
                    </div>
                    <span className="text-[9px] text-[#918B80] uppercase tracking-wide">
                      {train.stops.length} stops
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base sm:text-lg font-bold text-[#173024]">
                      {train.arrival_time}
                    </div>
                    <div className="text-xs font-medium text-[#403C35]">
                      {train.destination}
                    </div>
                  </div>
                </div>

                {/* Scenic Tip Snippet if available */}
                {train.scenic_highlight && (
                  <div className="text-[11px] text-[#755928] bg-[#F4EDE0] px-2.5 py-1 rounded-lg mb-3 flex items-center gap-1.5 border border-[#E4D9C7]">
                    <Sparkles className="w-3 h-3 text-[#C88A35] shrink-0" />
                    <span className="line-clamp-1">{train.scenic_highlight}</span>
                  </div>
                )}

                {/* Footer: Available Classes & Estimated Fare */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8E1D3]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {train.classes.map((cls) => (
                      <span
                        key={cls}
                        className="text-[10px] bg-[#EDE7DB] text-[#4A463D] px-2 py-0.5 rounded font-medium"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-[#7A7468]">From </span>
                    <span className="font-bold text-[#173024] text-xs sm:text-sm">
                      {train.estimated_fare_lkr.third} LKR
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Comparison Floating Dock */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
          <div className="bg-[#173024] text-[#F4F0EA] rounded-2xl p-3.5 shadow-2xl border-2 border-[#D4A359] flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#E7C286]">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Train Comparison ({selectedForCompare.length}/2)</span>
              </div>
              <div className="text-xs text-[#C6D8CE] truncate mt-0.5">
                {selectedForCompare.length === 1 ? (
                  <span>
                    Selected: <strong>#{selectedForCompare[0]}</strong>. Pick 1 more to compare.
                  </span>
                ) : (
                  <span>
                    Ready to compare: <strong>#{selectedForCompare[0]}</strong> vs <strong>#{selectedForCompare[1]}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-xs text-[#A8BEB1] hover:text-white px-2 py-1 rounded hover:bg-white/10"
              >
                Clear
              </button>

              <button
                disabled={selectedForCompare.length < 2}
                onClick={() => setIsComparing(true)}
                className="bg-[#D4A359] hover:bg-[#C09248] disabled:opacity-40 disabled:cursor-not-allowed text-[#173024] font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isComparing && selectedForCompare.length === 2 && (
        (() => {
          const trainA = TRAIN_SCHEDULES.find((t) => t.train_id === selectedForCompare[0]);
          const trainB = TRAIN_SCHEDULES.find((t) => t.train_id === selectedForCompare[1]);
          if (!trainA || !trainB) return null;
          return (
            <TrainComparisonModal
              trainA={trainA}
              trainB={trainB}
              onClose={() => setIsComparing(false)}
              onSelectTrain={(train) => {
                setIsComparing(false);
                onSelectTrain(train);
              }}
              onSwap={handleSwapCompare}
              language={language}
            />
          );
        })()
      )}
    </div>
  );
};
