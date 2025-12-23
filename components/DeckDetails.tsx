
import React, { useMemo } from 'react';
import { DeckConfig, MasteryStatus } from '../types';
import { ArrowLeft, PlayCircle, Zap, Eye, Layout, Layers } from 'lucide-react';

interface DeckDetailsProps {
  deck: DeckConfig;
  stats: {
    total: number;
    unseen: number;
    learning: number;
    mastered: number;
  };
  onBack: () => void;
  onStartSession: (deckId: string, mastery?: MasteryStatus[]) => void;
}

export const DeckDetails: React.FC<DeckDetailsProps> = ({ deck, stats, onBack, onStartSession }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-fade-in space-y-8 pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-darkcard rounded-[3rem] p-8 md:p-12 shadow-soft border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-[100px] -z-10 pointer-events-none opacity-50" />

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--accent)]/20">
                 {deck.id}
               </span>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                 <Layers size={12} /> {stats.total} Concepts
               </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">{deck.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl text-sm md:text-base">{deck.description}</p>
          </div>
          <div className="hidden md:flex w-24 h-24 rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)] items-center justify-center text-3xl font-black shadow-glow flex-shrink-0 border border-[var(--accent)]/20 backdrop-blur-sm">
            {deck.id.slice(0, 2)}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.unseen}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-slate-300"></span> Unseen
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl text-center border border-amber-200 dark:border-amber-900/30 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-500">{stats.learning}</div>
            <div className="text-[10px] font-black text-amber-600/70 dark:text-amber-500/60 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-500"></span> Learning
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl text-center border border-emerald-200 dark:border-emerald-900/30 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{stats.mastered}</div>
            <div className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Mastered
            </div>
          </div>
        </div>

        {/* ENTRY POINTS - Responsive Layout */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Select Validation Mode</h4>
          
          {/* 
             Mobile: Stacked (grid-cols-1)
             Tablet/Desktop: Horizontal Grid (grid-cols-3) 
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Unseen Mode */}
            <button 
              onClick={() => onStartSession(deck.id, ['unseen'])}
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye size={24} />
              </div>
              <div className="font-bold text-base text-slate-900 dark:text-white mb-1">New Concepts</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-4">
                {stats.unseen} Items Available
              </div>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:underline">
                Launch <PlayCircle size={12} />
              </div>
            </button>

            {/* 2. Active Learning Mode */}
            <button 
              onClick={() => onStartSession(deck.id, ['learning'])}
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <div className="font-bold text-base text-slate-900 dark:text-white mb-1">Active Loop</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-4">
                {stats.learning} Items in Progress
              </div>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:underline">
                Resume <PlayCircle size={12} />
              </div>
            </button>

            {/* 3. Full Review Mode */}
            <button 
              onClick={() => onStartSession(deck.id)}
              className="flex flex-col items-center text-center p-6 bg-[var(--accent)] text-white rounded-[2rem] shadow-xl shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Layout size={24} />
              </div>
              <div className="font-bold text-base text-white mb-1">Full Review</div>
              <div className="text-[10px] text-white/80 font-bold uppercase tracking-wide mb-4">
                {stats.total} Total Items
              </div>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:underline">
                Start All <PlayCircle size={12} />
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
