import React from 'react';
import { SetMetadata } from '../types';
import { PlayCircle, ShieldCheck, AlertCircle, Eye, ChevronRight } from 'lucide-react';

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
}

export const SetCard: React.FC<SetCardProps> = ({ set, stats, onStart }) => {
  const progress = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = progress === 100;
  // High stakes logic: lots of learning cards but low mastery
  const isHighStakes = stats.learning > (stats.total * 0.4) && progress < 40;

  return (
    <div className={`group relative flex flex-col h-full rounded-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden
      backdrop-blur-xl bg-white/70 dark:bg-slate-900/60
      ${isMastered 
        ? 'border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
        : isHighStakes 
          ? 'border border-rose-400/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
          : 'border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-[var(--accent)]/50 hover:shadow-[0_20px_40px_-10px_rgba(var(--accent-glow),0.4)]'
      }`}
    >
      {/* Background Accent Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)]/0 to-[var(--accent-soft)]/0 group-hover:from-[var(--accent-soft)]/10 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Top Section */}
      <div className="p-6 flex flex-col flex-grow relative z-10 space-y-4">
        
        {/* Badge Row */}
        <div className="flex items-center justify-between">
           <span className={`font-mono text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider border transition-colors backdrop-blur-sm
             ${isMastered ? 'bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100/50 dark:border-emerald-900/30' : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 border-slate-200/50 dark:border-slate-700/50 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30'}
           `}>
             {set.np}
           </span>
           {isMastered && (
             <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm">
                <ShieldCheck size={12} />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Complete</span>
             </div>
           )}
           {isHighStakes && !isMastered && (
             <div className="flex items-center gap-1 text-rose-500 bg-rose-50/50 dark:bg-rose-900/20 px-2 py-1 rounded-lg border border-rose-100/50 dark:border-rose-900/30 backdrop-blur-sm">
                <AlertCircle size={12} />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Focus</span>
             </div>
           )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300 break-words hyphens-auto drop-shadow-sm">
            {set.setName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
            {set.setDescription}
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6 pt-0 mt-auto relative z-10 space-y-4">
        
        {/* Progress Bar & Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>{set.totalCards} Modules</span>
            <span className={`${progress > 0 ? 'text-[var(--accent)]' : ''}`}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isMastered ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onStart(set.setId)}
          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] group/btn shadow-lg
            ${isMastered 
              ? 'bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' 
              : 'bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 hover:scale-[1.02]'
            }`}
        >
          {isMastered ? <Eye size={14} /> : <PlayCircle size={14} />}
          <span>{isMastered ? 'Review' : 'Open'}</span>
          {!isMastered && <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />}
        </button>
      </div>
    </div>
  );
};