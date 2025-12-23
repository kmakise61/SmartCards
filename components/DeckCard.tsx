
import React from 'react';
import { DeckConfig, DeckId } from '../types';
import { Info, Stethoscope, Activity, ArrowRight, Zap, ShieldCheck, Waves, HeartPulse, Brain } from 'lucide-react';

interface DeckCardProps {
  deck: DeckConfig;
  stats: {
    total: number;
    unseen: number;
    learning: number;
    mastered: number;
  };
  onStart: (deckId: string) => void;
  onView: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, stats, onStart, onView }) => {
  const progress = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  const renderDeckLogo = (id: DeckId) => {
    switch (id) {
      case 'NP1': return <Waves size={22} />;
      case 'NP2': return <HeartPulse size={22} />;
      case 'NP3': return <Activity size={22} />;
      case 'NP4': return <Stethoscope size={22} />;
      case 'NP5': return <Brain size={22} />;
      case 'PHARM_LABS': return <Zap size={22} />;
      case 'PRIO_DEL': return <ShieldCheck size={22} />;
      default: return <span className="text-xs font-black">{id}</span>;
    }
  };

  return (
    <div className="group relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1
      bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl 
      border border-slate-200 dark:border-white/10 
      shadow-soft hover:border-[var(--accent)]/50 hover:shadow-lg
    ">
      <div className="p-5 flex flex-col flex-grow relative z-10 space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
            {renderDeckLogo(deck.id)}
          </div>
          <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-white/5 group-hover:text-[var(--accent)] transition-all">
             {deck.id}
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
            {deck.title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
            {deck.description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto relative z-10 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
            <span>{stats.total} Modules</span>
            <span className="text-[var(--accent)]">{progress}% Mastery</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onStart(deck.id)}
            className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:brightness-110 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-[var(--accent-glow)] transition-all group/btn"
          >
            Launch <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
          <button 
            onClick={() => onView(deck.id)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
            title="View Details"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
