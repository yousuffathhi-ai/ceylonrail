import React from 'react';
import { Home, Search, Map, BookOpen, Bookmark } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/localization';

export type NavTab = 'home' | 'search' | 'map' | 'history' | 'saved';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  savedCount,
}) => {
  const t = translations[language];

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: t.search, icon: <Search className="w-5 h-5" /> },
    { id: 'map', label: t.map, icon: <Map className="w-5 h-5" /> },
    { id: 'history', label: t.history, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'saved', label: t.saved, icon: <Bookmark className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#173024]/95 backdrop-blur-md border-t border-[#2D503E] text-[#C5D1CA] shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#FFFFFF]'
                  : 'text-[#8EA599] hover:text-[#E2ECE7]'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 bg-[#758A80]/35 rounded-xl border border-[#758A80]/50" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  {item.icon}
                  {item.id === 'saved' && savedCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#D4A359] text-[#12241C] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#173024]">
                      {savedCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                    isActive ? 'font-semibold text-white' : ''
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
