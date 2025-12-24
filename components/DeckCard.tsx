
import React from 'react';
import { DeckConfig, DeckId } from '../types';
import { Info, Stethoscope, Activity, ArrowRight, Zap, ShieldCheck, Waves, HeartPulse, Brain, BookOpen } from 'lucide-react';

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
  layout?: 'grid' | 'list';
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, stats, onStart, onView, layout = 'grid' }) => {
  const progress = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  const renderDeckLogo = (id: DeckId) => {
    switch (id) {
      case 'NP1': return <Waves size={28} strokeWidth={2} />;
      case 'NP2': return <HeartPulse size={28} strokeWidth={2} />;
      case 'NP3': return <Activity size={28} strokeWidth={2} />;
      case 'NP4': return <Stethoscope size={28} strokeWidth={2} />;
      case 'NP5': return <Brain size={28} strokeWidth={2} />;
      case 'PHARM_LABS': return <Zap size={28} strokeWidth={2} />;
      case 'PRIO_DEL': return <ShieldCheck size={28} strokeWidth={2} />;
      default: return <BookOpen size={28} strokeWidth={2} />;
    }
  };

  // --- LIST LAYOUT (Desktop Optimized) ---
  if (layout === 'list') {
    return (
      <div className="group relative flex flex-col md:flex-row items-stretch md:items-center rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md 
        border border-slate-200/60 dark:border-white/5 
        hover:border-[var(--accent)]/30 hover:shadow-xl hover:shadow-[var(--accent-glow)]
        p-4 md:p-5 gap-6 md:h-32
      ">
        {/* Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon Section */}
        <div className="flex items-center gap-4 shrink-0 md:w-20 justify-center md:justify-start pl-2">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)' }}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-10 transition-opacity" />
            {renderDeckLogo(deck.id)}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex flex-wrap items-center gap-3">
             <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
               {deck.id}
             </span>
             <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white leading-tight truncate group-hover:text-[var(--accent)] transition-colors">
               {deck.title}
             </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 text-pretty pr-4">
            {deck.description}
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-2 shrink-0 md:w-48 md:border-l border-slate-100 dark:border-white/5 md:pl-6">
           
           {/* Progress (Hidden on tiny screens, shown on md+) */}
           <div className="w-full space-y-1.5">
              <div className="flex justify-between items-end">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mastery</span>
                 <span className="text-xs font-black text-[var(--accent)]">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--accent-glow),0.8)]" 
                   style={{ width: `${progress}%` }} 
                 />
              </div>
           </div>

           <div className="flex gap-2 w-full">
             <button 
               onClick={() => onStart(deck.id)}
               className="flex-1 py-2 rounded-xl bg-[var(--accent)] hover:brightness-110 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] transition-all active:scale-95"
             >
               Start
             </button>
             <button 
               onClick={() => onView(deck.id)}
               className="w-10 h-auto rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
             >
               <Info size={16} />
             </button>
           </div>
        </div>
      </div>
    );
  }

  // --- GRID LAYOUT (Default & Mobile Standard) ---
  return (
    <div className="group relative flex flex-col h-full min-h-[280px] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2
      bg-white dark:bg-darkcard 
      border border-slate-100 dark:border-white/5
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      hover:shadow-2xl hover:shadow-[var(--accent-glow)]
      hover:border-[var(--accent)]/30
    ">
      {/* Background Gradient Splash */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-soft)]/20 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      
      <div className="p-7 flex flex-col flex-grow relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
            style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)' }}
          >
            {renderDeckLogo(deck.id)}
          </div>
          <span className="inline-block px-3 py-1 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-white/5 group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)] transition-colors">
             {deck.id}
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
            {deck.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 text-pretty">
            {deck.description}
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-7 pt-0 mt-auto relative z-10 space-y-6">
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {stats.total} Modules</span>
            <span className={progress > 0 ? 'text-[var(--accent)]' : ''}>{progress}% Mastered</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out shadow-[0_0_12px_var(--accent)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => onStart(deck.id)}
            className="flex-1 py-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-slate-900 dark:hover:text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--accent-glow)] transition-all active:scale-95 group/btn"
          >
            Study <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onView(deck.id)}
            className="w-14 h-auto rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all active:scale-95 bg-transparent"
            title="View Details"
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
