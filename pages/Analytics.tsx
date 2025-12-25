
import React, { useMemo, useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { DECK_LIST } from '../data/deck_config';
import { SessionFilters, MasteryStatus, QuizSessionRecord } from '../types';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight,
  RefreshCw,
  History,
  X,
  Award,
  Activity,
  Target
} from 'lucide-react';
import { db } from '../utils/db';

interface DeckStats {
  total: number;
  unseen: number;
  learning: number;
  mastered: number;
  label: string;
  id: string;
}

export const Analytics: React.FC<{ onStartSession?: (filters: SessionFilters) => void }> = ({ onStartSession }) => {
  const { allCards, progress, getCardMastery, dailyStats } = useProgress();
  const [quizHistory, setQuizHistory] = useState<QuizSessionRecord[]>([]);
  const [selectedDeckDetails, setSelectedDeckDetails] = useState<DeckStats | null>(null);

  useEffect(() => {
    db.loadQuizSessions().then(recs => setQuizHistory(recs.sort((a, b) => b.date - a.date)));
  }, []);

  const stats = useMemo(() => {
    let totalSeen = 0, totalMastered = 0, totalLearning = 0, totalCritical = 0;
    const deckBreakdown: Record<string, DeckStats> = {};
    const criticalCards: any[] = [];
    const learningCardIds: string[] = [];

    DECK_LIST.forEach(d => {
      deckBreakdown[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0, label: d.title, id: d.id };
    });

    allCards.forEach(card => {
      const record = progress[card.id];
      const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
      
      if (record?.criticalCount && record.criticalCount >= 3) {
        totalCritical++;
        criticalCards.push({ ...card, criticalCount: record.criticalCount, mastery });
      }

      if (deckBreakdown[card.category]) {
        deckBreakdown[card.category].total++;
        deckBreakdown[card.category][mastery]++;
      }

      if (record?.seen) {
        totalSeen++;
        if (mastery === 'mastered') totalMastered++;
        if (mastery === 'learning') {
          totalLearning++;
          learningCardIds.push(card.id);
        }
      }
    });

    criticalCards.sort((a, b) => b.criticalCount - a.criticalCount);

    return { 
      totalCards: allCards.length, 
      totalSeen, 
      totalMastered, 
      totalLearning, 
      totalCritical, 
      deckBreakdown, 
      criticalCards: criticalCards.slice(0, 5),
      learningCardIds 
    };
  }, [allCards, progress, getCardMastery]);

  const retentionRate = stats.totalSeen > 0 ? Math.round((stats.totalMastered / stats.totalSeen) * 100) : 0;

  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString('en-CA');
      const count = dailyStats.history[key] || 0;
      days.push({ key, count });
    }
    return days;
  }, [dailyStats.history]);

  // Direct study launcher for the modal categories
  const launchDeckSubset = (type: 'weak' | 'maintenance') => {
    if (!selectedDeckDetails) return;
    
    const targetIds = allCards.filter(c => {
      if (c.category !== selectedDeckDetails.id) return false;
      const record = progress[c.id];
      const m = getCardMastery(!!record?.seen, record?.goodCount || 0);
      return type === 'weak' ? (m === 'learning' || m === 'unseen') : (m === 'mastered');
    }).map(c => c.id);

    if (targetIds.length > 0) {
      onStartSession?.({ cardIds: targetIds, shuffle: true });
      setSelectedDeckDetails(null);
    }
  };

  return (
    <div className="relative h-full overflow-y-auto no-scrollbar bg-slate-50/30 dark:bg-transparent">
      <div className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-32">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-1">
               <TrendingUp size={12} /> Local Clinical Intelligence
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-indigo-600">Analytics</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              Real-time validation tracking for {stats.totalCards} clinical concepts.
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm items-center gap-6">
             <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{dailyStats.streak}</div>
                <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Day Streak</div>
             </div>
             <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
             <div className="text-center">
                <div className="text-2xl font-black text-[var(--accent)]">{dailyStats.count}</div>
                <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Today</div>
             </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Retention', val: `${retentionRate}%`, sub: 'Recall Stability', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
            { label: 'Mastered', val: stats.totalMastered, sub: 'Board Ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
            { label: 'Learning', val: stats.totalLearning, sub: 'Active Buffer', icon: RefreshCw, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
            { label: 'Leeches', val: stats.totalCritical, sub: 'Repeat Errors', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-darkcard p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-soft group hover:-translate-y-1 transition-all">
               <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-4`}>
                  <kpi.icon size={20} />
               </div>
               <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-0.5">{kpi.val}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
               <div className="text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-tighter mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-darkcard p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Validation Domain Matrix</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Tap a domain to launch targeted remediation.</p>
              </div>
              <button 
                onClick={() => onStartSession?.({ cardIds: stats.learningCardIds, shuffle: true })} 
                className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline"
              >
                Recall Weak Areas <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              {(Object.values(stats.deckBreakdown) as DeckStats[]).map((deck) => {
                if (deck.total === 0) return null;
                const masteredPct = Math.round((deck.mastered / deck.total) * 100);
                const learningPct = Math.round((deck.learning / deck.total) * 100);
                return (
                  <div key={deck.id} className="group cursor-pointer" onClick={() => setSelectedDeckDetails(deck)}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-300 group-hover:text-[var(--accent)] transition-colors">{deck.id}</span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{deck.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{masteredPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-100 dark:border-slate-800">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${masteredPct}%` }} />
                      <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${learningPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-darkcard p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Validation Intensity</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Past 28 Days Recall Log</p>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-7 gap-2">
                {heatmapDays.map((day, i) => {
                  let opacity = 'bg-slate-100 dark:bg-slate-800';
                  if (day.count > 0) opacity = 'bg-[var(--accent-soft)] opacity-40';
                  if (day.count > 10) opacity = 'bg-[var(--accent-soft)] opacity-70';
                  if (day.count > 30) opacity = 'bg-[var(--accent)] opacity-80';
                  if (day.count > 50) opacity = 'bg-[var(--accent)]';
                  return <div key={i} className={`aspect-square rounded-md transition-all duration-500 ${opacity}`} title={`${day.key}: ${day.count} cards`} />;
                })}
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <span>4 Weeks Ago</span>
                <span>Today</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <Calendar size={16} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">Consistency Score</div>
                    <div className="text-[10px] font-medium text-slate-500">Stability through routine.</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-rose-50/50 dark:bg-rose-900/5 p-8 rounded-[3rem] border border-rose-100/50 dark:border-rose-900/10">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                       <AlertTriangle size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Critical Audit</h3>
                       <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Mastery Leech Detection</p>
                    </div>
                 </div>
                 {stats.criticalCards.length > 0 && (
                   <button onClick={() => onStartSession?.({ cardIds: stats.criticalCards.map(c => c.id) })} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all">
                     Remediate All
                   </button>
                 )}
              </div>

              <div className="space-y-3">
                 {stats.criticalCards.length > 0 ? (
                   stats.criticalCards.map(card => (
                    <button key={card.id} onClick={() => onStartSession?.({ cardIds: [card.id] })} className="w-full text-left p-4 bg-white dark:bg-darkcard/60 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-all group flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block mb-1">{card.category}</span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{card.question.replace(/\*\*/g, '').replace(/{{.*?}}/g, '___')}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end">
                        <span className="text-[10px] font-black text-rose-600">Failed {card.criticalCount}x</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                   ))
                 ) : (
                   <div className="py-12 text-center text-slate-400">
                      <CheckCircle2 size={40} className="mx-auto mb-4 opacity-20 text-emerald-500" />
                      <p className="text-xs font-bold uppercase tracking-widest">Baseline Stabilized</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-white dark:bg-darkcard p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                         <History size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Validation Log</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Active Recall</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[350px]">
                   {quizHistory.length > 0 ? (
                     quizHistory.slice(0, 6).map(rec => (
                       <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-400 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rec.score >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                <Zap size={16} />
                             </div>
                             <div>
                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{rec.deckId} Session</div>
                                <div className="text-[9px] font-bold text-slate-400">{new Date(rec.date).toLocaleDateString()} • {rec.totalItems} Cards</div>
                             </div>
                          </div>
                          <div className={`text-lg font-black tabular-nums ${rec.score >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>{rec.score}%</div>
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <Activity size={48} strokeWidth={1} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">No Logs Found</p>
                     </div>
                   )}
                </div>
              </div>
           </div>
        </div>
      </div>

      {selectedDeckDetails && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedDeckDetails(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-darkcard rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-full overflow-y-auto no-scrollbar flex flex-col items-center">
            <button onClick={() => setSelectedDeckDetails(null)} className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
            <div className="text-center w-full mb-8">
               <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{selectedDeckDetails.id} Audit</div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedDeckDetails.label}</h2>
            </div>
            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8 flex-shrink-0">
               {(() => {
                 const percentage = Math.round((selectedDeckDetails.mastered / selectedDeckDetails.total) * 100);
                 const radius = 40, circumference = 2 * Math.PI * radius, offset = circumference - (percentage / 100) * circumference;
                 return (
                   <div className="w-full h-full relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{percentage}%</span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Mastery</span>
                      </div>
                   </div>
                 );
               })()}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mb-8">
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-black text-slate-900 dark:text-white">{selectedDeckDetails.unseen}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unseen</div>
               </div>
               <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-center">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-500">{selectedDeckDetails.learning}</div>
                  <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">In Progress</div>
               </div>
            </div>
            <div className="w-full space-y-3">
               <button onClick={() => launchDeckSubset('weak')} className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
                 <Zap size={16} /> Rapid Recall
               </button>
               <button onClick={() => launchDeckSubset('maintenance')} className="w-full py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[var(--accent)] transition-all active:scale-95">
                 <RefreshCw size={16} /> Random Maintenance
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
