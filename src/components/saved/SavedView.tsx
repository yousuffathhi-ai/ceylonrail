import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Calendar,
  Trash2,
  Train,
  ArrowRight,
  Check,
  Clock,
  HardDrive,
  ExternalLink,
  History,
  ListTodo,
  Bell,
  BellRing,
  Volume2,
} from 'lucide-react';
import { Language, SavedJourney, TrainSchedule } from '../../types';
import { translations } from '../../data/localization';
import {
  getBookmarks,
  toggleBookmark,
  getRecentSearches,
  clearRecentSearches,
  RecentSearchItem,
} from '../../utils/offlineStorage';
import { TRAIN_SCHEDULES } from '../../data/timetableData';
import { generateGoogleCalendarUrl, generateGoogleTasksUrl } from '../../utils/calendar';
import {
  isAlertEnabled,
  setAlertEnabled,
  playStationChime,
  requestNotificationPermission,
  sendBrowserNotification,
} from '../../utils/notifications';

interface SavedViewProps {
  language: Language;
  onSelectTrain: (train: TrainSchedule) => void;
  onRerunSearch: (from: string, to: string, date: string) => void;
  onBookmarkChanged: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  language,
  onSelectTrain,
  onRerunSearch,
  onBookmarkChanged,
}) => {
  const t = translations[language];

  const [bookmarks, setBookmarks] = useState<SavedJourney[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [syncedId, setSyncedId] = useState<string | null>(null);
  const [alertStates, setAlertStates] = useState<Record<string, boolean>>({});
  const [testedAlertId, setTestedAlertId] = useState<string | null>(null);

  const refreshData = () => {
    const bms = getBookmarks();
    setBookmarks(bms);
    setRecentSearches(getRecentSearches());
    const states: Record<string, boolean> = {};
    bms.forEach((b) => {
      states[b.id] = isAlertEnabled(b.id);
    });
    setAlertStates(states);
  };

  const handleToggleAlert = async (journey: SavedJourney) => {
    const nextState = !alertStates[journey.id];
    if (nextState) {
      await requestNotificationPermission();
    }
    setAlertEnabled(journey.id, nextState);
    setAlertStates((prev) => ({ ...prev, [journey.id]: nextState }));
  };

  const handleTestAlert = (journey: SavedJourney) => {
    playStationChime();
    sendBrowserNotification(
      `15m Departure Alert: ${journey.train_name}`,
      `Train #${journey.train_id} departs from ${journey.from_station} at ${journey.departure_time}. Head to platform!`
    );
    setTestedAlertId(journey.id);
    setTimeout(() => setTestedAlertId(null), 3000);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRemoveBookmark = (journey: SavedJourney) => {
    toggleBookmark({
      train_id: journey.train_id,
      train_name: journey.train_name,
      from_station: journey.from_station,
      to_station: journey.to_station,
      departure_time: journey.departure_time,
      arrival_time: journey.arrival_time,
      date: journey.date,
      line: journey.line,
    });
    refreshData();
    onBookmarkChanged();
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleCalendarSync = (journey: SavedJourney) => {
    const matchedTrain = TRAIN_SCHEDULES.find((tr) => tr.train_id === journey.train_id);
    if (!matchedTrain) return;

    const url = generateGoogleCalendarUrl(matchedTrain, journey.date || new Date().toISOString().split('T')[0]);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSyncedId(journey.id);
    setTimeout(() => setSyncedId(null), 3000);
  };

  const handleTasksSync = (journey: SavedJourney) => {
    const matchedTrain = TRAIN_SCHEDULES.find((tr) => tr.train_id === journey.train_id);
    if (!matchedTrain) return;

    const url = generateGoogleTasksUrl(matchedTrain, journey.date || new Date().toISOString().split('T')[0]);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Offline Database Status Header Card */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173024] text-[#D4A359] flex items-center justify-center shrink-0 shadow-2xs">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#173024]">
                {t.offlineStatus}
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
            </div>
            <p className="text-xs text-[#7A7468]">
              All 6 major railway lines and schedules cached locally.
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[11px] font-mono text-[#5B7B6E] bg-[#EAE3D5] px-2.5 py-1 rounded-full border border-[#D5CAA4]">
            SQLite Web-Store
          </span>
        </div>
      </section>

      {/* Bookmarked Trains */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#173024] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#D4A359]" />
            <span>{t.bookmarkedTrains} ({bookmarks.length})</span>
          </h3>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-2xl p-6 text-center border border-[#DFD5C2] text-[#7A7468] text-xs">
            {t.noSavedYet}
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookmarks.map((journey) => {
              const matchedTrain = TRAIN_SCHEDULES.find((tr) => tr.train_id === journey.train_id);
              const isSynced = syncedId === journey.id;

              return (
                <div
                  key={journey.id}
                  className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#DFD5C2] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#758A80] transition-colors"
                >
                  <div
                    onClick={() => matchedTrain && onSelectTrain(matchedTrain)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#173024] text-[#D4A359]">
                        #{journey.train_id}
                      </span>
                      <h4 className="font-bold text-sm text-[#1F2923]">
                        {journey.train_name}
                      </h4>
                      <span className="text-[10px] text-[#7A7468]">
                        {journey.line}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#524E48]">
                      <span>{journey.from_station} ({journey.departure_time})</span>
                      <span className="text-[#968E80]">➔</span>
                      <span>{journey.to_station} ({journey.arrival_time})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                    {/* 15m Departure Alert Toggle */}
                    <button
                      onClick={() => handleToggleAlert(journey)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        alertStates[journey.id]
                          ? 'bg-[#173024] text-[#D4A359] shadow-2xs'
                          : 'bg-[#EFE9DD] hover:bg-[#D5CCBA] text-[#635E55]'
                      }`}
                      title={alertStates[journey.id] ? '15-min Departure Alert is active' : 'Enable 15-min Departure Alert'}
                    >
                      {alertStates[journey.id] ? (
                        <BellRing className="w-3.5 h-3.5 text-[#D4A359]" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {alertStates[journey.id] ? '15m Alert ON' : '15m Alert'}
                      </span>
                    </button>

                    {/* Test Chime */}
                    <button
                      onClick={() => handleTestAlert(journey)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        testedAlertId === journey.id
                          ? 'bg-[#2E8555] text-white'
                          : 'bg-[#EFE9DD] hover:bg-[#D5CCBA] text-[#544E43]'
                      }`}
                      title="Test 15-minute departure chime sound"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCalendarSync(journey)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B7B6E] hover:bg-[#4E6B5F] text-white text-xs font-medium transition-colors"
                      title={t.addToCalendar}
                    >
                      {isSynced ? <Check className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      <span>{isSynced ? 'Synced' : 'Calendar'}</span>
                    </button>

                    <button
                      onClick={() => handleTasksSync(journey)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#D5CCBA] text-[#423E37] text-xs font-medium transition-colors"
                      title={t.addToTasks}
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>Task</span>
                    </button>

                    <button
                      onClick={() => handleRemoveBookmark(journey)}
                      className="p-1.5 rounded-lg text-[#8C4A4A] hover:bg-[#F2DCDC] transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Searches */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#173024] flex items-center gap-2">
            <History className="w-4 h-4 text-[#758A80]" />
            <span>{t.recentSearches}</span>
          </h3>

          {recentSearches.length > 0 && (
            <button
              onClick={handleClearRecent}
              className="text-[11px] text-[#8C4A4A] hover:underline"
            >
              Clear History
            </button>
          )}
        </div>

        {recentSearches.length === 0 ? (
          <p className="text-xs text-[#7A7468]">No recent train searches.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item.id}
                onClick={() => onRerunSearch(item.from, item.to, item.date)}
                className="flex items-center gap-1.5 bg-[#F0EAE0] hover:bg-[#E2D8C7] text-[#2D2A24] px-3 py-1.5 rounded-xl text-xs font-medium border border-[#D5CAA4] transition-colors group"
              >
                <span>{item.from} ➔ {item.to}</span>
                <ArrowRight className="w-3 h-3 text-[#758A80] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
