import React, { useMemo } from 'react';
import { DeckConfig, MasteryStatus } from '../types';
import { adaptCards } from '../utils/adaptCards';
import { ArrowLeft, PlayCircle, Zap, Eye, Layout, AlertCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

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
  const allCards = useMemo(() => adaptCards(), []);
  const { progress } = useProgress();

  // Compute most missed for this specific deck using the context progress
  const mostMissed = useMemo(() => {
    return allCards
      .filter(c => c.category === deck.id)
      .map(c => ({ ...c, criticalCount: progress[c.id]?.criticalCount || 0 }))
      .filter(c => c.criticalCount > 0)
      .sort((a, b) => b.criticalCount - a.criticalCount)
      .slice(0, 3);
  }, [allCards, deck.id, progress]);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-darkcard rounded-[3rem] p-10 shadow-soft border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 dark:border-slate-800 pb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{deck.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg">{deck.description}</p>
          </div>
          <div className="w-20 h-20 rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-2xl font-black shadow-glow flex-shrink-0">
            {deck.id}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-200 dark:border-slate-700/50">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.unseen}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unseen</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl text-center border border-amber-200 dark:border-amber-900/30">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-500">{stats.learning}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl text-center border border-emerald-200 dark:border-emerald-900/30">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{stats.mastered}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastered</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Specialized Entry points</h4>
            
            <button 
              onClick={() => onStartSession(deck.id, ['unseen'])}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-[var(--accent)] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Unseen concepts</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{stats.unseen} new items</div>
                </div>
              </div>
              <PlayCircle size={18} className="text-slate-300 group-hover:text-[var(--accent)] transition-colors" />
            </button>

            <button 
              onClick={() => onStartSession(deck.id, ['learning'])}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-amber-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Active learning</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{stats.learning} cards in loop</div>
                </div>
              </div>
              <PlayCircle size={18} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
            </button>

            <button 
              onClick={() => onStartSession(deck.id)}
              className="w-full flex items-center justify-between p-5 bg-[var(--accent)] text-white rounded-2xl shadow-lg shadow-[var(--accent-glow)] hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layout size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Full Domain review</div>
                  <div className="text-[10px] text-white/70 font-bold uppercase tracking-tight">{stats.total} total items</div>
                </div>
              </div>
              <PlayCircle size={18} />
            </button>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Clinical Diagnostic history</h4>
             <div className="bg-slate-50 dark:bg-black/20 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 h-full min-h-[220px]">
                {mostMissed.length > 0 ? (
                  <div className="space-y-4">
                    {mostMissed.map(card => (
                      <div key={card.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 flex items-center justify-center text-xs font-black shadow-sm">
                          {card.criticalCount}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {card.question.replace(/\*\*/g, '')}
                        </p>
                      </div>
                    ))}
                    <p className="pt-4 text-[9px] font-bold text-slate-400 uppercase italic">
                      Prioritized for immediate reinforcement in "Learning" queues.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                      <AlertCircle size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">No stability issues recorded in this domain yet.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};