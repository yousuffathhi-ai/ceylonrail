import React from 'react';
import { Home, Search, Map, LayoutGrid, BookOpen, Bookmark } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/localization';

export type NavTab = 'home' | 'search' | 'route-map' | 'apps' | 'heritage' | 'saved' | 'map' | 'history';

interface BottomNavProps {
  activeTab?: NavTab;
  currentTab?: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  currentTab,
  onSelectTab,
  language,
  savedCount,
}) => {
  const t = translations[language];
  const tab = activeTab || currentTab || 'home';

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: t.search, icon: <Search className="w-5 h-5" /> },
    {
      id: 'route-map',
      label: language === 'si' ? 'සිතියම' : language === 'ta' ? 'வரைபடம்' : 'Route Map',
      icon: <Map className="w-5 h-5" />,
    },
    {
      id: 'apps',
      label: t.apps || 'Apps',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'heritage',
      label: language === 'si' ? 'උරුමය' : language === 'ta' ? 'பாரம்பரியம்' : 'Heritage',
      icon: <BookOpen className="w-5 h-5" />,
    },
    { id: 'saved', label: t.saved, icon: <Bookmark className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#173024] border-t border-[#2D503E] text-[#C5D1CA] shadow-2xl pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-between px-1.5 sm:px-3 py-1.5">
        {navItems.map((item) => {
          const isActive =
            tab === item.id ||
            (item.id === 'route-map' && tab === 'map') ||
            (item.id === 'heritage' && tab === 'history');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative min-h-[48px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-white'
                  : 'text-[#8EA599] hover:text-[#E2ECE7]'
              }`}
            >
              {/* Active pill background highlight in Ceylon Rail theme colors */}
              {isActive && (
                <span className="absolute inset-0 bg-[#758A80]/30 rounded-xl border border-[#D4A359]/40 shadow-xs shadow-[#D4A359]/10" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <span
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[#D4A359] drop-shadow-[0_0_6px_rgba(212,163,89,0.5)]' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.id === 'saved' && savedCount > 0 && (
                    <span className="absolute -top-1 -right-2.5 bg-[#D4A359] text-[#12241C] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#173024] shadow-xs">
                      {savedCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight ${
                    isActive ? 'font-bold text-white' : 'font-medium'
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
