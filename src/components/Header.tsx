import React from 'react';
import { Sprout, Volume2, VolumeX, Settings } from 'lucide-react';
import { NasaLogo } from './NasaLogo';

interface HeaderProps {
  locationName?: string;
  isFieldConfigured?: boolean;
  isPlayingBriefing?: boolean;
  onToggleBriefing?: () => void;
  onOpenSettings?: () => void;
  onOpenChatbot?: () => void;
  onOpenOnboarding?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onNavigateToField?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPlayingBriefing = false,
  onToggleBriefing,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top)] transition-colors duration-200 dark:border-stone-800/80 dark:bg-[#0a0a0a]/95">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-brand text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Green Roots
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50/80 px-2 py-0.5 text-[10px] font-montserrat font-bold text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
            <NasaLogo className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">NASA</span>
          </span>
        </div>

        {/* Right Actions: Voice Briefing & Settings Gear (Matches Figma Node 87:3) */}
        <div className="flex items-center gap-2">
          {onToggleBriefing && (
            <button
              type="button"
              onClick={onToggleBriefing}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                isPlayingBriefing
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-stone-200/90 bg-stone-50/90 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
              title={isPlayingBriefing ? 'Pause voice briefing' : 'Play audio field briefing'}
              aria-label="Toggle Audio Briefing"
            >
              {isPlayingBriefing ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                  </span>
                </>
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-stone-50/90 text-stone-700 transition-all hover:bg-stone-100 active:scale-95 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-800"
              title="Farm Settings & System Preferences"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;