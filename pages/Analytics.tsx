
import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { DECK_LIST, DECKS } from '../data/deck_config';
import { SessionFilters } from '../types';
import { PieChart, TrendingUp, AlertTriangle, CheckCircle2, Circle, Activity, Info, PlayCircle } from 'lucide-react';

interface DeckStats {
  total: number;
  unseen: number;
  learning: number;
  mastered: number;
  label: string;
}

interface AnalyticsProps {
  onStartSession?: (filters: SessionFilters) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onStartSession }) => {
  const { allCards, progress, getCardMastery } = useProgress();

  const stats = useMemo(() => {
    let totalSeen = 0;
    let totalMastered = 0;
    let totalLearning = 0;
    let totalCritical = 0;
    const deckBreakdown: Record<string, DeckStats> = {};
    const criticalCards: typeof allCards = [];

    // Initialize Breakdown
    DECK_LIST.forEach(d => {
      deckBreakdown[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0, label: d.id };
    });

    allCards.forEach(card => {
      const record = progress[card.id];
      const seen = !!record?.seen;
      const goodCount = record?.goodCount || 0;
      const mastery = getCardMastery(seen, goodCount);
      
      // Critical check (rated 'Again' more than 2 times)
      if (record?.criticalCount && record.criticalCount > 2) {
        totalCritical++;
        criticalCards.push({ ...card, criticalCount: record.criticalCount });
      }

      if (deckBreakdown[card.category]) {
        deckBreakdown[card.category].total++;
        deckBreakdown[card.category][mastery]++;
      }

      if (seen) {
        totalSeen++;
        if (mastery === 'mastered') totalMastered++;
        if (mastery === 'learning') totalLearning++;
      }
    });

    // Sort critical cards by count descending
    criticalCards.sort((a, b) => (b.criticalCount || 0) - (a.criticalCount || 0));

    return { 
      totalCards: allCards.length, 
      totalSeen, 
      totalMastered, 
      totalLearning, 
      totalCritical,
      deckBreakdown,
      criticalCards: criticalCards.slice(0, 10) // Show top 10
    };
  }, [allCards, progress, getCardMastery]);

  const retentionRate = stats.totalSeen > 0 ? Math.round((stats.totalMastered / stats.totalSeen) * 100) : 0;

  return (
    <div className="p-4 md:p-10 max-w-[1500px] mx-auto space-y-10 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="text-[var(--accent)]" size={32} />
          Performance Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Deep dive into your learning velocity, domain mastery, and critical focus areas.
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retention Rate</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{retentionRate}%</div>
            <div className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
              <CheckCircle2 size={12} /> Mastered vs Seen
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform">
            <PieChart size={80} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Concepts</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalLearning}</div>
            <div className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1">
              <Activity size={12} /> Currently Learning
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-4 opacity-5 text-amber-500 group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cards Mastered</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalMastered}</div>
            <div className="text-xs text-slate-400 font-bold mt-2">
              Out of {stats.totalCards} total
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-4 opacity-5 text-[var(--accent)] group-hover:scale-110 transition-transform">
            <CheckCircle2 size={80} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Items</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalCritical}</div>
            <div className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Needs Review
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-4 opacity-5 text-rose-500 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Domain Performance Bars */}
        <div className="lg:col-span-2 bg-white dark:bg-darkcard p-8 rounded-[2.5rem] shadow-soft border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8">Domain Mastery</h3>
          <div className="space-y-6">
            {Object.values(stats.deckBreakdown).map((deck: DeckStats) => {
              if (deck.total === 0) return null;
              const unseenPct = (deck.unseen / deck.total) * 100;
              const learningPct = (deck.learning / deck.total) * 100;
              const masteredPct = (deck.mastered / deck.total) * 100;

              return (
                <div key={deck.label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider">{deck.label}</span>
                    <span className="text-[var(--accent)]">{Math.round(masteredPct)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} title={`Mastered: ${deck.mastered}`} />
                    <div className="h-full bg-amber-400" style={{ width: `${learningPct}%` }} title={`Learning: ${deck.learning}`} />
                    {/* Unseen is transparent/background */}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 justify-center mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> Learning</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" /> Unseen</div>
          </div>
        </div>

        {/* Trouble Spots List */}
        <div className="bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Trouble Spots</h3>
            </div>
            {stats.criticalCards.length > 0 && onStartSession && (
              <button 
                onClick={() => onStartSession({ cardIds: stats.criticalCards.map(c => c.id) })}
                className="text-[10px] font-black uppercase text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                Review All <PlayCircle size={12} />
              </button>
            )}
          </div>
          
          {stats.criticalCards.length > 0 ? (
            <div className="space-y-4">
              {stats.criticalCards.map((card) => (
                <button 
                  key={card.id} 
                  onClick={() => onStartSession && onStartSession({ cardIds: [card.id] })}
                  className="w-full text-left bg-white dark:bg-darkcard p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.category}</span>
                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded group-hover:bg-rose-100 transition-colors">
                      Failed {card.criticalCount}x
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2">
                    {card.question.replace(/\*\*/g, '')}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 size={40} className="mx-auto mb-4 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">No critical items detected</p>
              <p className="text-[10px] mt-2">Great job maintaining stability!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
