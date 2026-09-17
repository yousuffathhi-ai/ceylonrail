import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Clock,
  Compass,
  Train,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  CloudSun,
  History,
} from 'lucide-react';
import { Language, Station, TrainSchedule } from '../../types';
import { translations } from '../../data/localization';
import { STATIONS, TRAIN_SCHEDULES } from '../../data/timetableData';
import { WeatherWidget } from '../common/WeatherWidget';
import { getRecentSearches } from '../../utils/offlineStorage';
import { TravelTipsSection } from './TravelTipsSection';

interface HomeViewProps {
  language: Language;
  onSearchTrains: (from: string, to: string, date: string) => void;
  onSelectTrain: (train: TrainSchedule) => void;
  onExploreLine: (line: string) => void;
  onOpenFareCalc: () => void;
  onOpenConductor: () => void;
}

const POPULAR_ROUTES = [
  { from: 'Colombo Fort', to: 'Kandy', tag: 'Hill Capital', time: '2.5 hrs', img: 'https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=600&auto=format&fit=crop' },
  { from: 'Colombo Fort', to: 'Ella', tag: 'Nine Arch Bridge', time: '9.5 hrs', img: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=600&auto=format&fit=crop' },
  { from: 'Colombo Fort', to: 'Galle', tag: 'Coast & Fort', time: '2 hrs', img: 'https://images.unsplash.com/photo-1566296517004-220eff94661b?q=80&w=600&auto=format&fit=crop' },
  { from: 'Colombo Fort', to: 'Jaffna', tag: 'Northern Realm', time: '6.5 hrs', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop' },
  { from: 'Colombo Fort', to: 'Nanu Oya', tag: 'Nuwara Eliya Mist', time: '7 hrs', img: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=600&auto=format&fit=crop' },
  { from: 'Colombo Fort', to: 'Trincomalee', tag: 'East Coast Surf', time: '7.5 hrs', img: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=600&auto=format&fit=crop' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onSearchTrains,
  onSelectTrain,
  onExploreLine,
  onOpenFareCalc,
  onOpenConductor,
}) => {
  const t = translations[language];

  // Search form state
  const [fromCode, setFromCode] = useState('FOT'); // Colombo Fort
  const [toCode, setToCode] = useState('ELL'); // Ella
  
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [recentSearches, setRecentSearches] = useState<{ id: string; from: string; to: string; date?: string }[]>([]);

  useEffect(() => {
    try {
      const stored = getRecentSearches();
      if (stored && stored.length > 0) {
        setRecentSearches(stored.slice(0, 3));
      } else {
        // Fallback default quick searches for immediate usability
        setRecentSearches([
          { id: 'def-1', from: 'Colombo Fort', to: 'Kandy' },
          { id: 'def-2', from: 'Colombo Fort', to: 'Ella' },
          { id: 'def-3', from: 'Colombo Fort', to: 'Galle' },
        ]);
      }
    } catch {
      setRecentSearches([
        { id: 'def-1', from: 'Colombo Fort', to: 'Kandy' },
        { id: 'def-2', from: 'Colombo Fort', to: 'Ella' },
        { id: 'def-3', from: 'Colombo Fort', to: 'Galle' },
      ]);
    }
  }, []);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromStation = STATIONS.find((s) => s.code === fromCode);
    const toStation = STATIONS.find((s) => s.code === toCode);
    if (fromStation && toStation) {
      onSearchTrains(fromStation.name_en, toStation.name_en, date);
    }
  };

  // Next departures from Colombo Fort
  const fortDepartures = TRAIN_SCHEDULES.filter((tr) =>
    tr.origin.includes('Colombo') || tr.stops.some((st) => st.station_code === 'FOT')
  ).slice(0, 4);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Search Widget Card */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-6 border border-[#DFD5C2] shadow-sm relative overflow-hidden">
        {/* Subtle vintage stamp motif */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full border-8 border-[#D4A359]/10 pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B7B6E]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#173024]">
              {t.findTrains}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#7A7468] bg-[#EFE9DC] px-2 py-0.5 rounded border border-[#DDD4C2]">
            Offline SQLite DB
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-center">
            {/* From Station */}
            <div className="bg-[#F2ECE0] p-2.5 rounded-xl border border-[#D5CAA4]/70 focus-within:border-[#758A80] transition-colors">
              <label className="text-[10px] uppercase font-bold text-[#6E685D] block mb-0.5">
                {t.from}
              </label>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="w-full bg-transparent font-medium text-xs sm:text-sm text-[#1F2923] outline-none cursor-pointer"
              >
                {STATIONS.map((s) => (
                  <option key={`from-${s.id}`} value={s.code} className="bg-[#FAF7F2]">
                    {language === 'si' ? s.name_si : language === 'ta' ? s.name_ta : s.name_en} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="w-8 h-8 rounded-full bg-[#758A80] hover:bg-[#5C756B] text-white flex items-center justify-center self-center justify-self-center shadow-xs transition-transform active:rotate-180"
              title={t.swapStations}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            {/* To Station */}
            <div className="bg-[#F2ECE0] p-2.5 rounded-xl border border-[#D5CAA4]/70 focus-within:border-[#758A80] transition-colors">
              <label className="text-[10px] uppercase font-bold text-[#6E685D] block mb-0.5">
                {t.to}
              </label>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                className="w-full bg-transparent font-medium text-xs sm:text-sm text-[#1F2923] outline-none cursor-pointer"
              >
                {STATIONS.map((s) => (
                  <option key={`to-${s.id}`} value={s.code} className="bg-[#FAF7F2]">
                    {language === 'si' ? s.name_si : language === 'ta' ? s.name_ta : s.name_en} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  date === todayStr
                    ? 'bg-[#173024] text-white border-[#173024]'
                    : 'bg-[#EAE3D5] text-[#4A463F] border-[#D6CDBC] hover:bg-[#DDD5C5]'
                }`}
              >
                {t.today}
              </button>

              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  date === tomorrowStr
                    ? 'bg-[#173024] text-white border-[#173024]'
                    : 'bg-[#EAE3D5] text-[#4A463F] border-[#D6CDBC] hover:bg-[#DDD5C5]'
                }`}
              >
                {t.tomorrow}
              </button>

              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#EAE3D5] text-[#24211C] border border-[#D6CDBC] px-2.5 py-1 rounded-full text-xs outline-none cursor-pointer focus:border-[#758A80]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#173024] hover:bg-[#234534] text-[#F4F0EA] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-98"
            >
              <Search className="w-4 h-4 text-[#D4A359]" />
              <span>{t.findTrains}</span>
            </button>
          </div>

          {/* 3 Most Recent Train Searches Quick Actions */}
          <div className="pt-3 border-t border-[#DFD5C2]/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6E685D]">
                <Clock className="w-3.5 h-3.5 text-[#C88A35]" />
                <span>Recent Searches</span>
              </div>
              <span className="text-[10px] text-[#8C8477] font-medium">Quick Actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 3).map((item, idx) => (
                <button
                  key={`recent-${item.id || idx}`}
                  type="button"
                  onClick={() => onSearchTrains(item.from, item.to, item.date || date)}
                  className="flex items-center gap-1.5 bg-[#F2ECE0] hover:bg-[#EAE2D2] text-[#173024] px-3 py-1.5 rounded-xl border border-[#D5CAA4] text-xs font-medium shadow-2xs transition-all hover:scale-[1.02] active:scale-98 group"
                >
                  <Train className="w-3.5 h-3.5 text-[#758A80] group-hover:text-[#173024]" />
                  <span className="text-[#3A352D] font-medium">{item.from}</span>
                  <ArrowRight className="w-3 h-3 text-[#C88A35]" />
                  <span className="font-bold text-[#173024]">{item.to}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      {/* Destination Station Weather Forecast Widget */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D4A359]/20 text-[#C88A35]">
              <CloudSun className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-serif font-bold text-[#173024]">
                Destination Weather Forecast
              </h2>
              <p className="text-[11px] text-[#7A7468]">
                Current conditions and rain advisory for{' '}
                <span className="font-semibold text-[#173024]">
                  {STATIONS.find((s) => s.code === toCode)?.name_en || 'Destination'}
                </span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#5B7B6E] bg-[#EAE3D5] px-2 py-0.5 rounded border border-[#D5CAA4]">
            Open-Meteo Live API
          </span>
        </div>

        {/* Live Weather Card for Selected Destination */}
        <WeatherWidget
          stationName={STATIONS.find((s) => s.code === toCode)?.name_en || 'Kandy'}
        />

        {/* Quick Destination Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-[11px] text-[#7A7468] shrink-0 font-medium">Quick Preview:</span>
          {['KND', 'ELL', 'GLE', 'JAF', 'TRM', 'BAD', 'NNO'].map((code) => {
            const st = STATIONS.find((s) => s.code === code);
            if (!st) return null;
            const isSelected = toCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setToCode(code)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#173024] text-white border-[#173024]'
                    : 'bg-[#EDE7DA] text-[#4A463F] border-[#D5CAA4] hover:bg-[#E2DACB]'
                }`}
              >
                {st.name_en}
              </button>
            );
          })}
        </div>
      </section>

      {/* Travel Tips Section for Tourists and Commuters */}
      <TravelTipsSection language={language} />

      {/* Popular Journeys Horizontal Scroll */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#173024] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#C88A35]" />
            <span>{t.popularJourneys}</span>
          </h2>
          <span className="text-[11px] text-[#7A7468]">Scenic Rail Excursions</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {POPULAR_ROUTES.map((route, idx) => (
            <button
              key={idx}
              onClick={() => onSearchTrains(route.from, route.to, date)}
              className="relative shrink-0 w-44 sm:w-48 h-56 rounded-2xl overflow-hidden text-left border border-[#D8CEBA] shadow-xs group transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <img
                src={route.img}
                alt={route.to}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute top-2.5 right-2.5 bg-[#D4A359] text-[#12241C] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {route.time}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#D4A359] block mb-0.5">
                  {route.tag}
                </span>
                <h3 className="font-serif font-bold text-base leading-tight">
                  {route.to}
                </h3>
                <div className="text-[11px] text-[#E0E7E3] mt-1 flex items-center justify-between">
                  <span>From {route.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A359]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* "Next from Fort" Live Departure Ticker */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E1D3]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5B7B6E]" />
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#173024]">
              {t.nextFromFort}
            </h2>
          </div>
          <span className="text-[11px] text-[#5B7B6E] font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
            Live Platform
          </span>
        </div>

        <div className="divide-y divide-[#EAE2D4]">
          {fortDepartures.map((train) => (
            <div
              key={train.train_id}
              onClick={() => onSelectTrain(train)}
              className="py-3 flex items-center justify-between hover:bg-[#F4EFE6] px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#173024] text-[#D4A359] flex items-center justify-center shrink-0 font-mono text-xs font-bold shadow-2xs">
                  {train.train_id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-[#1F2923]">
                      {train.train_name}
                    </h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        train.train_type === 'ICE'
                          ? 'bg-[#E3EFEA] text-[#1E5638]'
                          : train.train_type === 'Night Mail'
                          ? 'bg-[#EAE4F5] text-[#4A2D78]'
                          : 'bg-[#F2ECE1] text-[#696355]'
                      }`}
                    >
                      {train.train_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6E685C] flex items-center gap-1.5 mt-0.5">
                    <span>{train.origin}</span>
                    <span className="text-[#8F887C]">➔</span>
                    <span className="font-semibold text-[#1F2923]">{train.destination}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-[#173024]">
                  {train.departure_time}
                </div>
                <div className="text-[10px] text-[#827D72]">
                  {train.operating_days}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Railway Lines Bento Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#173024] flex items-center gap-1.5">
            <Train className="w-4 h-4 text-[#758A80]" />
            <span>{t.railwayLines}</span>
          </h2>
          <span className="text-[11px] text-[#7A7468]">Sri Lanka Rail Network</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Main Line */}
          <div
            onClick={() => onExploreLine('Main Line')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1B3629] to-[#0E1F17] text-white cursor-pointer hover:shadow-md transition-all group border border-[#2B4E3B]"
          >
            <div className="flex items-center justify-between text-xs text-[#A7C2B3] mb-1">
              <span>Colombo Fort ➔ Badulla (292 km)</span>
              <span className="bg-[#D4A359]/20 text-[#E7C286] px-2 py-0.5 rounded text-[10px] font-mono">
                1867
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#D4A359] transition-colors">
              The Main Line (Highland Odyssey)
            </h3>
            <p className="text-xs text-[#BDD1C6] mt-1 line-clamp-2">
              Climbs Kadugannawa Pass, reaches 1,898 m at Pattipola summit, and crosses the Nine Arch Bridge.
            </p>
          </div>

          {/* Coastal Line */}
          <div
            onClick={() => onExploreLine('Coastal Line')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1C3A4B] to-[#12232E] text-white cursor-pointer hover:shadow-md transition-all group border border-[#2D5066]"
          >
            <div className="flex items-center justify-between text-xs text-[#A8C8DC] mb-1">
              <span>Colombo Fort ➔ Matara / Beliatta (160 km)</span>
              <span className="bg-[#59A6D4]/20 text-[#96D1F5] px-2 py-0.5 rounded text-[10px] font-mono">
                1895
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#78C4F4] transition-colors">
              The Coastal Line (Ocean Surfer)
            </h3>
            <p className="text-xs text-[#B8D3E3] mt-1 line-clamp-2">
              Hugs the Indian Ocean waves through Bentota, Hikkaduwa, Galle Dutch Fort, and Weligama.
            </p>
          </div>

          {/* Northern Line */}
          <div
            onClick={() => onExploreLine('Northern Line')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#4A2D22] to-[#2B1912] text-white cursor-pointer hover:shadow-md transition-all group border border-[#694233]"
          >
            <div className="flex items-center justify-between text-xs text-[#E0B8A8] mb-1">
              <span>Polgahawela ➔ Anuradhapura ➔ Jaffna</span>
              <span className="bg-[#D48A59]/20 text-[#F5B496] px-2 py-0.5 rounded text-[10px] font-mono">
                Yal Devi
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#F5A77B] transition-colors">
              The Northern Line (Cultural Lifeline)
            </h3>
            <p className="text-xs text-[#DFC0B4] mt-1 line-clamp-2">
              Connects ancient capitals, sacred stupas, and northern palmyrah landscapes.
            </p>
          </div>

          {/* Eastern Line */}
          <div
            onClick={() => onExploreLine('Eastern Line')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#3D3720] to-[#242013] text-white cursor-pointer hover:shadow-md transition-all group border border-[#59502E]"
          >
            <div className="flex items-center justify-between text-xs text-[#D8D2A8] mb-1">
              <span>Maho ➔ Polonnaruwa ➔ Batticaloa / Trinco</span>
              <span className="bg-[#D4C359]/20 text-[#F5E796] px-2 py-0.5 rounded text-[10px] font-mono">
                Wild Frontier
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#F5E27B] transition-colors">
              The Eastern Line (Wilderness & Harbors)
            </h3>
            <p className="text-xs text-[#DDD8BA] mt-1 line-clamp-2">
              Slices through Minneriya elephant wildlife corridor to deep natural harbors and lagoons.
            </p>
          </div>
        </div>
      </section>

      {/* AI Conductor Banner */}
      <section className="bg-gradient-to-r from-[#173024] to-[#254635] rounded-2xl p-4 sm:p-5 text-white border border-[#315642] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4A359]/20 border border-[#D4A359]/40 flex items-center justify-center text-[#FFE2A4] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">
              Need Personal Advice from the Conductor?
            </h3>
            <p className="text-xs text-[#CAD8D0] mt-0.5">
              Ask about photography seats, carriage baggage limits, or 30-day online bookings.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenConductor}
          className="w-full sm:w-auto bg-[#758A80] hover:bg-[#869E93] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all whitespace-nowrap"
        >
          Chat with Conductor AI
        </button>
      </section>
    </div>
  );
};
