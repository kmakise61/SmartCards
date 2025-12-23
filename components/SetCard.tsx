
import React from 'react';
import { SetMetadata } from '../types';
import { PlayCircle, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const isHighStakes = stats.learning > (stats.total * 0.4) && progress < 40;

  return (
    <div className={`group bg-white/40 dark:bg-slate-800/10 backdrop-blur-sm rounded-[2rem] p-6 border transition-all flex flex-col h-full relative overflow-hidden 
      hover:-translate-y-1 ${isMastered ? 'border-emerald-500/30' : isHighStakes ? 'border-rose-400/40' : 'border-slate-100 dark:border-slate-800 hover:border-[var(--accent)]/50'}`}>
      
      {isMastered && (
        <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-white rounded-bl-2xl shadow-sm z-10">
          <ShieldCheck size={14} />
        </div>
      )}

      {isHighStakes && !isMastered && (
        <div className="absolute top-0 right-0 p-2 bg-rose-500 text-white rounded-bl-2xl shadow-sm z-10 flex items-center gap-1">
          <AlertCircle size={12} />
          <span className="text-[7px] font-black uppercase">Crit</span>
        </div>
      )}

      <div className="flex flex-col flex-grow space-y-3 mb-6">
        <div className="flex items-center gap-2">
           <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{set.np}</span>
           <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 uppercase tracking-tight">
          {set.setName}
        </h3>
        
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
          {set.setDescription}
        </p>
      </div>

      <div className="mt-auto space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{set.totalCards} Modules</span>
            <span className={`text-[9px] font-mono font-black ${isMastered ? 'text-emerald-500' : isHighStakes ? 'text-rose-500' : 'text-[var(--accent)]'}`}>
              {progress}%
            </span>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isMastered ? 'bg-emerald-500' : isHighStakes ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} 
              style={{ 
                width: `${progress}%`,
                boxShadow: progress > 0 ? `0 0 8px ${isMastered ? '#10b981' : isHighStakes ? '#f43f5e' : 'var(--accent)'}` : 'none'
              }} 
            />
          </div>
        </div>

        <button 
          onClick={() => onStart(set.setId)}
          className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 border
            ${isMastered ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-500/20' : 
              isHighStakes ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-500 border-rose-500/20' : 
              'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
        >
          <PlayCircle size={12} />
          {isMastered ? 'Module Done' : 'Start Path'}
        </button>
      </div>
    </div>
  );
};
