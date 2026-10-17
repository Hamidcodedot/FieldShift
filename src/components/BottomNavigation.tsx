import React from 'react';
import { Home, MapPin, Sprout, Mic } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

export type AppTab = 'home' | 'field' | 'rotation' | 'voice';

interface BottomNavigationProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: Language;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; isSpecial?: boolean }[] = [
    {
      id: 'home',
      label: t.tabHome,
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: 'field',
      label: t.tabField,
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 'rotation',
      label: t.tabRotation,
      icon: <Sprout className="h-5 w-5" />,
    },
    {
      id: 'voice',
      label: t.tabVoice,
      icon: <Mic className="h-5 w-5" />,
      isSpecial: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/90 bg-white/95 backdrop-blur-md pb-safe dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center rounded-lg px-3 py-1.5 transition-all active:scale-90 min-w-16 min-h-12 ${
                item.isSpecial && !isActive
                  ? 'text-emerald-700 font-medium dark:text-emerald-400'
                  : isActive
                  ? 'text-emerald-700 font-bold dark:text-emerald-400'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-full ${
                  item.isSpecial
                    ? 'bg-emerald-50 border border-emerald-600/30 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-500/40 dark:text-emerald-400'
                    : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="mt-1 text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
