
import React from 'react';
import { ViewState } from '../types';
import { Moon, Sun, Calendar, Settings, Menu } from 'lucide-react';

interface TopbarProps {
  currentView: ViewState;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentView, theme, toggleTheme, onOpenSettings }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 bg-gray-50/90 dark:bg-darkbg/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
          {currentView}
        </h2>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <Calendar size={12} className="text-[var(--accent)]" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
            <button 
                onClick={toggleTheme}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button 
                onClick={onOpenSettings}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="Settings"
            >
                <Settings size={18} />
            </button>

             <button className="hidden md:block w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm relative group transition-transform active:scale-95">
                <img src="https://picsum.photos/seed/nurse/200" alt="User Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
             </button>
        </div>
      </div>
    </header>
  );
};
