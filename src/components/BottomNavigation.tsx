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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center rounded-lg px-3 py-1.5 transition-all active:scale-90 min-w-16 min-h-12 ${
                item.isSpecial && !isActive
                  ? 'text-emerald-400 font-medium'
                  : isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-full ${
                  item.isSpecial
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
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
