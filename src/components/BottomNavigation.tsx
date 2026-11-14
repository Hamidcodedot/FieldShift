import React from 'react';
import { Home, Layers, RotateCcw, Sun } from 'lucide-react';

export type AppTab = 'home' | 'field' | 'rotation' | 'weather' | 'settings';

interface BottomNavigationProps {
  currentTab: string;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-4.5 w-4.5" />,
    },
    {
      id: 'field',
      label: 'Field',
      icon: <Layers className="h-4.5 w-4.5" />,
    },
    {
      id: 'rotation',
      label: 'Crop Plan',
      icon: <RotateCcw className="h-4.5 w-4.5" />,
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: <Sun className="h-4.5 w-4.5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-white/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-200 dark:border-stone-800 dark:bg-[#0a0a0a]/95">
      <div className="mx-auto grid max-w-md grid-cols-4 items-center px-2 pt-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex min-h-[50px] flex-col items-center justify-center rounded-xl py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
              }`}
              aria-label={item.label}
            >
              <div className="flex items-center justify-center">{item.icon}</div>
              <span className="mt-1 font-montserrat text-[10.5px] tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;