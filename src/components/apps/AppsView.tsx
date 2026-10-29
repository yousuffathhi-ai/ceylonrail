import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Route,
  Calculator,
  Navigation,
  Bot,
  CloudSun,
  Compass,
  Award,
  PhoneCall,
  Ticket,
  ChevronRight,
  ExternalLink,
  Eye,
  CheckCircle2,
  Train,
  Layers,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/localization';

interface AppsViewProps {
  language: Language;
  onOpenPlanner: () => void;
  onOpenFareCalc: () => void;
  onOpenConductor: () => void;
  onOpenPlatformHelper: () => void;
  onNavigateToTab: (tab: 'home' | 'search' | 'route-map' | 'heritage' | 'saved') => void;
}

interface AchievementBadge {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const DEFAULT_BADGES: AchievementBadge[] = [
  {
    id: 'badge-1',
    name: 'Hill Country Climber',
    category: 'Main Line',
    description: 'Travel through the misty highlands past Pattipola summit (1,898m).',
    icon: '⛰️',
    unlocked: true,
  },
  {
    id: 'badge-2',
    name: 'Nine Arch Crosser',
    category: 'Ella Demodara',
    description: 'Cross the iconic 1921 British stone arch viaduct in Demodara.',
    icon: '🌉',
    unlocked: true,
  },
  {
    id: 'badge-3',
    name: 'Coastal Wave Cruiser',
    category: 'Coastal Line',
    description: 'Ride along the Indian Ocean shoreline between Colombo and Galle.',
    icon: '🌊',
    unlocked: false,
  },
  {
    id: 'badge-4',
    name: 'Yal Devi Legend',
    category: 'Northern Line',
    description: 'Cross Elephant Pass lagoon towards the historic Jaffna peninsula.',
    icon: '🌴',
    unlocked: false,
  },
  {
    id: 'badge-5',
    name: 'Night Mail Sleeper',
    category: 'Heritage',
    description: 'Experience an authentic overnight sleeper journey with tea plantations at dawn.',
    icon: '🌙',
    unlocked: false,
  },
];

export const AppsView: React.FC<AppsViewProps> = ({
  language,
  onOpenPlanner,
  onOpenFareCalc,
  onOpenConductor,
  onOpenPlatformHelper,
  onNavigateToTab,
}) => {
  const t = translations[language];

  // Badges state with localStorage persistence
  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    try {
      const stored = localStorage.getItem('ceylon_rail_badges_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_BADGES;
  });

  const [activeSeatLine, setActiveSeatLine] = useState<'main' | 'coast' | 'north'>('main');

  const toggleBadge = (id: string) => {
    setBadges((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, unlocked: !b.unlocked } : b));
      try {
        localStorage.setItem('ceylon_rail_badges_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header Hub Banner */}
      <section className="bg-gradient-to-r from-[#173024] to-[#254636] rounded-2xl p-5 sm:p-6 text-white border border-[#2D5340] shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#D4A359]/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#D4A359] text-[#12241C] text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider">
                Services & Apps
              </span>
              <span className="text-xs text-[#A7C2B3]">All-in-One Railway Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F4F0EA]">
              Sri Lanka Railways Digital Tools
            </h2>
            <p className="text-xs text-[#BED2C7] max-w-xl mt-1">
              Interactive travel calculators, station platform navigators, scenic window guides,
              and AI travel companions—all functioning completely offline without changing URL.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenPlanner}
              className="bg-[#D4A359] hover:bg-[#C2924A] text-[#173024] font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Route className="w-4 h-4 text-[#173024]" />
              <span>Multi-Stop Planner</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Tool Launcher Cards */}
      <section className="space-y-3">
        <h3 className="text-sm font-serif font-bold text-[#173024] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#758A80]" />
          <span>Core Railway Applications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Multi-Stop Trip Planner */}
          <div
            onClick={onOpenPlanner}
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAE2D2] flex items-center justify-center text-[#173024] mb-3 group-hover:scale-105 transition-transform border border-[#DDD3BF]">
                <Route className="w-5 h-5 text-[#D4A359]" />
              </div>
              <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                Multi-Stop Itinerary Planner
              </h4>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Chain multiple train segments (e.g. Colombo → Kandy → Ella → Badulla) with duration
                and fare estimation.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">Segment Chain</span>
              <span className="flex items-center gap-1 text-[#2D503E]">
                Open Planner <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Official Distance-Slab Fare Matrix */}
          <div
            onClick={onOpenFareCalc}
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAE2D2] flex items-center justify-center text-[#173024] mb-3 group-hover:scale-105 transition-transform border border-[#DDD3BF]">
                <Calculator className="w-5 h-5 text-[#2D503E]" />
              </div>
              <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                Official Fare & Class Matrix
              </h4>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Calculate accurate pricing for 1st AC, Observation Saloon, Sleeping Berth, 2nd, and
                3rd Class tiers.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">All Service Tiers</span>
              <span className="flex items-center gap-1 text-[#2D503E]">
                Calculate Fare <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Platform Walking Helper & GPS Navigator */}
          <div
            onClick={onOpenPlatformHelper}
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAE2D2] flex items-center justify-center text-[#173024] mb-3 group-hover:scale-105 transition-transform border border-[#DDD3BF]">
                <Navigation className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                Station Platform Walking Guide
              </h4>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Find ticket counters, cloakrooms, footbridges, and assigned platforms at Colombo Fort
                and major junctions.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">GPS Live Distance</span>
              <span className="flex items-center gap-1 text-[#2D503E]">
                View Platforms <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Gemini AI Conductor */}
          <div
            onClick={onOpenConductor}
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#173024] to-[#2E5440] flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Bot className="w-5 h-5 text-[#FFE2A4]" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                  Locomotive Conductor AI
                </h4>
                <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
              </div>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Ask questions about high-altitude scenic curves, photography viewpoints, tea stops,
                and local customs.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">Natural Language</span>
              <span className="flex items-center gap-1 text-[#2D503E]">
                Talk to AI <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 5: Official SLR Seat Reservation Bridge */}
          <a
            href="https://seatreservation.railway.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAE2D2] flex items-center justify-center text-[#173024] mb-3 group-hover:scale-105 transition-transform border border-[#DDD3BF]">
                <Ticket className="w-5 h-5 text-[#B45309]" />
              </div>
              <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                Official SLR Booking Portal
              </h4>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Direct official web portal to book 30 days in advance for Ella Odyssey, Podi Menike,
                and 1st Class Saloons.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">seatreservation.railway.gov.lk</span>
              <span className="flex items-center gap-1 text-[#B45309]">
                Book Online <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>

          {/* Card 6: Interactive Route Map Quick Switch */}
          <div
            onClick={() => onNavigateToTab('route-map')}
            className="bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD3BF] p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-[#C7BAA0] flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAE2D2] flex items-center justify-center text-[#173024] mb-3 group-hover:scale-105 transition-transform border border-[#DDD3BF]">
                <MapPin className="w-5 h-5 text-[#758A80]" />
              </div>
              <h4 className="font-serif font-bold text-[#173024] text-sm group-hover:text-[#2D503E]">
                Offline Island Route Map
              </h4>
              <p className="text-xs text-[#5D584F] mt-1 line-clamp-2">
                Explore all 9 operating lines, elevation profiles, and station coordinates cached for
                offline use.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DFCC] text-xs font-semibold text-[#173024]">
              <span className="text-[11px] text-[#7A7468]">Cached Vectors</span>
              <span className="flex items-center gap-1 text-[#2D503E]">
                Open Map <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scenic Carriage Seat Selector Guide */}
      <section className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#DFD5C2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFCC] pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#D4A359]" />
            <div>
              <h3 className="font-serif font-bold text-[#173024] text-base">
                Scenic Seat Window Selector Guide
              </h3>
              <p className="text-xs text-[#6B655A]">
                Optimal carriage side recommendation for photography and jaw-dropping views
              </p>
            </div>
          </div>

          <div className="flex items-center bg-[#ECE4D4] p-1 rounded-xl gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSeatLine('main')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSeatLine === 'main'
                  ? 'bg-[#173024] text-white shadow-xs'
                  : 'text-[#5F584C] hover:text-[#173024]'
              }`}
            >
              Main Line
            </button>
            <button
              type="button"
              onClick={() => setActiveSeatLine('coast')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSeatLine === 'coast'
                  ? 'bg-[#173024] text-white shadow-xs'
                  : 'text-[#5F584C] hover:text-[#173024]'
              }`}
            >
              Coastal Line
            </button>
            <button
              type="button"
              onClick={() => setActiveSeatLine('north')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSeatLine === 'north'
                  ? 'bg-[#173024] text-white shadow-xs'
                  : 'text-[#5F584C] hover:text-[#173024]'
              }`}
            >
              Northern Line
            </button>
          </div>
        </div>

        {/* Dynamic Scenic Window Recommendations based on selected line */}
        {activeSeatLine === 'main' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Colombo Fort → Kandy / Badulla
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  SIT RIGHT SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                During the climb from Rambukkana to Kadugannawa, the <strong>RIGHT side</strong>{' '}
                offers breathtaking views of Bible Rock (Bathalegala), steep cliffs, and the Great
                Alagalla valley below.
              </p>
              <div className="text-[11px] font-mono text-[#2D503E] bg-[#E3DAC8] px-2.5 py-1.5 rounded">
                💡 Pro Tip: At Demodara Loop & Ella, switch to LEFT side for the Nine Arch viaduct!
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Nanu Oya → Ella → Badulla
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  SIT LEFT SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                Past Idalgashinna and Haputale (the sharp knife-edge ridge), the{' '}
                <strong>LEFT side</strong> overlooks Southern provincial valleys and waterfalls,
                plunging 1,000 meters into the mist.
              </p>
              <div className="text-[11px] font-mono text-[#2D503E] bg-[#E3DAC8] px-2.5 py-1.5 rounded">
                💡 Pro Tip: Idalgashinna has cliff views on both sides of the station platform!
              </div>
            </div>
          </div>
        )}

        {activeSeatLine === 'coast' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Colombo Fort → Galle / Matara
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  SIT RIGHT SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                The tracks run literally 5 meters away from the Indian Ocean breakers. The{' '}
                <strong>RIGHT side</strong> gives an uninterrupted panoramic sunset view over the
                sea between Kollupitiya and Bentota.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Galle / Beliatta → Colombo Fort
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  SIT LEFT SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                Heading north towards Colombo, the ocean faces your <strong>LEFT window</strong>.
                Watch out for surfers at Hikkaduwa and stilt fishermen near Koggala!
              </p>
            </div>
          </div>
        )}

        {activeSeatLine === 'north' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Elephant Pass Causeway
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  EITHER SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                As Yal Devi speeds across the lagoon connecting mainland Sri Lanka to the Jaffna
                peninsula, shallow turquoise waters and palmyra palms flank both sides of the train.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#EFE9DD] border border-[#DDD3BF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#173024]">
                  Anuradhapura Stupa Vistas
                </span>
                <span className="bg-[#173024] text-[#D4A359] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  SIT RIGHT SIDE
                </span>
              </div>
              <p className="text-xs text-[#524C41] leading-relaxed">
                Catch glimpses of the monumental white domes of Ruwanwelisaya and Jetavanaramaya
                rising above ancient dry-zone forests.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Gamified Explorer Badges & Achievements */}
      <section className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#DFD5C2] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DFCC] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4A359]" />
            <div>
              <h3 className="font-serif font-bold text-[#173024] text-base">
                Ceylon Rail Explorer Badges
              </h3>
              <p className="text-xs text-[#6B655A]">
                Digital travel stamps earned across historic British colonial rail routes
              </p>
            </div>
          </div>
          <span className="bg-[#173024] text-[#D4A359] text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-[#D4A359]/30">
            {unlockedCount} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => toggleBadge(badge.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-[#FAF7F2] to-[#EFE9DC] border-[#D4A359] shadow-xs'
                  : 'bg-[#F2ECE1] border-[#DDD3BE] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-2xl">{badge.icon}</span>
                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Earned
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#7B7365] bg-[#E3DAC9] px-1.5 py-0.5 rounded">
                      Tap to unlock
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-xs text-[#173024]">{badge.name}</h4>
                <p className="text-[11px] text-[#635E54] mt-0.5 line-clamp-2">{badge.description}</p>
              </div>
              <span className="text-[10px] font-mono text-[#8C8373] mt-2 pt-2 border-t border-[#DDD3BE]">
                Route: {badge.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency & Railway Control Helpline Hub */}
      <section className="bg-gradient-to-br from-[#1B3629] to-[#12241C] text-white rounded-2xl p-5 border border-[#2D503E] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#294B39] pb-3">
          <PhoneCall className="w-5 h-5 text-[#D4A359]" />
          <div>
            <h3 className="font-serif font-bold text-white text-base">
              Emergency & Official Rail Helplines
            </h3>
            <p className="text-xs text-[#A7C2B3]">
              One-touch direct dialing for railway security, medical dispatch, and tourist police
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="tel:1971"
            className="p-3 rounded-xl bg-[#203D2F] hover:bg-[#274B39] border border-[#335E49] flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#142A20] flex items-center justify-center text-[#D4A359] shrink-0">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#9AB8A8]">SLR Inquiries</div>
              <div className="font-bold text-sm text-white group-hover:text-[#D4A359]">1971</div>
            </div>
          </a>

          <a
            href="tel:1912"
            className="p-3 rounded-xl bg-[#203D2F] hover:bg-[#274B39] border border-[#335E49] flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#142A20] flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#9AB8A8]">Tourist Police</div>
              <div className="font-bold text-sm text-white group-hover:text-[#D4A359]">1912</div>
            </div>
          </a>

          <a
            href="tel:1990"
            className="p-3 rounded-xl bg-[#203D2F] hover:bg-[#274B39] border border-[#335E49] flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#142A20] flex items-center justify-center text-red-400 shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#9AB8A8]">Ambulance (1990)</div>
              <div className="font-bold text-sm text-white group-hover:text-[#D4A359]">1990</div>
            </div>
          </a>

          <a
            href="tel:365"
            className="p-3 rounded-xl bg-[#203D2F] hover:bg-[#274B39] border border-[#335E49] flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#142A20] flex items-center justify-center text-[#FFE2A4] shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#9AB8A8]">Seat Res. Hotline</div>
              <div className="font-bold text-sm text-white group-hover:text-[#D4A359]">1365 / 444</div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};
