
import React from 'react';
import { DeckConfig, DeckId } from '../types';
import { PlayCircle, Info, Stethoscope, Activity } from 'lucide-react';

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
  const progress = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;

  const renderDeckLogo = (id: DeckId) => {
    switch (id) {
      case 'PHARM_LABS': return <Stethoscope size={20} />;
      case 'PRIO_DEL': return <Activity size={20} />;
      default: return <span className="text-sm font-mono font-black">{id}</span>;
    }
  };

  return (
    <div className="relative h-full transition-all duration-500 hover:-translate-y-2 group">
      {/* Visual background glow on hover */}
      <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-5 blur-[40px] transition-opacity duration-700 rounded-[2.5rem]" />
      
      <div className="h-full bg-white/60 dark:bg-slate-800/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 dark:border-slate-700/30 group-hover:border-[var(--accent)]/50 transition-all duration-300 flex flex-col relative overflow-hidden shadow-soft group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
        
        <div className="flex justify-between items-start mb-8">
          <div className="min-w-0 pr-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight group-hover:text-[var(--accent)] transition-colors">{deck.title}</h3>
            <div className="flex items-center gap-2">
               <span className="font-mono text-[10px] text-[var(--accent)] font-bold tracking-tighter bg-[var(--accent-soft)] px-2 py-0.5 rounded uppercase">{deck.id}</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stats.total} Modules</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-[var(--accent)] group-hover:scale-110 transition-all shadow-sm border border-slate-100 dark:border-slate-700/50">
            {renderDeckLogo(deck.id)}
          </div>
        </div>

        <div className="mt-auto space-y-8">
          <div className="relative">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Status</span>
              <span className="text-xs font-mono font-black text-[var(--accent)]">{Math.round(progress)}%</span>
            </div>
            {/* Neon Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000 relative" 
                style={{ 
                  width: `${progress}%`,
                  boxShadow: `0 0 10px var(--accent), 0 0 5px var(--accent)` 
                }} 
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onStart(deck.id)}
              className="flex-1 bg-[var(--accent)] text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(var(--accent-glow),0.3)]"
            >
              Launch Module
            </button>
            <button 
              onClick={() => onView(deck.id)}
              className="w-14 h-14 bg-white/50 dark:bg-slate-800/50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:text-[var(--accent)] transition-all border border-slate-100 dark:border-slate-700/50 shadow-sm"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
