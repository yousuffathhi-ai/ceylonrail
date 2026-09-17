import React, { useState, useEffect } from 'react';
import {
  Train,
  Armchair,
  Wind,
  Zap,
  Luggage,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TrainSchedule, SeatClass } from '../../types';

interface CoachArrangementVisualizerProps {
  train: TrainSchedule;
  selectedClass: SeatClass;
  onSelectClass?: (cls: SeatClass) => void;
}

interface Coach {
  id: string;
  carNumber: string;
  name: string;
  classType: SeatClass | 'Engine' | 'Power/Baggage';
  seats: number;
  layout: '2x2' | '3x2' | 'Observation' | 'None';
  ac: boolean;
  powerSockets: boolean;
  luggageRacks: boolean;
  toilets: number;
  description: string;
}

export const CoachArrangementVisualizer: React.FC<CoachArrangementVisualizerProps> = ({
  train,
  selectedClass,
  onSelectClass,
}) => {
  // Generate realistic train coach lineup based on train lines
  const coaches: Coach[] = React.useMemo(() => {
    if (train.line === 'Main Line') {
      return [
        {
          id: 'ENG',
          carNumber: 'LOC',
          name: 'Class S12 Diesel Locomotive',
          classType: 'Engine',
          seats: 0,
          layout: 'None',
          ac: false,
          powerSockets: false,
          luggageRacks: false,
          toilets: 0,
          description: 'Front power unit driving hill-country mountain gradients.',
        },
        {
          id: 'C1',
          carNumber: 'Car 1',
          name: 'Luggage & Brake Van',
          classType: 'Power/Baggage',
          seats: 12,
          layout: '3x2',
          ac: false,
          powerSockets: false,
          luggageRacks: true,
          toilets: 1,
          description: 'Heavy baggage compartment and guard cabin.',
        },
        {
          id: 'C2',
          carNumber: 'Car 2',
          name: '3rd Class Unreserved',
          classType: '3rd Class',
          seats: 88,
          layout: '3x2',
          ac: false,
          powerSockets: false,
          luggageRacks: true,
          toilets: 2,
          description: 'Standard commuter coach with overhead breeze fans.',
        },
        {
          id: 'C3',
          carNumber: 'Car 3',
          name: '3rd Class Reserved',
          classType: '3rd Class',
          seats: 80,
          layout: '3x2',
          ac: false,
          powerSockets: false,
          luggageRacks: true,
          toilets: 2,
          description: 'Reserved numbered seating with dedicated ticket check.',
        },
        {
          id: 'C4',
          carNumber: 'Car 4',
          name: '2nd Class Reserved',
          classType: '2nd Class',
          seats: 64,
          layout: '2x2',
          ac: false,
          powerSockets: true,
          luggageRacks: true,
          toilets: 2,
          description: 'Cushioned high-back seats with openable panorama windows.',
        },
        {
          id: 'C5',
          carNumber: 'Car 5',
          name: '1st Class Air-Conditioned',
          classType: '1st AC',
          seats: 52,
          layout: '2x2',
          ac: true,
          powerSockets: true,
          luggageRacks: true,
          toilets: 2,
          description: 'Fully climate-controlled sealed cabin with plush recliners.',
        },
        {
          id: 'C6',
          carNumber: 'Car 6',
          name: '1st Class Observation Saloon',
          classType: '1st Observation',
          seats: 44,
          layout: 'Observation',
          ac: false,
          powerSockets: true,
          luggageRacks: true,
          toilets: 2,
          description: 'End car with giant curved rear window facing mountain scenery.',
        },
      ];
    } else {
      // Coastal & Northern line setup
      return [
        {
          id: 'ENG',
          carNumber: 'LOC',
          name: 'Class M10 Locomotive',
          classType: 'Engine',
          seats: 0,
          layout: 'None',
          ac: false,
          powerSockets: false,
          luggageRacks: false,
          toilets: 0,
          description: 'Heavy diesel-electric passenger locomotive.',
        },
        {
          id: 'C1',
          carNumber: 'Car 1',
          name: '3rd Class Commuter',
          classType: '3rd Class',
          seats: 96,
          layout: '3x2',
          ac: false,
          powerSockets: false,
          luggageRacks: true,
          toilets: 2,
          description: 'High-capacity commuter carriage.',
        },
        {
          id: 'C2',
          carNumber: 'Car 2',
          name: '3rd Class Standard',
          classType: '3rd Class',
          seats: 96,
          layout: '3x2',
          ac: false,
          powerSockets: false,
          luggageRacks: true,
          toilets: 2,
          description: 'Standard passenger car with ceiling fans.',
        },
        {
          id: 'C3',
          carNumber: 'Car 3',
          name: '2nd Class Reserved',
          classType: '2nd Class',
          seats: 68,
          layout: '2x2',
          ac: false,
          powerSockets: true,
          luggageRacks: true,
          toilets: 2,
          description: 'Reserved 2x2 seating with ocean breeze windows.',
        },
        {
          id: 'C4',
          carNumber: 'Car 4',
          name: '1st Class AC Intercity',
          classType: '1st AC',
          seats: 56,
          layout: '2x2',
          ac: true,
          powerSockets: true,
          luggageRacks: true,
          toilets: 2,
          description: 'Climate-controlled quiet carriage.',
        },
      ];
    }
  }, [train.line]);

  // Find coach matching the currently selected class
  const matchingCoach = coaches.find((c) => c.classType === selectedClass) || coaches[coaches.length - 2];
  const [activeCoachId, setActiveCoachId] = useState<string>(matchingCoach.id);

  useEffect(() => {
    const coach = coaches.find((c) => c.classType === selectedClass);
    if (coach) {
      setActiveCoachId(coach.id);
    }
  }, [selectedClass, coaches]);

  const activeCoach = coaches.find((c) => c.id === activeCoachId) || matchingCoach;

  return (
    <div className="bg-[#FAF7F2] rounded-xl p-3.5 border border-[#DFD5C2] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-[#173024]/10 text-[#173024]">
            <Train className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#173024]">
              Coach Arrangement & Rake Layout
            </h4>
            <p className="text-[11px] text-[#6E685D]">
              Select a coach to view position, seating layout, and platform boarding doors
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold bg-[#D4A359]/20 text-[#8C5819] px-2 py-0.5 rounded border border-[#D4A359]/30">
          Selected: {selectedClass}
        </span>
      </div>

      {/* Train Exterior Composition Visualizer (Scrollable Train Rake) */}
      <div className="overflow-x-auto pb-2 pt-1 no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max px-1">
          {coaches.map((coach, idx) => {
            const isTargetClass = coach.classType === selectedClass;
            const isInspecting = coach.id === activeCoachId;
            const isEngine = coach.classType === 'Engine';

            return (
              <button
                key={coach.id}
                onClick={() => {
                  setActiveCoachId(coach.id);
                  if (onSelectClass && coach.classType !== 'Engine' && coach.classType !== 'Power/Baggage') {
                    onSelectClass(coach.classType as SeatClass);
                  }
                }}
                className={`relative flex flex-col items-center justify-between transition-all rounded-lg p-2 ${
                  isEngine
                    ? 'w-24 h-20 bg-[#2D4536] text-white border border-[#406852]'
                    : isInspecting
                    ? 'w-28 h-20 bg-[#173024] text-white border-2 border-[#D4A359] shadow-md scale-105'
                    : isTargetClass
                    ? 'w-28 h-20 bg-[#ECE5D8] text-[#1F2923] border-2 border-[#5B7B6E]'
                    : 'w-28 h-20 bg-[#F2ECE1] text-[#4E4B45] border border-[#D9D0BE] hover:bg-[#EAE1D0]'
                }`}
              >
                {/* Active selection badge */}
                {isTargetClass && !isEngine && (
                  <span className="absolute -top-2 bg-[#D4A359] text-[#173024] text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-2xs">
                    Your Car
                  </span>
                )}

                {/* Car Header */}
                <div className="w-full flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold">{coach.carNumber}</span>
                  {coach.ac && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-sans">
                      A/C
                    </span>
                  )}
                </div>

                {/* Car Body Visual (Windows & Doors) */}
                <div className="w-full flex items-center justify-center gap-1 py-1">
                  {isEngine ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4A359]">
                      <Train className="w-4 h-4" />
                      <span>DIESEL</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 w-full px-1">
                      <div className="w-1.5 h-6 bg-[#354E41] rounded-xs" title="Entry Door" />
                      <div className="flex-1 flex justify-around">
                        <div className="w-2.5 h-3 bg-sky-200 rounded-xs border border-sky-400" />
                        <div className="w-2.5 h-3 bg-sky-200 rounded-xs border border-sky-400" />
                        <div className="w-2.5 h-3 bg-sky-200 rounded-xs border border-sky-400" />
                      </div>
                      <div className="w-1.5 h-6 bg-[#354E41] rounded-xs" title="Entry Door" />
                    </div>
                  )}
                </div>

                {/* Car Footer Label */}
                <div className="text-[10px] font-medium truncate w-full text-center">
                  {coach.classType}
                </div>

                {/* Wheels at the bottom */}
                <div className="absolute -bottom-1 left-2 right-2 flex justify-between">
                  <span className="w-2 h-2 rounded-full bg-[#1F2923] border border-gray-400" />
                  <span className="w-2 h-2 rounded-full bg-[#1F2923] border border-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Coach Inspector Details */}
      <div className="bg-[#EDE7DA] rounded-xl p-3 border border-[#D5CCB8] space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-[#173024]">
                {activeCoach.carNumber}: {activeCoach.name}
              </span>
              {activeCoach.classType === selectedClass && (
                <span className="text-[10px] font-medium bg-[#173024] text-[#E5EDE8] px-2 py-0.5 rounded-full">
                  Matches your ticket
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A5751] mt-0.5">
              {activeCoach.description}
            </p>
          </div>

          {activeCoach.seats > 0 && (
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#173024]">
                {activeCoach.seats} Seats
              </div>
              <div className="text-[10px] text-[#7A756D]">
                {activeCoach.layout} Config
              </div>
            </div>
          )}
        </div>

        {/* Coach Facilities Pill Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#3B3833]">
          {activeCoach.ac && (
            <span className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
              <Wind className="w-3 h-3 text-sky-600" /> Climate Air-Con
            </span>
          )}
          {activeCoach.powerSockets && (
            <span className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
              <Zap className="w-3 h-3 text-amber-600" /> Mobile Charging Sockets
            </span>
          )}
          {activeCoach.luggageRacks && (
            <span className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
              <Luggage className="w-3 h-3 text-[#5B7B6E]" /> Overhead Luggage Loft
            </span>
          )}
          {activeCoach.toilets > 0 && (
            <span className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
              🚻 {activeCoach.toilets} Onboard Restrooms
            </span>
          )}
          {activeCoach.layout === 'Observation' && (
            <span className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
              <Sparkles className="w-3 h-3 text-[#D4A359]" /> 180° Rear Observation Glazing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
