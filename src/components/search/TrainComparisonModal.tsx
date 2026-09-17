import React from 'react';
import {
  X,
  ArrowRightLeft,
  Clock,
  MapPin,
  Check,
  Minus,
  Sparkles,
  Zap,
  Coffee,
  Eye,
  Bed,
  Plug,
  ExternalLink,
  Train,
  CheckCircle2,
} from 'lucide-react';
import { TrainSchedule, Language } from '../../types';
import { translations } from '../../data/localization';

interface TrainComparisonModalProps {
  trainA: TrainSchedule;
  trainB: TrainSchedule;
  onClose: () => void;
  onSelectTrain: (train: TrainSchedule) => void;
  onSwap: () => void;
  language: Language;
}

export const TrainComparisonModal: React.FC<TrainComparisonModalProps> = ({
  trainA,
  trainB,
  onClose,
  onSelectTrain,
  onSwap,
  language,
}) => {
  const t = translations[language];

  const durationDiff = trainA.duration_minutes - trainB.duration_minutes;
  const isAFaster = durationDiff < 0;
  const isBFaster = durationDiff > 0;
  const absDiff = Math.abs(durationDiff);

  const renderAmenityRow = (
    label: string,
    icon: React.ReactNode,
    valA: boolean | string | undefined,
    valB: boolean | string | undefined
  ) => {
    return (
      <tr className="border-b border-[#E2D8C6] hover:bg-[#F2ECE1]/50 transition-colors text-xs sm:text-sm">
        <td className="py-2.5 px-3 font-medium text-[#544E45] flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </td>
        <td className="py-2.5 px-3 text-center border-l border-[#E2D8C6]">
          {typeof valA === 'boolean' ? (
            valA ? (
              <span className="inline-flex items-center gap-1 text-[#227249] font-bold">
                <Check className="w-4 h-4 text-[#2E8555]" /> Yes
              </span>
            ) : (
              <span className="text-[#9E9689] font-medium inline-flex items-center gap-1">
                <Minus className="w-4 h-4" /> No
              </span>
            )
          ) : (
            <span className="text-[#201D1A] font-medium">{valA || '—'}</span>
          )}
        </td>
        <td className="py-2.5 px-3 text-center border-l border-[#E2D8C6]">
          {typeof valB === 'boolean' ? (
            valB ? (
              <span className="inline-flex items-center gap-1 text-[#227249] font-bold">
                <Check className="w-4 h-4 text-[#2E8555]" /> Yes
              </span>
            ) : (
              <span className="text-[#9E9689] font-medium inline-flex items-center gap-1">
                <Minus className="w-4 h-4" /> No
              </span>
            )
          ) : (
            <span className="text-[#201D1A] font-medium">{valB || '—'}</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#D8CEBA] max-h-[92vh] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Modal Header */}
        <div className="bg-[#173024] text-[#F4F0EA] p-4 sm:p-5 relative border-b border-[#2A4E3B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#D4A359] text-[#173024] flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                Train Comparison Matrix
              </h2>
              <p className="text-xs text-[#A8BEB1]">
                Side-by-side comparison of amenities, travel times & ticket classes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwap}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D7E4DC] transition-colors flex items-center gap-1 text-xs"
              title="Swap columns"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swap</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#A7BCB0] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">
          {/* Comparison Cards Header Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Train A Card */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border-2 border-[#173024]/40 shadow-xs relative">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#173024] text-[#D4A359] absolute top-3 right-3">
                #{trainA.train_id}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6D675C] tracking-wide block mb-0.5">
                Train Option 1
              </span>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#173024] pr-14 leading-snug">
                {trainA.train_name}
              </h3>
              <div className="text-xs text-[#524E46] mt-1">
                {trainA.origin} ➔ {trainA.destination}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E4DDD0] font-semibold text-[#403C35]">
                  {trainA.train_type}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D9EFE3] text-[#194D31] font-semibold">
                  {trainA.line}
                </span>
              </div>
            </div>

            {/* Train B Card */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border-2 border-[#758A80]/50 shadow-xs relative">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#758A80] text-white absolute top-3 right-3">
                #{trainB.train_id}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6D675C] tracking-wide block mb-0.5">
                Train Option 2
              </span>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#173024] pr-14 leading-snug">
                {trainB.train_name}
              </h3>
              <div className="text-xs text-[#524E46] mt-1">
                {trainB.origin} ➔ {trainB.destination}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E4DDD0] font-semibold text-[#403C35]">
                  {trainB.train_type}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D9EFE3] text-[#194D31] font-semibold">
                  {trainB.line}
                </span>
              </div>
            </div>
          </div>

          {/* Speed & Duration Highlight Callout */}
          {absDiff > 0 && (
            <div className="bg-[#EFE7D8] p-3 rounded-xl border border-[#D5CAA4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4A359]" />
                <span>
                  <strong className="text-[#173024]">
                    {isAFaster ? trainA.train_name : trainB.train_name}
                  </strong>{' '}
                  is <strong className="text-[#227249]">{absDiff} minutes faster</strong> than{' '}
                  {isAFaster ? trainB.train_name : trainA.train_name}.
                </span>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="bg-[#FAF7F2] rounded-xl border border-[#DFD5C2] overflow-hidden shadow-2xs">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EDE5D6] text-xs text-[#544E45] border-b border-[#DFD5C2]">
                  <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider w-1/3">
                    Attribute
                  </th>
                  <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider w-1/3 border-l border-[#DFD5C2]">
                    #{trainA.train_id} {trainA.train_name}
                  </th>
                  <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider w-1/3 border-l border-[#DFD5C2]">
                    #{trainB.train_id} {trainB.train_name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Travel Times */}
                <tr className="bg-[#F5EFE3] border-b border-[#E2D8C6]">
                  <td colSpan={3} className="py-1.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#736B5E]">
                    Travel Time & Route
                  </td>
                </tr>
                {renderAmenityRow('Departure Time', <Clock className="w-3.5 h-3.5 text-[#5B7B6E]" />, trainA.departure_time, trainB.departure_time)}
                {renderAmenityRow('Arrival Time', <Clock className="w-3.5 h-3.5 text-[#5B7B6E]" />, trainA.arrival_time, trainB.arrival_time)}
                {renderAmenityRow(
                  'Total Duration',
                  <Zap className="w-3.5 h-3.5 text-[#C88A35]" />,
                  `${Math.floor(trainA.duration_minutes / 60)}h ${trainA.duration_minutes % 60}m`,
                  `${Math.floor(trainB.duration_minutes / 60)}h ${trainB.duration_minutes % 60}m`
                )}
                {renderAmenityRow('Number of Stops', <MapPin className="w-3.5 h-3.5 text-[#758A80]" />, `${trainA.stops.length} stations`, `${trainB.stops.length} stations`)}
                {renderAmenityRow('Operating Days', <Clock className="w-3.5 h-3.5 text-[#758A80]" />, trainA.operating_days, trainB.operating_days)}

                {/* Amenities Matrix */}
                <tr className="bg-[#F5EFE3] border-b border-[#E2D8C6]">
                  <td colSpan={3} className="py-1.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#736B5E]">
                    Onboard Amenities
                  </td>
                </tr>
                {renderAmenityRow(
                  'Air Conditioning (AC)',
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5B7B6E]" />,
                  trainA.classes.includes('1st AC') || trainA.amenities?.has_ac,
                  trainB.classes.includes('1st AC') || trainB.amenities?.has_ac
                )}
                {renderAmenityRow(
                  'Observation Saloon',
                  <Eye className="w-3.5 h-3.5 text-[#5B7B6E]" />,
                  trainA.classes.includes('1st Observation') || trainA.amenities?.has_observation,
                  trainB.classes.includes('1st Observation') || trainB.amenities?.has_observation
                )}
                {renderAmenityRow(
                  'Sleeper Berths',
                  <Bed className="w-3.5 h-3.5 text-[#5B7B6E]" />,
                  trainA.classes.includes('1st Sleeper') || trainA.amenities?.has_sleeper,
                  trainB.classes.includes('1st Sleeper') || trainB.amenities?.has_sleeper
                )}
                {renderAmenityRow(
                  'Buffet / Snack Service',
                  <Coffee className="w-3.5 h-3.5 text-[#5B7B6E]" />,
                  trainA.amenities?.has_buffet ?? (trainA.train_type === 'ICE' || trainA.train_type === 'Express'),
                  trainB.amenities?.has_buffet ?? (trainB.train_type === 'ICE' || trainB.train_type === 'Express')
                )}
                {renderAmenityRow(
                  'Power / Device Outlets',
                  <Plug className="w-3.5 h-3.5 text-[#5B7B6E]" />,
                  trainA.amenities?.has_charging ?? (trainA.classes.includes('1st AC') || trainA.train_type === 'ICE'),
                  trainB.amenities?.has_charging ?? (trainB.classes.includes('1st AC') || trainB.train_type === 'ICE')
                )}
                {renderAmenityRow(
                  'Scenic Rating',
                  <Sparkles className="w-3.5 h-3.5 text-[#C88A35]" />,
                  '★'.repeat(trainA.scenic_rating || 4) + '☆'.repeat(5 - (trainA.scenic_rating || 4)),
                  '★'.repeat(trainB.scenic_rating || 4) + '☆'.repeat(5 - (trainB.scenic_rating || 4))
                )}

                {/* Ticket Fares */}
                <tr className="bg-[#F5EFE3] border-b border-[#E2D8C6]">
                  <td colSpan={3} className="py-1.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#736B5E]">
                    Ticket Classes & Fares (LKR)
                  </td>
                </tr>
                {renderAmenityRow(
                  '3rd Class Fare',
                  <Train className="w-3.5 h-3.5 text-[#758A80]" />,
                  `${trainA.estimated_fare_lkr.third} LKR`,
                  `${trainB.estimated_fare_lkr.third} LKR`
                )}
                {renderAmenityRow(
                  '2nd Class Fare',
                  <Train className="w-3.5 h-3.5 text-[#758A80]" />,
                  `${trainA.estimated_fare_lkr.second} LKR`,
                  `${trainB.estimated_fare_lkr.second} LKR`
                )}
                {renderAmenityRow(
                  '1st Class (AC / Obs)',
                  <Train className="w-3.5 h-3.5 text-[#D4A359]" />,
                  trainA.estimated_fare_lkr.first_ac
                    ? `${trainA.estimated_fare_lkr.first_ac} LKR`
                    : trainA.estimated_fare_lkr.first_obs
                    ? `${trainA.estimated_fare_lkr.first_obs} LKR`
                    : 'N/A',
                  trainB.estimated_fare_lkr.first_ac
                    ? `${trainB.estimated_fare_lkr.first_ac} LKR`
                    : trainB.estimated_fare_lkr.first_obs
                    ? `${trainB.estimated_fare_lkr.first_obs} LKR`
                    : 'N/A'
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onSelectTrain(trainA);
                onClose();
              }}
              className="w-full bg-[#173024] hover:bg-[#254A36] text-white font-medium py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
            >
              Select #{trainA.train_id} {trainA.train_name}
            </button>
            <button
              onClick={() => {
                onSelectTrain(trainB);
                onClose();
              }}
              className="w-full bg-[#758A80] hover:bg-[#5C756B] text-white font-medium py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
            >
              Select #{trainB.train_id} {trainB.train_name}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center justify-between">
          <a
            href="https://seatreservation.railway.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#173024] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Book officially on Sri Lanka Railways</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-[#DDD4C2] hover:bg-[#CEBEA5] text-[#292622] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
