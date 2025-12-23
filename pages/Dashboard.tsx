
import React, { useMemo } from 'react';
import { adaptCards } from '../utils/adaptCards';
import { MasteryStatus, DeckId, DeckConfig } from '../types';
import { DECK_LIST } from '../data/deck_config';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Trophy,
  Stethoscope,
  ArrowRight,
  Filter,
  Brain,
  HeartPulse,
  Waves
} from 'lucide-react';

interface DashboardProps {
  onStartSession: (filters?: { mastery?: MasteryStatus[], deckId?: DeckId, setId?: string }, resume?: boolean) => void;
}

/**
 * Derives comprehensive dashboard metrics from raw cards and progress records.
 */
const calculateDashboardStats = (
  allCards: any[], 
  progress: Record<string, any>, 
  getCardMastery: (seen: boolean, goodCount: number) => MasteryStatus
) => {
  const metrics: Record<string, { total: number; unseen: number; learning: number; mastered: number; progress: number }> = {};
  
  DECK_LIST.forEach(d => {
    metrics[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0, progress: 0 };
  });

  allCards.forEach(card => {
    const deckId = card.category;
    if (metrics[deckId]) {
      metrics[deckId].total++;
      const record = progress[card.id];
      const status = getCardMastery(!!record?.seen, record?.goodCount || 0);
      metrics[deckId][status]++;
    }
  });

  Object.keys(metrics).forEach(id => {
    const m = metrics[id];
    m.progress = m.total > 0 ? Math.round((m.mastered / m.total) * 100) : 0;
  });

  let totalCards = 0;
  let masteredCount = 0;
  let seenCount = 0;

  allCards.forEach(card => {
    totalCards++;
    const record = progress[card.id];
    if (record?.seen) {
      seenCount++;
      if (getCardMastery(true, record.goodCount) === 'mastered') {
        masteredCount++;
      }
    }
  });

  const overallMastery = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  let rank = "Novice";
  if (overallMastery > 85) rank = "Expert";
  else if (overallMastery > 60) rank = "Proficient";
  else if (overallMastery > 30) rank = "Competent";
  else if (overallMastery > 10) rank = "Advanced Beginner";

  const lowestCoreDeckId = DECK_LIST.reduce((prev, curr) => {
    const prevProg = metrics[prev.id]?.progress || 0;
    const currProg = metrics[curr.id]?.progress || 0;
    return currProg < prevProg ? curr : prev;
  }, DECK_LIST[0]);

  return { 
    metrics, 
    overallMastery, 
    seenCount, 
    masteredCount, 
    totalCards, 
    rank, 
    lowestCoreDeckId
  };
};

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const { progress, getCardMastery, lastSession } = useProgress();
  const { settings, updateSettings } = useSettings();
  
  const allCards = useMemo(() => adaptCards(), []);
  
  const stats = useMemo(() => 
    calculateDashboardStats(allCards, progress, getCardMastery), 
    [allCards, progress, getCardMastery]
  );

  const sortedDecks = useMemo(() => {
    const list = [...DECK_LIST];
    if (settings.sortByLowest) {
      list.sort((a, b) => (stats.metrics[a.id]?.progress || 0) - (stats.metrics[b.id]?.progress || 0));
    }
    return list;
  }, [settings.sortByLowest, stats.metrics]);

  const DomainCard: React.FC<{ deck: DeckConfig }> = ({ deck }) => {
    const m = stats.metrics[deck.id];
    if (!m) return null;

    const renderLogo = () => {
      switch (deck.id) {
        case 'NP1': return <Waves size={18} />;
        case 'NP2': return <HeartPulse size={18} />;
        case 'NP3': return <Activity size={18} />;
        case 'NP4': return <Stethoscope size={18} />;
        case 'NP5': return <Brain size={18} />;
        case 'PHARM_LABS': return <Zap size={18} />;
        case 'PRIO_DEL': return <ShieldCheck size={18} />;
        default: return <Activity size={18} />;
      }
    };

    return (
      <button 
        onClick={() => onStartSession({ deckId: deck.id })}
        className="w-full bg-white dark:bg-darkcard p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-[var(--accent)] hover:shadow-soft transition-all duration-300 flex items-center justify-between group text-left relative overflow-hidden"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)] transition-all duration-300 flex-shrink-0 shadow-sm">
            {renderLogo()}
          </div>
          <div className="truncate pr-2">
            <h4 className="font-black text-slate-800 dark:text-white text-xs leading-none mb-2 uppercase tracking-tight">{deck.title}</h4>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-[var(--accent)] transition-all duration-1000 ease-out ${m.progress === 0 ? 'opacity-0' : 'opacity-100'}`} 
                    style={{ width: `${m.progress}%` }} 
                  />
               </div>
               <span className={`text-[8px] font-black uppercase tracking-widest ${m.progress === 0 ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                 {m.progress}%
               </span>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-slate-300 group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-all">
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-10 max-w-[1500px] mx-auto space-y-8 animate-fade-in pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status: {stats.rank}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-rose-400">Mastery Dashboard</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {lastSession?.setId && (
            <button 
              onClick={() => onStartSession({}, true)}
              className="flex items-center gap-3 bg-[var(--accent)] px-6 py-4 rounded-3xl border-2 border-white dark:border-slate-800 shadow-[0_20px_40px_rgba(var(--accent-glow),0.4)] hover:scale-105 transition-all group"
            >
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Quick Resume</span>
                  <span className="text-xs font-black text-white">{lastSession.deckId || 'Active'} Module</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white text-[var(--accent)] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                  <ArrowRight size={18} />
               </div>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div className="relative group overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-rose-500 to-indigo-600 opacity-90 transition-transform duration-1000 group-hover:scale-105" />
            <div className="relative p-10 md:p-14 z-10 flex flex-col items-start gap-8">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl text-white border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                 <Zap size={14} fill="currentColor" className="text-yellow-300" /> Strategic Validation
              </div>
              
              <div className="space-y-4 max-w-lg">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                  Unified Clinical <br/> Learning Engine
                </h2>
                <p className="text-white/80 font-medium text-sm md:text-base leading-relaxed">
                  Analyze high-yield concepts across all NP Domains, Pharmacology, and Delegation protocols in one centralized validation loop.
                </p>
              </div>

              <button 
                onClick={() => onStartSession({ deckId: 'NP1' })}
                className="bg-white text-[var(--accent)] px-10 py-5 rounded-2xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-slate-50 hover:-translate-y-1 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center gap-3 group/btn"
              >
                Launch Unified Loop <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                <Brain size={18} className="text-[var(--accent)]" /> Knowledge Domains
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateSettings({ sortByLowest: !settings.sortByLowest })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${settings.sortByLowest ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Filter size={12} /> {settings.sortByLowest ? 'Lowest First' : 'Default Sort'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedDecks.map(deck => <DomainCard key={deck.id} deck={deck} />)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white dark:bg-darkcard rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-soft relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Trophy size={160} />
             </div>
             
             <div className="relative z-10 text-center space-y-8">
                <div className="flex justify-center">
                   <div className="relative">
                      <div className="w-48 h-48 rounded-full border-[10px] border-slate-50 dark:border-slate-800 flex items-center justify-center shadow-inner">
                         <div className="text-center">
                            <div className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stats.overallMastery}%</div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-2">{stats.rank}</div>
                         </div>
                      </div>
                      <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90">
                        <circle 
                          cx="96" cy="96" r="86" 
                          fill="transparent" 
                          stroke="var(--accent)" 
                          strokeWidth="10" 
                          strokeDasharray={540} 
                          strokeDashoffset={540 - (540 * stats.overallMastery) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-8">
                   <div className="space-y-1">
                      <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.seenCount}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Concepts Seen</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-2xl font-black text-emerald-500">{stats.masteredCount}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mastered</div>
                   </div>
                </div>

                <button 
                   onClick={() => onStartSession({ mastery: ['learning'] })}
                   className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Review Weak Points
                </button>
             </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-800/40 flex items-center justify-center text-indigo-500">
                    <Activity size={18} />
                 </div>
                 <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-[0.2em]">Clinical Protocol</h4>
              </div>
              <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 font-medium leading-relaxed italic">
                {stats.overallMastery < 20 
                  ? `Focus on ${stats.lowestCoreDeckId.id}: ${stats.lowestCoreDeckId.subtitle} to stabilize your baseline score across the unified curriculum.`
                  : `Clinical performance is high. Proceed with active validation in ${stats.lowestCoreDeckId.id} to maintain expert rank.`}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};
