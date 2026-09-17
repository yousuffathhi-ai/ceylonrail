import React, { useState } from 'react';
import {
  X,
  Calculator,
  ShieldCheck,
  Luggage,
  ExternalLink,
  ArrowRightLeft,
  PhoneCall,
  Users,
  Info,
} from 'lucide-react';
import { Language, Station } from '../../types';
import { translations } from '../../data/localization';
import { STATIONS } from '../../data/timetableData';
import { PredictiveStationInput } from '../common/PredictiveStationInput';

interface FareCalculatorModalProps {
  onClose: () => void;
  language: Language;
}

export const FareCalculatorModal: React.FC<FareCalculatorModalProps> = ({
  onClose,
  language,
}) => {
  const t = translations[language];
  const [fromQuery, setFromQuery] = useState('Colombo Fort');
  const [toQuery, setToQuery] = useState('Kandy');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);

  const fromStation = STATIONS.find(
    (s) => s.name_en.toLowerCase() === fromQuery.toLowerCase() || s.code.toLowerCase() === fromQuery.toLowerCase()
  ) || STATIONS[0];

  const toStation = STATIONS.find(
    (s) => s.name_en.toLowerCase() === toQuery.toLowerCase() || s.code.toLowerCase() === toQuery.toLowerCase()
  ) || STATIONS[9];

  // Calculate accurate rail distance
  const getRailDistance = () => {
    if (fromStation.line === toStation.line && fromStation.distance_from_fort_km !== undefined && toStation.distance_from_fort_km !== undefined) {
      return Math.abs(toStation.distance_from_fort_km - fromStation.distance_from_fort_km);
    }
    // Cross-line via Colombo Fort
    if (fromStation.distance_from_fort_km !== undefined && toStation.distance_from_fort_km !== undefined) {
      return fromStation.distance_from_fort_km + toStation.distance_from_fort_km;
    }
    return 120;
  };

  const calculatedDist = Math.max(10, Math.round(getRailDistance()));
  const [distanceKm, setDistanceKm] = useState<number>(calculatedDist);

  const handleSwap = () => {
    const prevFrom = fromQuery;
    setFromQuery(toQuery);
    setToQuery(prevFrom);
  };

  // Official Sri Lanka Railways Fare Formula (per gazette slabs)
  const calculateFares = (km: number) => {
    let third = 150;
    let second = 300;
    let firstAC = 600;
    let firstObs = 1200;
    let firstSleeper = 1500;

    if (km <= 50) {
      third = Math.round(km * 3.5 + 40);
      second = Math.round(km * 7.0 + 80);
      firstAC = Math.round(km * 14.0 + 150);
      firstObs = Math.round(km * 18.0 + 200);
      firstSleeper = 1200;
    } else if (km <= 120) {
      third = Math.round(300 + (km - 50) * 3.2);
      second = Math.round(650 + (km - 50) * 6.5);
      firstAC = Math.round(1400 + (km - 50) * 12.0);
      firstObs = Math.round(1800 + (km - 50) * 15.0);
      firstSleeper = 2200;
    } else if (km <= 250) {
      third = Math.round(600 + (km - 120) * 2.8);
      second = Math.round(1200 + (km - 120) * 5.8);
      firstAC = Math.round(2400 + (km - 120) * 11.0);
      firstObs = Math.round(3000 + (km - 120) * 13.5);
      firstSleeper = Math.round(2600 + (km - 120) * 10.0);
    } else {
      third = Math.round(950 + (km - 250) * 2.5);
      second = Math.round(1950 + (km - 250) * 5.0);
      firstAC = Math.round(3800 + (km - 250) * 9.0);
      firstObs = Math.round(4700 + (km - 250) * 10.0);
      firstSleeper = Math.round(4000 + (km - 250) * 8.0);
    }

    // Round to nearest 50 LKR
    const r50 = (n: number) => Math.round(n / 50) * 50;
    const multiplier = adults + children * 0.5;

    return {
      third: r50(third * multiplier),
      second: r50(second * multiplier),
      firstAC: r50(firstAC * (adults + children)), // 1st class full fare
      firstObs: r50(firstObs * (adults + children)),
      firstSleeper: r50(firstSleeper * (adults + children)),
    };
  };

  const fares = calculateFares(distanceKm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#DFD6C4] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Header */}
        <div className="bg-[#173024] text-[#F4F0EA] p-4 sm:p-5 flex items-center justify-between border-b border-[#2A4C3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#244A38] border border-[#3E6B52] flex items-center justify-center text-[#D4A359]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                {t.fareCalculator}
              </h2>
              <p className="text-xs text-[#A7BCB0]">
                Official Sri Lanka Railways Gazette Distance Tiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A7BCB0] hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Station Selector Card */}
          <div className="bg-[#EFE9DC] p-3.5 rounded-xl border border-[#D8CEBA] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-center">
              <div className="bg-[#FAF7F0] p-2 rounded-xl border border-[#C5BBA7] focus-within:border-[#758A80]">
                <PredictiveStationInput
                  label={t.from}
                  value={fromQuery}
                  onChange={(val) => {
                    setFromQuery(val);
                  }}
                  onSelectStation={(st) => {
                    setFromQuery(st.name_en);
                    // auto calculate new distance
                    if (toStation && st.distance_from_fort_km !== undefined && toStation.distance_from_fort_km !== undefined) {
                      const d = st.line === toStation.line
                        ? Math.abs(toStation.distance_from_fort_km - st.distance_from_fort_km)
                        : st.distance_from_fort_km + toStation.distance_from_fort_km;
                      setDistanceKm(Math.max(10, Math.round(d)));
                    }
                  }}
                  placeholder="e.g. Colombo Fort..."
                  language={language}
                />
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="w-8 h-8 rounded-full bg-[#758A80] text-white flex items-center justify-center shadow-md hover:bg-[#5C756B] self-center justify-self-center transition-transform active:scale-90"
                title="Swap stations"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              <div className="bg-[#FAF7F0] p-2 rounded-xl border border-[#C5BBA7] focus-within:border-[#758A80]">
                <PredictiveStationInput
                  label={t.to}
                  value={toQuery}
                  onChange={(val) => {
                    setToQuery(val);
                  }}
                  onSelectStation={(st) => {
                    setToQuery(st.name_en);
                    if (fromStation && st.distance_from_fort_km !== undefined && fromStation.distance_from_fort_km !== undefined) {
                      const d = st.line === fromStation.line
                        ? Math.abs(st.distance_from_fort_km - fromStation.distance_from_fort_km)
                        : fromStation.distance_from_fort_km + st.distance_from_fort_km;
                      setDistanceKm(Math.max(10, Math.round(d)));
                    }
                  }}
                  placeholder="e.g. Kandy, Ella, Galle..."
                  language={language}
                />
              </div>
            </div>

            {/* Passenger Count Selector */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DFD5C2]">
              <div className="flex items-center justify-between bg-[#FAF7F0] px-3 py-1.5 rounded-lg border border-[#D5CAA4]">
                <span className="text-xs font-semibold text-[#524E48] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#758A80]" />
                  Adults
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    className="w-5 h-5 rounded bg-[#E8DFC8] text-[#173024] font-bold text-xs flex items-center justify-center hover:bg-[#D4C7AA]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-xs">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.min(10, prev + 1))}
                    className="w-5 h-5 rounded bg-[#E8DFC8] text-[#173024] font-bold text-xs flex items-center justify-center hover:bg-[#D4C7AA]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#FAF7F0] px-3 py-1.5 rounded-lg border border-[#D5CAA4]">
                <span className="text-xs font-semibold text-[#524E48]">
                  Children (&lt;12)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    className="w-5 h-5 rounded bg-[#E8DFC8] text-[#173024] font-bold text-xs flex items-center justify-center hover:bg-[#D4C7AA]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-xs">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => Math.min(10, prev + 1))}
                    className="w-5 h-5 rounded bg-[#E8DFC8] text-[#173024] font-bold text-xs flex items-center justify-center hover:bg-[#D4C7AA]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#524E48] mb-1">
                <span>Calculated Rail Distance:</span>
                <span className="font-bold text-[#173024] font-mono text-sm">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="450"
                step="5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-[#758A80] h-1.5 bg-[#D3C9B4] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Fare Slabs Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5751]">
                Estimated Fare Matrix ({fromStation.name_en} ➔ {toStation.name_en})
              </h3>
              <span className="text-[10px] text-[#7A7468]">
                {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* 3rd Class */}
              <div className="bg-[#FAF7F0] border border-[#D5CCB8] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2923]">3rd Class (Unreserved/Res)</span>
                  <span className="text-sm font-bold text-[#173024] font-mono">{fares.third} LKR</span>
                </div>
                <p className="text-[11px] text-[#69655E] mt-1">Standard wooden/cushioned seats. Day counter tickets.</p>
              </div>

              {/* 2nd Class */}
              <div className="bg-[#FAF7F0] border border-[#758A80] p-3 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2923]">2nd Class (Reserved)</span>
                  <span className="text-sm font-bold text-[#5B7B6E] font-mono">{fares.second} LKR</span>
                </div>
                <p className="text-[11px] text-[#69655E] mt-1">Cushioned seats with opening windows for photography.</p>
              </div>

              {/* 1st Class AC */}
              <div className="bg-[#FAF7F0] border border-[#D5CCB8] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2923]">1st Class AC (Reserved)</span>
                  <span className="text-sm font-bold text-[#173024] font-mono">{fares.firstAC} LKR</span>
                </div>
                <p className="text-[11px] text-[#69655E] mt-1">Full climate control, sealed panoramic windows, plush seats.</p>
              </div>

              {/* 1st Observation Saloon */}
              <div className="bg-[#FFFDF7] border-2 border-[#D4A359] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8C5819]">1st Observation Saloon</span>
                  <span className="text-sm font-bold text-[#8C5819] font-mono">{fares.firstObs} LKR</span>
                </div>
                <p className="text-[11px] text-[#69655E] mt-1">Rear glass carriage with 180° views of Nine Arch Bridge.</p>
              </div>

              {/* 1st Sleeper Berth */}
              <div className="sm:col-span-2 bg-[#FAF7F0] border border-[#D5CCB8] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2923]">1st Class Sleeper Berth (Night Mail)</span>
                  <span className="text-sm font-bold text-[#173024] font-mono">{fares.firstSleeper} LKR</span>
                </div>
                <p className="text-[11px] text-[#69655E] mt-1">Lockable private two-bunk cabin with fresh bedsheet & pillow.</p>
              </div>
            </div>
          </div>

          {/* Official Booking Channels Bridge */}
          <div className="bg-[#EAE4D7] p-3.5 rounded-xl border border-[#D5CCA8] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173024] flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#C88A35]" />
                Official Sri Lanka Railways Booking Channels
              </span>
              <span className="text-[10px] text-[#6B655A]">Gov Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href="https://seatreservation.railway.gov.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD4C2] hover:border-[#758A80] flex items-center justify-between text-[11px] text-[#173024] transition-colors group"
              >
                <div>
                  <div className="font-bold group-hover:text-[#5B7B6E]">SLR Web Portal</div>
                  <div className="text-[10px] text-[#7A7468]">Online Card Booking</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#C88A35]" />
              </a>

              <a
                href="tel:365"
                className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD4C2] hover:border-[#758A80] flex items-center justify-between text-[11px] text-[#173024] transition-colors group"
              >
                <div>
                  <div className="font-bold group-hover:text-[#5B7B6E]">Mobitel Dial 365</div>
                  <div className="text-[10px] text-[#7A7468]">Mobile Phone Booking</div>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-[#5B7B6E]" />
              </a>

              <a
                href="tel:444"
                className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD4C2] hover:border-[#758A80] flex items-center justify-between text-[11px] text-[#173024] transition-colors group"
              >
                <div>
                  <div className="font-bold group-hover:text-[#5B7B6E]">Dialog Dial 444</div>
                  <div className="text-[10px] text-[#7A7468]">Star Points / Bill</div>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-[#5B7B6E]" />
              </a>
            </div>
          </div>

          {/* Luggage and Guidelines */}
          <div className="bg-[#EAE4D7] p-3 rounded-xl border border-[#D5CCA8] text-xs text-[#403C35] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#2A2722]">
              <Luggage className="w-4 h-4 text-[#758A80]" />
              <span>Official Free Baggage Allowance:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#555047]">
              <li><strong>1st Class:</strong> 40 kg per adult passenger</li>
              <li><strong>2nd Class:</strong> 35 kg per adult passenger</li>
              <li><strong>3rd Class:</strong> 25 kg per adult passenger</li>
            </ul>
            <div className="pt-1 border-t border-[#D6CDBA] flex items-center gap-1.5 text-[11px] text-[#6B655A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B7B6E]" />
              <span>Seat bookings open 30 days in advance at 10:00 AM IST.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center justify-between gap-3">
          <a
            href="https://seatreservation.railway.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#173024] hover:bg-[#204031] text-white font-medium py-2 px-4 rounded-xl text-xs sm:text-sm transition-all"
          >
            <span>{t.bookTickets}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#DCD4C3] hover:bg-[#CEC3B0] text-[#3A3731]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
