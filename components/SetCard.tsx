
import React from 'react';
import { SetMetadata } from '../types';
import { PlayCircle, ShieldCheck, AlertCircle, Eye, ChevronRight, CheckCircle2, Zap } from 'lucide-react';

interface SetCardProps {
  set: SetMetadata;
  stats: {
    total: number;
    unseen: number;
    learning: number;
    mastered: number;
    criticalCount?: number;
  };
  onStart: (setId: string) => void;
  layout?: 'grid' | 'list';
}

export const SetCard: React.FC<SetCardProps> = ({ set, stats, onStart, layout = 'grid' }) => {
  const progress = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = progress === 100;
  const isHighStakes = stats.learning > (stats.total * 0.4) && progress < 40;

  // --- LIST LAYOUT (Desktop Optimized) ---
  if (layout === 'list') {
    return (
      <div className="group relative flex flex-col md:flex-row items-stretch md:items-center rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md 
        border border-slate-200/60 dark:border-slate-800 
        hover:border-[var(--accent)]/30 hover:shadow-xl hover:shadow-[var(--accent-glow)]
        p-4 gap-6 md:h-24
      ">
        {/* Progress Bar (Vertical on left) */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100 dark:bg-slate-800">
           <div 
             className={`w-full transition-all duration-1000 ease-out ${isMastered ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`} 
             style={{ height: `${progress}%` }} 
           />
        </div>

        {/* Status Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ml-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-400 group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)] transition-colors">
           {isMastered ? <ShieldCheck size={20} className="text-emerald-500" /> : (
             isHighStakes ? <AlertCircle size={20} className="text-rose-500" /> : <Zap size={20} />
           )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3">
             <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight group-hover:text-[var(--accent)] transition-colors truncate">
               {set.setName}
             </h3>
             {isMastered && <span className="hidden md:inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase rounded">Complete</span>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-3xl">
            {set.setDescription}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end justify-center w-24 shrink-0">
           <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{progress}%</span>
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stats.total} items</span>
        </div>

        {/* Actions */}
        <button 
          onClick={() => onStart(set.setId)}
          className={`h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-sm
            ${isMastered 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700' 
              : 'bg-[var(--accent)] hover:brightness-110 text-white shadow-[var(--accent-glow)]'
            }`}
        >
          {isMastered ? 'Review' : 'Start'} <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // --- GRID LAYOUT ---
  return (
    <div className={`group relative flex flex-col h-full min-h-[220px] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2
      bg-white dark:bg-darkcard 
      border border-slate-100 dark:border-white/5
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      hover:shadow-2xl hover:shadow-[var(--accent-glow)]
      hover:border-[var(--accent)]/30
    `}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[var(--accent-soft)]/30 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

      <div className="p-7 flex flex-col flex-grow relative z-10 space-y-5">
        
        {/* Header Badges */}
        <div className="flex justify-between items-start">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300
             ${isMastered 
               ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' 
               : isHighStakes 
                 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' 
                 : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-[var(--accent)] group-hover:text-white'
             }`}>
             {isMastered ? <CheckCircle2 size={20} /> : isHighStakes ? <AlertCircle size={20} /> : <Zap size={20} />}
           </div>
           
           {isMastered && (
             <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
               Completed
             </span>
           )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300 line-clamp-2">
            {set.setName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 text-pretty">
            {set.setDescription}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-7 pt-0 mt-auto relative z-10 space-y-5">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Progress</span>
            <span className={isMastered ? 'text-emerald-500' : 'text-[var(--accent)]'}>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isMastered ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Button */}
        <button 
          onClick={() => onStart(set.setId)}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg group/btn
            ${isMastered 
              ? 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 hover:text-[var(--accent)] hover:border-[var(--accent)]' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] dark:hover:text-white shadow-[var(--accent-glow)]'
            }`}
        >
          {isMastered ? <Eye size={16} /> : <PlayCircle size={16} />}
          <span>{isMastered ? 'Review' : 'Start'}</span>
          {!isMastered && <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
