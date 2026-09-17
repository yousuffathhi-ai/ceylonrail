import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, X, ChevronRight, Mountain } from 'lucide-react';
import { Language, Station } from '../../types';
import { STATIONS } from '../../data/timetableData';

interface PredictiveStationInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onSelectStation?: (station: Station) => void;
  placeholder?: string;
  language: Language;
  rightElement?: React.ReactNode;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}

export const PredictiveStationInput: React.FC<PredictiveStationInputProps> = ({
  label,
  value,
  onChange,
  onSelectStation,
  placeholder = 'Type station name or code...',
  language,
  rightElement,
  autoFocus = false,
  className = '',
  inputClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Predictive search query filtering
  const matchingStations = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];

    return STATIONS.filter((station) => {
      return (
        station.name_en.toLowerCase().includes(q) ||
        station.code.toLowerCase().includes(q) ||
        station.name_si.toLowerCase().includes(q) ||
        station.name_ta.toLowerCase().includes(q) ||
        station.line.toLowerCase().includes(q)
      );
    }).slice(0, 8); // Top 8 predictive matches
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (station: Station) => {
    onChange(station.name_en);
    if (onSelectStation) {
      onSelectStation(station);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingStations.length === 0) {
      if (e.key === 'ArrowDown' && matchingStations.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < matchingStations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : matchingStations.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < matchingStations.length) {
        handleSelect(matchingStations[highlightedIndex]);
      } else if (matchingStations.length > 0) {
        handleSelect(matchingStations[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper for line color pill
  const getLineBadgeColor = (line: string) => {
    switch (line) {
      case 'Main Line':
        return 'bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/30';
      case 'Coastal Line':
        return 'bg-[#00838F]/15 text-[#00838F] border-[#00838F]/30';
      case 'Northern Line':
        return 'bg-[#1565C0]/15 text-[#1565C0] border-[#1565C0]/30';
      case 'Eastern Line':
        return 'bg-[#D84315]/15 text-[#D84315] border-[#D84315]/30';
      default:
        return 'bg-[#6A1B9A]/15 text-[#6A1B9A] border-[#6A1B9A]/30';
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[10px] uppercase font-bold text-[#6E685D] block">
            {label}
          </label>
          {rightElement}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (value.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent font-medium text-xs sm:text-sm text-[#1F2923] outline-none placeholder-[#9B9588] pr-6 ${inputClassName}`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-0 text-[#8C8477] hover:text-[#173024] p-0.5 rounded-full hover:bg-[#E5DDCE] transition-colors"
            title="Clear station"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Predictive Search Autocomplete Dropdown */}
      {isOpen && matchingStations.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#FAF7F2] border border-[#DFD5C2] rounded-xl shadow-xl overflow-hidden divide-y divide-[#EFE7DA] animate-fadeIn max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-[#F2EBE0] text-[10px] font-semibold text-[#787164] flex items-center justify-between">
            <span>Matching Stations ({matchingStations.length})</span>
            <span className="text-[9px] text-[#9A9386]">↑↓ to navigate, Enter to select</span>
          </div>

          {matchingStations.map((station, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={station.code}
                onClick={() => handleSelect(station)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isHighlighted ? 'bg-[#EAE2D2] text-[#173024]' : 'hover:bg-[#F4EEE2] text-[#24211C]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#173024] text-[#D4A359] flex items-center justify-center shrink-0 font-mono text-[11px] font-bold shadow-2xs">
                    {station.code}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm truncate text-[#173024]">
                        {station.name_en}
                      </span>
                      <span className="text-[10px] text-[#7A7365] truncate font-serif">
                        {language === 'si' ? station.name_si : language === 'ta' ? station.name_ta : station.name_si}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#756E62] mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${getLineBadgeColor(station.line)}`}>
                        {station.line}
                      </span>
                      {station.distance_from_fort_km !== undefined && (
                        <span>{station.distance_from_fort_km} km from Fort</span>
                      )}
                      {station.elevation_m !== undefined && station.elevation_m > 300 && (
                        <span className="flex items-center gap-0.5 text-[#2E7D32]">
                          <Mountain className="w-2.5 h-2.5" />
                          {station.elevation_m}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8C8477] shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
