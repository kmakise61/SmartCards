import React from 'react';
import { GradeStatus } from '../types';
import { CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface TriageButtonsProps {
  onRate: (status: GradeStatus) => void;
  disabled?: boolean;
}

export const TriageButtons: React.FC<TriageButtonsProps> = ({ onRate, disabled }) => {
  const { settings } = useSettings();

  return (
    <div className="flex justify-center items-stretch gap-2 md:gap-4 w-full h-full">
      <button
        disabled={disabled}
        onClick={() => onRate('again')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-2xl bg-white dark:bg-darkcard border-2 border-slate-100 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-500/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 group overflow-hidden"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-1 md:mb-2 group-hover:scale-110 transition-transform">
          <RotateCcw size={20} />
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Again</span>
        {settings.showKeyboardHints && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-400 flex items-center justify-center">1</div>
        )}
      </button>

      <button
        disabled={disabled}
        onClick={() => onRate('hard')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-2xl bg-white dark:bg-darkcard border-2 border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 group overflow-hidden"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-1 md:mb-2 group-hover:scale-110 transition-transform">
          <HelpCircle size={20} />
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Hard</span>
        {settings.showKeyboardHints && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-400 flex items-center justify-center">2</div>
        )}
      </button>

      <button
        disabled={disabled}
        onClick={() => onRate('good')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-2xl bg-white dark:bg-darkcard border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 group overflow-hidden"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 mb-1 md:mb-2 group-hover:scale-110 transition-transform">
          <CheckCircle2 size={20} />
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Good</span>
        {settings.showKeyboardHints && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-400 flex items-center justify-center">3</div>
        )}
      </button>
    </div>
  );
};