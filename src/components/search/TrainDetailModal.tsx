import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Check,
  Compass,
  CheckCircle2,
  FileDown,
  ListTodo,
} from 'lucide-react';
import { TrainSchedule, Language, SeatClass } from '../../types';
import { translations } from '../../data/localization';
import {
  generateGoogleCalendarUrl,
  downloadIcsFile,
  generateGoogleTasksUrl,
} from '../../utils/calendar';
import { toggleBookmark, isBookmarked, DelayState } from '../../utils/offlineStorage';
import { WeatherWidget } from '../common/WeatherWidget';
import { CoachArrangementVisualizer } from './CoachArrangementVisualizer';
import { RouteLineMapVisualizer } from './RouteLineMapVisualizer';

interface TrainDetailModalProps {
  train: TrainSchedule | null;
  onClose: () => void;
  language: Language;
  travelDate: string;
  delayState: DelayState;
  onBookmarkChanged?: () => void;
}

export const TrainDetailModal: React.FC<TrainDetailModalProps> = ({
  train,
  onClose,
  language,
  travelDate,
  delayState,
  onBookmarkChanged,
}) => {
  if (!train) return null;

  const t = translations[language];
  const [selectedClass, setSelectedClass] = useState<SeatClass>(train.classes[0]);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [icsDownloaded, setIcsDownloaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(train.train_id));

  const handleToggleBookmark = () => {
    const newState = toggleBookmark({
      train_id: train.train_id,
      train_name: train.train_name,
      from_station: train.origin,
      to_station: train.destination,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      date: travelDate,
      line: train.line,
    });
    setBookmarked(newState);
    if (onBookmarkChanged) onBookmarkChanged();
  };

  const handleSyncGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(train, travelDate, selectedClass);
    window.open(url, '_blank', 'noopener,noreferrer');
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 4000);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile(train, travelDate, selectedClass);
    setIcsDownloaded(true);
    setTimeout(() => setIcsDownloaded(false), 4000);
  };

  const handleGoogleTasks = () => {
    const url = generateGoogleTasksUrl(train, travelDate);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Delay adjustment
  const delayMinutes = delayState === 'MINOR_DELAY' ? 10 : delayState === 'MIST_ALERT' ? 15 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E0D7C6] max-h-[92vh] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Modal Header Card */}
        <div className="bg-[#173024] text-[#F4F0EA] p-4 sm:p-5 relative border-b border-[#2B4E3C]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#A7BCB0] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4A359]/20 text-[#E7C286] border border-[#D4A359]/30">
              No. {train.train_id}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#758A80]/30 text-[#BDDDD0]">
              {train.train_type}
            </span>
            <span className="text-[11px] font-medium text-[#A7BCB0]">
              {train.line}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {train.train_name}
          </h2>

          <div className="flex items-center justify-between mt-3 text-xs sm:text-sm text-[#D7E4DC]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
              <span className="font-semibold">{train.origin}</span>
              <span className="text-[#8FA599]">➔</span>
              <span className="font-semibold">{train.destination}</span>
            </div>
            <div className="flex items-center gap-1 text-[#C0D3C9]">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.floor(train.duration_minutes / 60)}h {train.duration_minutes % 60}m</span>
            </div>
          </div>

          {/* Real-time Telemetry Status */}
          <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#264535]">
            <div className="flex items-center gap-1.5">
              {delayMinutes > 0 ? (
                <span className="flex items-center gap-1 text-[#FDBA74] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#FB923C]" />
                  Simulated Delay: +{delayMinutes}m
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#86EFAC] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                  Status: Running On-Time
                </span>
              )}
            </div>
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                bookmarked
                  ? 'bg-[#D4A359] text-[#12241C] border-[#D4A359]'
                  : 'bg-[#234534] text-[#E0EBE4] border-[#38664D] hover:bg-[#2C5641]'
              }`}
            >
              {bookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Scenic Tips Banner */}
          {train.scenic_highlight && (
            <div className="bg-[#EAE4D7] border-l-4 border-[#C88A35] p-3 rounded-r-xl text-xs sm:text-sm text-[#2D2A26] flex items-start gap-2.5 shadow-2xs">
              <Compass className="w-4 h-4 text-[#C88A35] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#8C5819] block mb-0.5">
                  {t.scenicWindowTip}
                </span>
                <p className="leading-relaxed">{train.scenic_highlight}</p>
              </div>
            </div>
          )}

          {/* Real-time Destination Weather Widget */}
          <WeatherWidget stationName={train.destination} />

          {/* Seat Classes & Fare Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5751] mb-2">
              {t.classesAvailable} & Fares
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {train.classes.map((cls) => {
                let fare = train.estimated_fare_lkr.second;
                if (cls === '3rd Class') fare = train.estimated_fare_lkr.third;
                if (cls === '1st AC') fare = train.estimated_fare_lkr.first_ac || 3200;
                if (cls === '1st Observation') fare = train.estimated_fare_lkr.first_obs || 4500;
                if (cls === '1st Sleeper') fare = train.estimated_fare_lkr.first_sleep || 4000;

                const isSelected = selectedClass === cls;

                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#173024] text-white border-[#173024] shadow-sm'
                        : 'bg-[#F2ECE1] text-[#2C2925] border-[#D9D0BE] hover:bg-[#EAE2D2]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{cls}</div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-[#D4A359]' : 'text-[#758A80] font-medium'}`}>
                      ~{fare} LKR
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coach Arrangement & Rake Layout Visualizer */}
          <CoachArrangementVisualizer
            train={train}
            selectedClass={selectedClass}
            onSelectClass={(cls) => setSelectedClass(cls)}
          />

          {/* Calendar & Tasks Synchronization Card */}
          <div className="bg-[#ECE7DC] rounded-xl p-3.5 border border-[#D5CCB8] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3B3833] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5B7B6E]" />
                Departure Alerts & Calendar Sync
              </span>
              <span className="text-[11px] text-[#69655E] font-medium">Date: {travelDate}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleSyncGoogleCalendar}
                className="flex items-center justify-center gap-1.5 bg-[#5B7B6E] hover:bg-[#4E6B5F] text-white text-xs font-medium py-2 px-3 rounded-lg shadow-xs transition-colors"
                title="Add directly to your Google Calendar"
              >
                {calendarAdded ? <Check className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>{calendarAdded ? 'Opening Calendar...' : 'Google Calendar'}</span>
              </button>

              <button
                onClick={handleDownloadIcs}
                className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border transition-colors ${
                  icsDownloaded
                    ? 'bg-[#2F7E4E] text-white border-[#2F7E4E]'
                    : 'bg-[#DDD5C5] hover:bg-[#D0C7B4] text-[#262421] border-[#C2B79F]'
                }`}
                title="Download .ICS for Apple Calendar, Outlook & mobile calendars"
              >
                {icsDownloaded ? <Check className="w-3.5 h-3.5" /> : <FileDown className="w-3.5 h-3.5 text-[#635F57]" />}
                <span>{icsDownloaded ? 'Downloaded (.ICS)' : 'Export .ICS'}</span>
              </button>

              <button
                onClick={handleGoogleTasks}
                className="flex items-center justify-center gap-1.5 bg-[#DDD5C5] hover:bg-[#D0C7B4] text-[#262421] text-xs font-medium py-2 px-3 rounded-lg border border-[#C2B79F] transition-colors"
                title="Add boarding reminder to Google Tasks"
              >
                <ListTodo className="w-3.5 h-3.5 text-[#635F57]" />
                <span>Google Tasks</span>
              </button>
            </div>
          </div>

          {/* Stylized Route Line Map Visualizer */}
          <RouteLineMapVisualizer train={train} />

          {/* Route & Timeline Stops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5751]">
                {t.viewStops} ({train.stops.length} Stations)
              </h3>
              <span className="text-[11px] text-[#7A756D]">
                Total Distance: {train.stops[train.stops.length - 1]?.distance_km || 0} km
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C8C0AF]">
              {train.stops.map((stop, idx) => {
                const isOrigin = idx === 0;
                const isFinal = idx === train.stops.length - 1;

                return (
                  <div key={stop.sequence} className="relative flex items-center justify-between text-xs sm:text-sm">
                    {/* Node Dot */}
                    <span
                      className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 ${
                        isOrigin || isFinal
                          ? 'bg-[#173024] border-[#D4A359]'
                          : 'bg-[#FAF7F2] border-[#758A80]'
                      }`}
                    />

                    <div>
                      <div className="font-medium text-[#1F2923]">
                        {stop.station_name}
                      </div>
                      <div className="text-[11px] text-[#7A756D]">
                        {stop.distance_km} km
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      {isOrigin ? (
                        <span className="text-[#173024] font-bold">Dep {stop.departure_time}</span>
                      ) : isFinal ? (
                        <span className="text-[#173024] font-bold">Arr {stop.arrival_time}</span>
                      ) : (
                        <span className="text-[#4E4B45]">
                          {stop.arrival_time} - {stop.departure_time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center justify-between gap-3">
          <a
            href="https://seatreservation.railway.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#173024] hover:bg-[#204031] text-white font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
          >
            <span>{t.bookTickets}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#DCD4C3] hover:bg-[#CEC3B0] text-[#3A3731] transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
