import React, { useState, useEffect } from 'react';
import { HeaderCard } from './components/common/HeaderCard';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { HomeView } from './components/home/HomeView';
import { SearchView } from './components/search/SearchView';
import { InteractiveMapView } from './components/map/InteractiveMapView';
import { HistoryView } from './components/history/HistoryView';
import { SavedView } from './components/saved/SavedView';
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

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [travelDate, setTravelDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

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
    setCurrentTab('search');
  };

  const handleExploreLine = (line: string) => {
    setSearchLine(line as RailwayLine);
    setSearchFrom('');
    setSearchTo('');
    setCurrentTab('search');
  };

  const handleSelectStationFromMap = (station: Station) => {
    setSearchFrom(station.name_en);
    setSearchTo('');
    setSearchLine('All');
    setCurrentTab('search');
  };

  const handleExploreTrainByName = (name: string) => {
    const matched = TRAIN_SCHEDULES.find((tr) => tr.train_name.toLowerCase().includes(name.toLowerCase()));
    if (matched) {
      setSelectedTrain(matched);
    } else {
      setSearchFrom('');
      setSearchTo('');
      setCurrentTab('search');
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

      {/* Main View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4">
        {currentTab === 'home' && (
          <HomeView
            language={language}
            onSearchTrains={handleSearchTrains}
            onSelectTrain={(train) => setSelectedTrain(train)}
            onExploreLine={handleExploreLine}
            onOpenFareCalc={() => setIsFareCalcOpen(true)}
            onOpenConductor={() => setIsConductorOpen(true)}
          />
        )}

        {currentTab === 'search' && (
          <SearchView
            language={language}
            initialFrom={searchFrom}
            initialTo={searchTo}
            initialLine={searchLine}
            travelDate={travelDate}
            onSelectTrain={(train) => setSelectedTrain(train)}
            onBookmarkChanged={updateSavedCount}
          />
        )}

        {currentTab === 'map' && (
          <InteractiveMapView
            language={language}
            onSelectStation={handleSelectStationFromMap}
            onSelectTrain={(train) => setSelectedTrain(train)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            language={language}
            onExploreTrain={handleExploreTrainByName}
          />
        )}

        {currentTab === 'saved' && (
          <SavedView
            language={language}
            onSelectTrain={(train) => setSelectedTrain(train)}
            onRerunSearch={(from, to, date) => handleSearchTrains(from, to, date)}
            onBookmarkChanged={updateSavedCount}
          />
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

      {/* Fixed Bottom Navigation (Mobile-first 5 tabs) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        savedCount={savedCount}
      />
    </div>
  );
}
