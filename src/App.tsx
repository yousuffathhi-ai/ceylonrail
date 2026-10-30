import React, { useState, useEffect } from 'react';
import { HeaderCard } from './components/common/HeaderCard';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { HomeView } from './components/home/HomeView';
import { SearchView } from './components/search/SearchView';
import { InteractiveMapView } from './components/map/InteractiveMapView';
import { HistoryView } from './components/history/HistoryView';
import { SavedView } from './components/saved/SavedView';
import { AppsView } from './components/apps/AppsView';
import { TrainDetailModal } from './components/search/TrainDetailModal';
import { FareCalculatorModal } from './components/fare/FareCalculatorModal';
import { GeminiConductorModal } from './components/ai/GeminiConductorModal';
import { TripPlannerModal } from './components/planner/TripPlannerModal';
import { PlatformHelperModal } from './components/platform/PlatformHelperModal';
import { DepartureAlertBanner, ActiveAlertData } from './components/common/DepartureAlertBanner';
import { Language, Station, TrainSchedule, RailwayLine, AppTheme } from './types';
import {
  getBookmarks,
  addRecentSearch,
  getSimulatedDelayState,
  setSimulatedDelayState,
  DelayState,
} from './utils/offlineStorage';
import { TRAIN_SCHEDULES } from './data/timetableData';
import { checkUpcomingSavedDepartures, playStationChime, sendBrowserNotification } from './utils/notifications';
import { getStoredTheme, saveTheme, applyThemeToDOM } from './utils/theme';
import { getTodayDateString } from './utils/calendar';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [travelDate, setTravelDate] = useState<string>(() => getTodayDateString());

  // Search parameters when transitioning from Home / Map
  const [searchFrom, setSearchFrom] = useState<string>('');
  const [searchTo, setSearchTo] = useState<string>('');
  const [searchLine, setSearchLine] = useState<RailwayLine | 'All'>('All');

  // Modals
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [isFareCalcOpen, setIsFareCalcOpen] = useState(false);
  const [isConductorOpen, setIsConductorOpen] = useState(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false);
  const [isPlatformHelperOpen, setIsPlatformHelperOpen] = useState(false);

  // 15-Minute Departure Alert
  const [activeAlert, setActiveAlert] = useState<ActiveAlertData | null>(null);

  // Saved bookmarks counter & delay telemetry
  const [savedCount, setSavedCount] = useState(0);
  const [delayState, setDelayState] = useState<DelayState>('ON_TIME');

  const updateSavedCount = () => {
    setSavedCount(getBookmarks().length);
  };

  // Single-URL SPA Architecture: Guarantee browser URL remains strictly on the base domain
  useEffect(() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  // Dynamic Head Title Management for SEO & View Tracking
  useEffect(() => {
    const titles: Record<NavTab, string> = {
      home: 'Ceylon Rail – Sri Lanka Railways Timetable & Travel Companion',
      search: 'Search Trains & Timetables – Ceylon Rail',
      'route-map': 'Interactive Route Map & Lines – Ceylon Rail',
      map: 'Interactive Route Map & Lines – Ceylon Rail',
      apps: 'Official Railway Apps & Services – Ceylon Rail',
      heritage: 'Legendary Trains & SLR Heritage Archive – Ceylon Rail',
      history: 'Legendary Trains & SLR Heritage Archive – Ceylon Rail',
      saved: 'Saved Schedules & Bookmarks – Ceylon Rail',
    };
    document.title = titles[activeTab] || 'Ceylon Rail – Sri Lanka Railways Timetable & Travel Companion';
  }, [activeTab]);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: AppTheme = theme === 'parchment' ? 'night' : 'parchment';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  useEffect(() => {
    updateSavedCount();
    setDelayState(getSimulatedDelayState());

    // 15-minute departure alert check ticker
    const checkAlerts = () => {
      const upcoming = checkUpcomingSavedDepartures();
      if (upcoming) {
        setActiveAlert({
          trainId: upcoming.journey.train_id,
          trainName: upcoming.journey.train_name,
          origin: upcoming.journey.from_station,
          destination: upcoming.journey.to_station,
          departureTime: upcoming.journey.departure_time,
          minutesRemaining: upcoming.minutesUntil,
          train_id: upcoming.journey.train_id,
          train_name: upcoming.journey.train_name,
          departure_station: upcoming.journey.from_station,
          departure_time: upcoming.journey.departure_time,
          minutes_until: upcoming.minutesUntil,
        });
        playStationChime();
        sendBrowserNotification(
          `Train #${upcoming.journey.train_id} Departs in ${upcoming.minutesUntil}m`,
          `${upcoming.journey.train_name} departs from ${upcoming.journey.from_station} at ${upcoming.journey.departure_time}.`
        );
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleDelay = () => {
    const nextState: DelayState = delayState === 'ON_TIME' ? 'MINOR_DELAY' : 'ON_TIME';
    setDelayState(nextState);
    setSimulatedDelayState(nextState);
  };

  const handleSearchTrains = (from: string, to: string, date: string) => {
    setSearchFrom(from);
    setSearchTo(to);
    setTravelDate(date);
    setSearchLine('All');
    addRecentSearch(from, to, date);
    setActiveTab('search');
  };

  const handleExploreLine = (line: string) => {
    setSearchLine(line as RailwayLine);
    setSearchFrom('');
    setSearchTo('');
    setActiveTab('search');
  };

  const handleSelectStationFromMap = (station: Station) => {
    setSearchFrom(station.name_en);
    setSearchTo('');
    setSearchLine('All');
    setActiveTab('search');
  };

  const handleExploreTrainByName = (name: string) => {
    const matched = TRAIN_SCHEDULES.find((tr) => tr.train_name.toLowerCase().includes(name.toLowerCase()));
    if (matched) {
      setSelectedTrain(matched);
    } else {
      setSearchFrom('');
      setSearchTo('');
      setActiveTab('search');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1F2923] flex flex-col font-sans selection:bg-[#758A80] selection:text-white">
      {/* Top Header Card with SLR Crest & Live Status */}
      <HeaderCard
        language={language}
        onLanguageChange={setLanguage}
        onOpenConductor={() => setIsConductorOpen(true)}
        onOpenFareCalc={() => setIsFareCalcOpen(true)}
        onOpenPlanner={() => setIsTripPlannerOpen(true)}
        onOpenPlatformHelper={() => setIsPlatformHelperOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        delayState={delayState}
        onToggleDelay={handleToggleDelay}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedCount}
      />

      {/* 15-Minute Local Departure Alert Banner */}
      {activeAlert && (
        <DepartureAlertBanner
          alert={activeAlert}
          onDismiss={() => setActiveAlert(null)}
          onViewTrain={(trainId) => {
            const tr = TRAIN_SCHEDULES.find((s) => s.train_id === trainId);
            if (tr) setSelectedTrain(tr);
            setActiveAlert(null);
          }}
        />
      )}

      {/* Main View Container with Responsive Desktop Width */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <div key="home" className="animate-fadeIn">
            <HomeView
              language={language}
              onSearchTrains={handleSearchTrains}
              onSelectTrain={(train) => setSelectedTrain(train)}
              onExploreLine={handleExploreLine}
              onOpenFareCalc={() => setIsFareCalcOpen(true)}
              onOpenConductor={() => setIsConductorOpen(true)}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div key="search" className="animate-fadeIn">
            <SearchView
              language={language}
              initialFrom={searchFrom}
              initialTo={searchTo}
              initialLine={searchLine}
              travelDate={travelDate}
              onSelectTrain={(train) => setSelectedTrain(train)}
              onBookmarkChanged={updateSavedCount}
            />
          </div>
        )}

        {(activeTab === 'route-map' || activeTab === 'map') && (
          <div key="route-map" className="animate-fadeIn">
            <InteractiveMapView
              language={language}
              onSelectStation={handleSelectStationFromMap}
              onSelectTrain={(train) => setSelectedTrain(train)}
            />
          </div>
        )}

        {activeTab === 'apps' && (
          <div key="apps" className="animate-fadeIn">
            <AppsView
              language={language}
              onOpenPlanner={() => setIsTripPlannerOpen(true)}
              onOpenFareCalc={() => setIsFareCalcOpen(true)}
              onOpenConductor={() => setIsConductorOpen(true)}
              onOpenPlatformHelper={() => setIsPlatformHelperOpen(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {(activeTab === 'heritage' || activeTab === 'history') && (
          <div key="heritage" className="animate-fadeIn">
            <HistoryView
              language={language}
              onExploreTrain={handleExploreTrainByName}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div key="saved" className="animate-fadeIn">
            <SavedView
              language={language}
              onSelectTrain={(train) => setSelectedTrain(train)}
              onRerunSearch={(from, to, date) => handleSearchTrains(from, to, date)}
              onBookmarkChanged={updateSavedCount}
            />
          </div>
        )}
      </main>

      {/* Train Detail Modal with Stops Timeline & Calendar Sync */}
      {selectedTrain && (
        <TrainDetailModal
          train={selectedTrain}
          onClose={() => setSelectedTrain(null)}
          language={language}
          travelDate={travelDate}
          delayState={delayState}
          onBookmarkChanged={updateSavedCount}
        />
      )}

      {/* Official Fare Calculator Modal */}
      {isFareCalcOpen && (
        <FareCalculatorModal
          onClose={() => setIsFareCalcOpen(false)}
          language={language}
        />
      )}

      {/* Multi-Stop Itinerary Planner Modal */}
      {isTripPlannerOpen && (
        <TripPlannerModal
          onClose={() => setIsTripPlannerOpen(false)}
          language={language}
          onSelectTrain={(train) => {
            setIsTripPlannerOpen(false);
            setSelectedTrain(train);
          }}
          onSearchSegment={(from, to) => {
            setIsTripPlannerOpen(false);
            handleSearchTrains(from, to, travelDate);
          }}
        />
      )}

      {/* Gemini AI Conductor Travel Guide Modal */}
      {isConductorOpen && (
        <GeminiConductorModal
          onClose={() => setIsConductorOpen(false)}
          language={language}
          onSelectRoute={(from, to) => handleSearchTrains(from, to, travelDate)}
        />
      )}

      {/* Platform Walking Helper & Station Navigation Modal */}
      {isPlatformHelperOpen && (
        <PlatformHelperModal
          onClose={() => setIsPlatformHelperOpen(false)}
          language={language}
          initialStationCode="FOT"
        />
      )}

      {/* Modern Responsive Solid Footer */}
      <footer className="w-full bg-[#173024] text-[#C5D1CA] border-t border-[#2A4B3A] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#244233]">
            {/* Branding & Mission */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#12241C] border border-[#D4A359]/70 flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="Ceylon Rail" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Ceylon Rail</h3>
                  <p className="text-[11px] text-[#A7C2B3]">Sri Lanka Railways Commuter Companion & Heritage Archive</p>
                </div>
              </div>
              <p className="text-xs text-[#9BB5A7] max-w-md leading-relaxed">
                Empowering travelers and commuters across Sri Lanka with offline timetables, real distance fare matrices, elevation telemetry, and route maps since British Ceylon 1864.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#D4A359]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Offline SQLite Timetable Cached & Verified</span>
              </div>
            </div>

            {/* Quick Rail Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">
                Rail Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors cursor-pointer">Home Overview</button></li>
                <li><button onClick={() => setActiveTab('search')} className="hover:text-white transition-colors cursor-pointer">Find Trains & Schedules</button></li>
                <li><button onClick={() => setActiveTab('route-map')} className="hover:text-white transition-colors cursor-pointer">Interactive Route Map</button></li>
                <li><button onClick={() => setActiveTab('heritage')} className="hover:text-white transition-colors cursor-pointer">Legendary Trains & History</button></li>
                <li><button onClick={() => setActiveTab('saved')} className="hover:text-white transition-colors cursor-pointer">Saved Bookmarks ({savedCount})</button></li>
              </ul>
            </div>

            {/* Emergency & Official Helplines */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">
                Emergency & Assistance
              </h4>
              <ul className="space-y-2 text-xs text-[#CBD8D1]">
                <li className="flex items-center justify-between">
                  <span>Railway Control:</span>
                  <a href="tel:1971" className="font-mono font-bold text-[#D4A359] hover:underline">1971</a>
                </li>
                <li className="flex items-center justify-between">
                  <span>Tourist Police:</span>
                  <a href="tel:1912" className="font-mono font-bold text-[#D4A359] hover:underline">1912</a>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suwa Seriya Ambulance:</span>
                  <a href="tel:1990" className="font-mono font-bold text-[#D4A359] hover:underline">1990</a>
                </li>
                <li className="flex items-center justify-between">
                  <span>Police Emergency:</span>
                  <a href="tel:119" className="font-mono font-bold text-[#D4A359] hover:underline">119</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7A9988]">
            <p>© {new Date().getFullYear()} Ceylon Rail. Sri Lanka Railways unofficial commuter guide & travel companion.</p>
            <div className="flex items-center gap-4">
              <span>PWA Offline Ready</span>
              <span>•</span>
              <span>No-Tracking Privacy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Bottom Navigation (Mobile screens only, solid styling) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
        savedCount={savedCount}
      />
    </div>
  );
}
