
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
        className="relative flex flex-col items-center justify-center flex-1 rounded-3xl 
          bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl 
          border border-white/40 dark:border-white/10 
          hover:border-amber-400 dark:hover:border-amber-500/50 
          hover:bg-amber-50/80 dark:hover:bg-amber-900/40 
          transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 group overflow-hidden py-2 sm:py-0"
      >
        <div className="absolute top-2 right-2 sm:top-3 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/50 dark:bg-white/10 text-[8px] sm:text-[10px] font-black flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors border border-white/20">1</div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100/50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform shadow-inner">
          <RotateCcw size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide sm:tracking-[0.2em] group-hover:text-amber-500 text-center leading-tight">
          Still Learning
        </span>
        <span className="text-[8px] sm:text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 text-center hidden min-[350px]:block opacity-80">
          Review at end
        </span>
      </button>

      <button
        disabled={disabled}
        onClick={() => onRate('good')}
        className="relative flex flex-col items-center justify-center flex-1 rounded-3xl 
          bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl 
          border border-white/40 dark:border-white/10 
          hover:border-emerald-400 dark:hover:border-emerald-500/50 
          hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 
          transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 group overflow-hidden py-2 sm:py-0"
      >
        <div className="absolute top-2 right-2 sm:top-3 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/50 dark:bg-white/10 text-[8px] sm:text-[10px] font-black flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors border border-white/20">3</div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform shadow-inner">
          <CheckCircle2 size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide sm:tracking-[0.2em] group-hover:text-emerald-500 text-center leading-tight">
          Know
        </span>
        <span className="text-[8px] sm:text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 text-center hidden min-[350px]:block opacity-80">
          Master & Continue
        </span>
      </button>
    </div>
  );
};
