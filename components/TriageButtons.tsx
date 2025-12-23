import React from 'react';
import { GradeStatus } from '../types';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface TriageButtonsProps {
  onRate: (status: GradeStatus) => void;
  disabled?: boolean;
}

export const TriageButtons: React.FC<TriageButtonsProps> = ({ onRate, disabled }) => {
  return (
    <div className="flex justify-center items-stretch gap-2 sm:gap-4 w-full h-full max-w-2xl mx-auto px-2 sm:px-0">
      <button
        disabled={disabled}
        onClick={() => onRate('again')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-3xl bg-white dark:bg-darkcard border-2 border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all shadow-sm active:scale-95 disabled:opacity-50 group overflow-hidden py-2 sm:py-0"
      >
        <div className="absolute top-2 right-2 sm:top-3 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] sm:text-[10px] font-black flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors border border-slate-200 dark:border-slate-700">1</div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform shadow-inner">
          <RotateCcw size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide sm:tracking-[0.2em] group-hover:text-amber-500 text-center leading-tight">
          Still Learning
        </span>
        <span className="text-[8px] sm:text-[9px] font-medium text-slate-400 mt-0.5 sm:mt-1 text-center hidden min-[350px]:block">
          Review at end
        </span>
      </button>

      <button
        disabled={disabled}
        onClick={() => onRate('good')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-3xl bg-white dark:bg-darkcard border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all shadow-sm active:scale-95 disabled:opacity-50 group overflow-hidden py-2 sm:py-0"
      >
        <div className="absolute top-2 right-2 sm:top-3 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] sm:text-[10px] font-black flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors border border-slate-200 dark:border-slate-700">3</div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform shadow-inner">
          <CheckCircle2 size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide sm:tracking-[0.2em] group-hover:text-emerald-500 text-center leading-tight">
          Know
        </span>
        <span className="text-[8px] sm:text-[9px] font-medium text-slate-400 mt-0.5 sm:mt-1 text-center hidden min-[350px]:block">
          Master & Continue
        </span>
      </button>
    </div>
  );
};