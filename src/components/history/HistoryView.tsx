import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Train,
  Award,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Language, LegendaryTrainProfile } from '../../types';
import { translations } from '../../data/localization';
import { HISTORY_MILESTONES, LEGENDARY_TRAINS } from '../../data/timetableData';

interface HistoryViewProps {
  language: Language;
  onExploreTrain: (trainName: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  language,
  onExploreTrain,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'trains' | 'timeline'>('trains');
  const [selectedTrain, setSelectedTrain] = useState<LegendaryTrainProfile | null>(null);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#173024] via-[#1E4332] to-[#14291F] text-white p-5 sm:p-6 rounded-2xl border border-[#2F523E] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4A359]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A359] bg-[#D4A359]/20 px-2 py-0.5 rounded border border-[#D4A359]/30">
            Heritage Archive
          </span>
          <span className="text-xs text-[#A7C2B3]">Ceylon Government Railway</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
          160 Years of Ceylon Railway Heritage
        </h2>

        <p className="text-xs sm:text-sm text-[#CADFD3] mt-1.5 max-w-xl leading-relaxed">
          From the first steam locomotive puffing to Ambepussa in 1864, to conquering Kadugannawa Pass and raising the Demodara Nine Arch Bridge in the sky.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2B4E3B]">
          <button
            onClick={() => setActiveTab('trains')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'trains'
                ? 'bg-[#D4A359] text-[#12241C] shadow-sm'
                : 'bg-[#234534] text-[#C5D9CE] hover:text-white'
            }`}
          >
            Legendary Trains of Sri Lanka
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#D4A359] text-[#12241C] shadow-sm'
                : 'bg-[#234534] text-[#C5D9CE] hover:text-white'
            }`}
          >
            Milestones (1858 – Present)
          </button>
        </div>
      </section>

      {/* View 1: Legendary Trains */}
      {activeTab === 'trains' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEGENDARY_TRAINS.map((train) => (
              <div
                key={train.id}
                onClick={() => setSelectedTrain(train)}
                className="bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#DFD5C2] hover:border-[#758A80] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                {/* Train Cover Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={train.imageUrl}
                    alt={train.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 bg-[#173024]/90 backdrop-blur-xs text-[#D4A359] font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#D4A359]/30">
                    {train.train_numbers}
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[10px] font-semibold text-[#D4A359] uppercase tracking-wider block mb-0.5">
                      {train.line} • Inaugurated {train.inauguration}
                    </span>
                    <h3 className="font-serif font-bold text-lg leading-tight">
                      {train.name}
                    </h3>
                  </div>
                </div>

                {/* Train Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[#524D44] line-clamp-3 leading-relaxed">
                    {train.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-[#E8E1D3]">
                    {train.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="text-[11px] text-[#332F2A] flex items-start gap-1.5">
                        <span className="text-[#C88A35] font-bold">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#5B7B6E] font-semibold">
                    <span>Read Full Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* View 2: Chronological Milestones Timeline */}
      {activeTab === 'timeline' && (
        <section className="bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 border border-[#DFD5C2] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D3]">
            <h3 className="font-serif font-bold text-base text-[#173024] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C88A35]" />
              <span>Chronology of Ceylon Railways (1858 – Present)</span>
            </h3>
            <span className="text-[11px] text-[#7A7468] font-mono">
              {HISTORY_MILESTONES.length} Historic Milestones Recorded
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9C0AE]">
            {HISTORY_MILESTONES.map((milestone, idx) => (
              <div key={idx} className="relative">
                {/* Milestone Node */}
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#173024] border-2 border-[#D4A359]" />

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-[#173024] text-[#D4A359] px-2 py-0.5 rounded">
                    {milestone.year}
                  </span>
                  <span className="text-xs font-serif font-bold text-[#1F2923]">
                    {milestone.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#EAE2D2] text-[#6E685D] border border-[#D8CEBA]">
                    {milestone.category}
                  </span>
                </div>

                <p className="text-xs text-[#544F45] mt-1.5 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Train Profile Detail Modal */}
      {selectedTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#DFD5C2] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-56 w-full">
              <img
                src={selectedTrain.imageUrl}
                alt={selectedTrain.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <button
                onClick={() => setSelectedTrain(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase bg-[#D4A359] text-[#12241C] px-2 py-0.5 rounded font-bold">
                  {selectedTrain.train_numbers}
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl mt-1">
                  {selectedTrain.name}
                </h3>
                <p className="text-xs text-[#D4A359] font-medium">
                  {selectedTrain.tagline}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#24211C]">
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#7A7468] block mb-1">
                  Historical Profile
                </span>
                <p className="leading-relaxed text-[#3B3730]">
                  {selectedTrain.description}
                </p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#7A7468] block mb-1.5">
                  Distinguished Engineering Highlights
                </span>
                <ul className="space-y-1.5 pl-4 list-disc text-[#47423A]">
                  {selectedTrain.highlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#E8E1D3] flex items-center justify-between">
                <button
                  onClick={() => {
                    const name = selectedTrain.name;
                    setSelectedTrain(null);
                    onExploreTrain(name);
                  }}
                  className="flex items-center gap-1.5 bg-[#173024] hover:bg-[#234534] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Train className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>View Today's Timetable</span>
                </button>

                <button
                  onClick={() => setSelectedTrain(null)}
                  className="bg-[#EAE3D5] text-[#3B3730] px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#DDD5C3]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
