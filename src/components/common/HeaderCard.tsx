import React, { useState } from 'react';
import {
  Train,
  CloudSun,
  Bot,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Route,
  Moon,
  Sun,
  Navigation,
  Download,
  Copy,
  Check,
  X,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Language, AppTheme } from '../../types';
import { translations } from '../../data/localization';
import { LIVE_WEATHER_ALERTS } from '../../data/timetableData';
import { DelayState } from '../../utils/offlineStorage';

interface HeaderCardProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenConductor: () => void;
  onOpenFareCalc: () => void;
  onOpenPlanner?: () => void;
  onOpenPlatformHelper?: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  delayState: DelayState;
  onToggleDelay: () => void;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  language,
  onLanguageChange,
  onOpenConductor,
  onOpenFareCalc,
  onOpenPlanner,
  onOpenPlatformHelper,
  theme = 'parchment',
  onToggleTheme,
  delayState,
  onToggleDelay,
}) => {
  const t = translations[language];
  const activeWeather = LIVE_WEATHER_ALERTS[0]; // Colombo Fort
  const isDelayed = delayState !== 'ON_TIME';

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLogoUrl = () => {
    const fullUrl = window.location.origin + '/logo.png';
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative w-full bg-[#173024] text-[#F4F0EA] border-b border-[#2A4B3A] shadow-md transition-colors">
      {/* Subtle vintage railway rail line accent on top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#D4A359] via-[#758A80] to-[#D4A359]" />

      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
        {/* Top Status Bar: Weather + Language Switcher + Theme Toggle + Delay Status */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#C5D1CA] pb-3 border-b border-[#244233]">
          {/* Weather Ticker & Live Delay Status */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex items-center gap-1 bg-[#102219] px-2.5 py-1 rounded-full text-[11px] border border-[#2D4D3D] text-[#E5ECE8] font-medium">
              <CloudSun className="w-3.5 h-3.5 text-[#D4A359]" />
              <span className="font-semibold text-white">{activeWeather.station}</span>
              <span>{activeWeather.temp_c}°C</span>
              <span className="hidden sm:inline text-[#9FB5A9]">({activeWeather.condition})</span>
            </span>

            {/* Delay simulator toggle with subtle pulse animation when delayed */}
            <button
              onClick={onToggleDelay}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all border ${
                !isDelayed
                  ? 'bg-[#183B29] border-[#316548] text-[#9FE8BC] hover:bg-[#1E4833]'
                  : 'bg-[#472615] border-[#D97706] text-[#FCD34D] hover:bg-[#59301B] animate-delay-pulse shadow-xs shadow-amber-500/20'
              }`}
              title="Click to toggle simulated live delay telemetry"
            >
              {!isDelayed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#52D288]" />
                  <span>SLR: On-Time</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]" />
                  </span>
                  <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
                  <span className="font-semibold">Track Advisory (+10m)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Controls: Theme Toggle & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Night Rail Mode Theme Switcher */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  theme === 'night'
                    ? 'bg-[#E5B25D] text-[#0E1612] border-[#F2C97D] font-bold shadow-xs'
                    : 'bg-[#102219] text-[#C5D1CA] border-[#2A4736] hover:text-white hover:bg-[#183325]'
                }`}
                title={theme === 'night' ? 'Switch to Vintage Parchment Mode' : 'Switch to High-Contrast Night Rail Mode'}
              >
                {theme === 'night' ? (
                  <>
                    <Sun className="w-3 h-3 text-[#0E1612]" />
                    <span className="hidden sm:inline">Night Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-[#D4A359]" />
                    <span className="hidden sm:inline">Night Mode</span>
                  </>
                )}
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-[#0E1F17] rounded-full p-0.5 border border-[#274535]">
              {(['en', 'si', 'ta'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                    language === lang
                      ? 'bg-[#758A80] text-[#FFFFFF] shadow-xs font-semibold'
                      : 'text-[#9FB5A9] hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'si' ? 'සිං' : 'த'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Header Branding & Actions */}
        <div className="pt-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Official Public Logo Badge */}
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#12241C] border border-[#D4A359]/60 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 group transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Ceylon Rail Official Public Logo - Click to view & download brand assets"
            >
              <img
                src="/logo.png"
                alt="Ceylon Rail Public Logo"
                className="w-full h-full object-cover rounded-[10px] group-hover:brightness-110 transition-all"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="logo-fallback hidden w-full h-full items-center justify-center text-[#D4A359]">
                <Train className="w-6 h-6" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#F4F0EA]">
                  {t.appName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="text-[10px] uppercase tracking-wider font-mono bg-[#D4A359]/20 text-[#E7C286] hover:bg-[#D4A359]/30 border border-[#D4A359]/30 px-1.5 py-0.5 rounded transition-colors"
                  title="View Public Emblem & Heritage Badge"
                >
                  SLR 1864
                </button>
              </div>
              <p className="text-xs text-[#A7BCB0] font-sans">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenPlatformHelper && (
              <button
                onClick={onOpenPlatformHelper}
                className="flex items-center gap-1.5 bg-[#1B3A2C] hover:bg-[#254C3A] text-[#D8E6DE] text-xs font-medium px-3 py-1.5 rounded-full border border-[#3E6D54] transition-all transform active:scale-95"
                title="Platform Walking Helper with Geolocation"
              >
                <Navigation className="w-3.5 h-3.5 text-[#5CE2A0]" />
                <span className="hidden xs:inline">Platform Helper</span>
              </button>
            )}

            {onOpenPlanner && (
              <button
                onClick={onOpenPlanner}
                className="flex items-center gap-1.5 bg-[#D4A359] hover:bg-[#C2924A] text-[#173024] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#E7C286] transition-all transform active:scale-95"
              >
                <Route className="w-3.5 h-3.5 text-[#173024]" />
                <span className="hidden xs:inline">Plan Trip</span>
              </button>
            )}

            <button
              onClick={onOpenFareCalc}
              className="hidden sm:flex items-center gap-1.5 bg-[#234534] hover:bg-[#2C5641] text-[#E5ECE8] text-xs font-medium px-3 py-1.5 rounded-full border border-[#38664D] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>{t.fareCalculator}</span>
            </button>

            <button
              onClick={onOpenConductor}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#758A80] to-[#5C756B] hover:from-[#82998F] hover:to-[#68857A] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-xs border border-[#95ACA1]/40 transition-all transform active:scale-95"
            >
              <Bot className="w-3.5 h-3.5 text-[#FFE2A4]" />
              <span className="hidden xs:inline">Conductor</span>
              <Sparkles className="w-3 h-3 text-[#FFE2A4]" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Public Logo & Brand Assets Modal */}
      {isLogoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0A1610]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsLogoModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] text-[#173024] rounded-2xl max-w-md w-full border border-[#D5CAA4] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#173024] text-[#F4F0EA] px-5 py-4 flex items-center justify-between border-b border-[#2C4F3D]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D4A359]" />
                <div>
                  <h3 className="font-serif font-bold text-base tracking-wide text-white">
                    Ceylon Rail Official Logo
                  </h3>
                  <p className="text-[11px] text-[#A7C2B3]">
                    Public Identity & Brand Assets (Est. 1864)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#234534] hover:bg-[#2F5A44] text-[#C5D9CE] hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Logo Preview Stage */}
              <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-[#EFE9DC] to-[#E5DEC8] rounded-xl border border-[#D8CEB8]">
                <div className="relative w-36 h-36 rounded-2xl bg-[#12241C] p-1.5 shadow-xl border-2 border-[#D4A359]">
                  <img
                    src="/logo.png"
                    alt="Ceylon Rail Public Logo"
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-serif font-bold text-[#173024] mt-3">
                  Ceylon Rail Heritage Emblem
                </span>
                <span className="text-[10px] text-[#6E685D] font-mono mt-0.5">
                  Vector Broad-Gauge Locomotive & Viaduct Crest
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="/logo.png"
                  download="ceylon-rail-logo.png"
                  className="flex items-center justify-center gap-2 bg-[#173024] hover:bg-[#234534] text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Download Logo (PNG)</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLogoUrl}
                  className="flex items-center justify-center gap-2 bg-[#EAE2D2] hover:bg-[#DDD3BF] text-[#173024] py-2 px-3 rounded-xl text-xs font-semibold border border-[#C5BBA7] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">URL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#758A80]" />
                      <span>Copy Public URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Public URL Direct Bridge */}
              <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DDD3BF] text-[11px] flex items-center justify-between gap-2">
                <span className="font-mono text-[#544E45] truncate">
                  /logo.png
                </span>
                <a
                  href="/logo.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#758A80] hover:text-[#173024] flex items-center gap-1 font-medium shrink-0"
                >
                  <span>Open raw</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Brand Palette Spec */}
              <div className="pt-2 border-t border-[#E2D9C5] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E685D] block">
                  Official Brand Colors
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-[#173024] text-white p-2 rounded-lg font-mono">
                    <div className="font-bold">#173024</div>
                    <div className="text-[9px] text-[#A7C2B3]">Ceylon Green</div>
                  </div>
                  <div className="bg-[#D4A359] text-[#12241C] p-2 rounded-lg font-mono">
                    <div className="font-bold">#D4A359</div>
                    <div className="text-[9px] text-[#423114]">Loco Brass</div>
                  </div>
                  <div className="bg-[#FAF7F2] text-[#173024] p-2 rounded-lg font-mono border border-[#DDD3BF]">
                    <div className="font-bold">#FAF7F2</div>
                    <div className="text-[9px] text-[#6E685D]">Parchment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

