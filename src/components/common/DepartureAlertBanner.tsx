import React from 'react';
import { Bell, Volume2, X, Train, Clock, ArrowRight } from 'lucide-react';
import { playStationChime } from '../../utils/notifications';

export interface ActiveAlertData {
  trainName: string;
  trainId: string;
  origin: string;
  destination: string;
  departureTime: string;
  minutesRemaining: number;
}

interface DepartureAlertBannerProps {
  alert: ActiveAlertData | null;
  onDismiss: () => void;
  onViewTrain?: (trainId: string) => void;
}

export const DepartureAlertBanner: React.FC<DepartureAlertBannerProps> = ({
  alert,
  onDismiss,
  onViewTrain,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounceIn shadow-2xl">
      <div className="bg-[#173024] text-[#F4F0EA] rounded-2xl p-4 border-2 border-[#D4A359] relative">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-[#A8BEB1] hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A359] text-[#173024] flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E7C286] uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>15-Minute Departure Alert</span>
            </div>

            <h4 className="font-serif font-bold text-sm sm:text-base text-white mt-0.5">
              {alert.trainName} (#{alert.trainId})
            </h4>

            <p className="text-xs text-[#C6D8CE] mt-0.5">
              Departs from <strong className="text-white">{alert.origin}</strong> at{' '}
              <strong className="text-[#D4A359] font-mono">{alert.departureTime}</strong> ({alert.minutesRemaining} min remaining).
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  playStationChime();
                }}
                className="flex items-center gap-1 text-[11px] bg-[#2A4C3A] hover:bg-[#38654D] text-[#E0EFE8] px-2.5 py-1.5 rounded-lg border border-[#44765B] transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Station Chime</span>
              </button>

              {onViewTrain && (
                <button
                  onClick={() => onViewTrain(alert.trainId)}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-[#D4A359] hover:bg-[#C09248] text-[#173024] px-3 py-1.5 rounded-lg transition-colors ml-auto shadow-xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
