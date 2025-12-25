
import React, { useMemo, useState, useEffect } from 'react';
import { MasteryStatus, DeckConfig, SessionFilters } from '../types';
import { DECK_LIST } from '../data/deck_config';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { ExamCountdown } from '../components/ExamCountdown';
import { DailyGoalWidget } from '../components/DailyGoalWidget';
import { 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Trophy,
  Stethoscope,
  ArrowRight,
  Filter,
  Brain,
  HeartPulse,
  Zap,
  Waves,
  Clock,
  Target,
  PlusCircle,
  Search,
  BookOpen
} from 'lucide-react';

interface DashboardProps {
  onStartSession: (filters?: SessionFilters, resume?: boolean) => void;
  onOpenCustomSession?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

const calculateDashboardStats = (
  allCards: any[], 
  progress: Record<string, any>, 
  getCardMastery: (seen: boolean, goodCount: number) => MasteryStatus
) => {
  const metrics: Record<string, { total: number; unseen: number; learning: number; mastered: number; progress: number }> = {};
  
  // Only include decks visible in the dashboard
  const visibleDecks = DECK_LIST.filter(d => d.visibility.includes('dashboard'));

  visibleDecks.forEach(d => {
    metrics[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0, progress: 0 };
  });

  allCards.forEach(card => {
    const deckId = card.category;
    // Only process if this deck is part of the dashboard metrics
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
  let learningCount = 0;

  // Re-iterate to calculate totals specifically for visible dashboard decks
  allCards.forEach(card => {
    if (metrics[card.category]) { // Only count if deck is visible
        totalCards++;
        const record = progress[card.id];
        if (record?.seen) {
          seenCount++;
          const status = getCardMastery(true, record.goodCount);
          if (status === 'mastered') {
            masteredCount++;
          } else if (status === 'learning') {
            learningCount++;
          }
        }
    }
  });

  const overallMastery = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const unseenCount = totalCards - seenCount;

  let rank = "Novice";
  if (overallMastery > 85) rank = "Expert";
  else if (overallMastery > 60) rank = "Proficient";
  else if (overallMastery > 30) rank = "Competent";
  else if (overallMastery > 10) rank = "Adv. Beginner";

  const lowestCoreDeckId = visibleDecks.reduce((prev, curr) => {
    const prevProg = metrics[prev.id]?.progress || 0;
    const currProg = metrics[curr.id]?.progress || 0;
    return currProg < prevProg ? curr : prev;
  }, visibleDecks[0]);

  return { 
    metrics, 
    overallMastery, 
    seenCount, 
    masteredCount,
    learningCount,
    unseenCount,
    totalCards, 
    rank, 
    lowestCoreDeckId
  };
};

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession, onOpenCustomSession, onOpenSearch, onOpenSettings }) => {
  const { allCards, progress, getCardMastery, lastSession } = useProgress();
  const { settings, updateSettings } = useSettings();
  const [greeting, setGreeting] = useState('Welcome');
  
  // Time-aware greeting logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);
  
  const stats = useMemo(() => 
    calculateDashboardStats(allCards, progress, getCardMastery), 
    [allCards, progress, getCardMastery]
  );

  const sortedDecks = useMemo(() => {
    // Only show visible decks
    const list = DECK_LIST.filter(d => d.visibility.includes('dashboard'));
    if (settings.sortByLowest) {
      list.sort((a, b) => (stats.metrics[a.id]?.progress || 0) - (stats.metrics[b.id]?.progress || 0));
    }
    return list;
  }, [settings.sortByLowest, stats.metrics]);

  const handleStatusClick = (status: MasteryStatus) => {
    const targetIds = allCards.filter(c => {
       // Filter by deck visibility first
       const isVisible = DECK_LIST.find(d => d.id === c.category)?.visibility.includes('dashboard');
       if (!isVisible) return false;

       const record = progress[c.id];
       return getCardMastery(!!record?.seen, record?.goodCount || 0) === status;
    }).map(c => c.id);

    if (targetIds.length > 0) {
       onStartSession({ cardIds: targetIds });
    }
  };

  const DomainCard: React.FC<{ deck: DeckConfig }> = ({ deck }) => {
    const m = stats.metrics[deck.id];
    if (!m) return null;

    const renderLogo = () => {
      switch (deck.id) {
        case 'NP1': return <Waves size={20} />;
        case 'NP2': return <HeartPulse size={20} />;
        case 'NP3': return <Activity size={20} />;
        case 'NP4': return <Stethoscope size={20} />;
        case 'NP5': return <Brain size={20} />;
        case 'PHARM_LABS': return <Zap size={20} />;
        case 'PRIO_DEL': return <ShieldCheck size={20} />;
        default: return <Activity size={20} />;
      }
    };

    return (
      <button 
        onClick={() => onStartSession({ deckId: deck.id })}
        className="w-full p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 group text-left relative overflow-hidden
          bg-white dark:bg-darkcard/40 backdrop-blur-md
          border border-slate-200/80 dark:border-white/5
          shadow-sm hover:shadow-lg hover:border-[var(--accent)]/40 hover:-translate-y-1 active:scale-[0.98]"
      >
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300 border border-slate-100 dark:border-white/5 shadow-sm">
            {renderLogo()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase">{deck.id}</span>
            <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-400 group-hover:text-[var(--accent)] transition-all">
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3 relative z-10 w-full">
          <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {deck.title}
          </h4>
          
          <div className="space-y-1.5">
             <div className="flex justify-between items-center px-0.5">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
                <span className="text-[9px] font-black text-[var(--accent)]">
                  {m.progress}%
                </span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--accent-glow),0.5)]" 
                  style={{ width: `${m.progress}%` }} 
                />
             </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-24 relative overflow-hidden">
      {/* Background Ambience - Light Mode Only to preserve Dark Mode Deep Space */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--accent-soft),_transparent_50%)] pointer-events-none opacity-40 mix-blend-screen dark:hidden" />

      {/* --- GRID LAYOUT START --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">
        
        {/* === LEFT COLUMN (Hero + Domains) === */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. HERO CARD */}
          <div className="relative group overflow-hidden rounded-[2.5rem] border shadow-2xl min-h-[220px] flex items-center transition-all duration-500
            bg-white border-white/20 
            dark:bg-slate-950 dark:border-[var(--accent)]/40 
            dark:shadow-[0_0_50px_rgba(var(--accent-rgb),0.15)]
          ">
            {/* LIGHT MODE: Vibrant Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-indigo-600 opacity-90 dark:opacity-0 transition-opacity duration-500" />
            
            {/* DARK MODE: Deep Space with Radial Glow */}
            <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,_rgba(var(--accent-rgb),0.25),_transparent_70%)]" />
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            
            <div className="relative p-6 md:p-8 z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full">
              <div className="flex-1 space-y-3 md:space-y-4 text-center md:text-left">
                {/* Badge Row */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                   <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {stats.rank} Tier
                   </div>
                   {lastSession?.setId && (
                     <div className="hidden sm:flex items-center gap-2 text-white/70 text-[9px] font-bold uppercase tracking-widest border-l border-white/20 pl-3">
                       <Clock size={10} /> Resuming Session
                     </div>
                   )}
                </div>
                
                {/* Typography */}
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight drop-shadow-md">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">Future RN!</span>
                  </h1>
                  <p className="text-white/90 font-medium text-xs md:text-sm leading-relaxed max-w-md mx-auto md:mx-0 text-shadow-sm">
                    Mastery tracking is active. Focus on core domains to build retention.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button 
                    onClick={() => lastSession?.setId ? onStartSession({}, true) : onStartSession({ deckId: 'NP1' })}
                    className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group/btn w-full sm:w-auto justify-center"
                  >
                    {lastSession?.setId ? 'Resume' : 'Start NP1'} 
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  
                  {onOpenCustomSession && (
                    <button 
                      onClick={onOpenCustomSession}
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl font-black shadow-sm hover:bg-white/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group/btn w-full sm:w-auto justify-center"
                    >
                      <PlusCircle size={14} /> Custom Cram
                    </button>
                  )}
                </div>
              </div>

              {/* Illustration */}
              <div className="hidden md:block relative w-40 h-40 shrink-0">
                 <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm animate-[spin_60s_linear_infinite]" />
                 <div className="absolute inset-2 bg-white/5 rounded-full border border-white/10 animate-[spin_40s_linear_infinite_reverse]" />
                 <div className="absolute inset-0 flex items-center justify-center text-white/40">
                    <Activity size={60} strokeWidth={1} />
                 </div>
              </div>
            </div>
          </div>

          {/* 2. DOMAINS GRID */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Brain size={16} className="text-[var(--accent)]" /> Knowledge Architecture
              </h3>
              <div className="flex items-center gap-2">
                {onOpenSearch && (
                  <button 
                    onClick={onOpenSearch}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-white/10 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Search size={10} /> Find Topic
                  </button>
                )}
                <button 
                  onClick={() => updateSettings({ sortByLowest: !settings.sortByLowest })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${settings.sortByLowest ? 'bg-[var(--accent)] text-white border-transparent shadow-lg shadow-[var(--accent-glow)]' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10'}`}
                >
                  <Filter size={10} /> {settings.sortByLowest ? 'Focus Priority' : 'Standard Sort'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedDecks.map(deck => <DomainCard key={deck.id} deck={deck} />)}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Stats & Strategy) === */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* EXAM COUNTDOWN WIDGET */}
          <ExamCountdown onSetDate={() => onOpenSettings?.()} />

          {/* DAILY GOAL WIDGET */}
          <DailyGoalWidget />

          {/* 3. MASTERY WIDGET */}
          <div className="bg-white/80 dark:bg-darkcard/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-soft relative overflow-hidden group">
             <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                
                {/* Chart */}
                <div className="relative">
                   <div className="w-48 h-48 rounded-full border-[12px] border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                      <div className="text-center">
                         <div className="text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stats.overallMastery}%</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Proficiency</div>
                      </div>
                   </div>
                   <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90 drop-shadow-[0_0_10px_rgba(var(--accent-glow),0.4)]">
                     <circle 
                       cx="96" cy="96" r="84" 
                       fill="transparent" 
                       stroke="var(--accent)" 
                       strokeWidth="12" 
                       strokeDasharray={527} 
                       strokeDashoffset={527 - (527 * stats.overallMastery) / 100}
                       strokeLinecap="round"
                       className="transition-all duration-1000 ease-out"
                     />
                   </svg>
                </div>

                {/* Metrics Row (Clickable) */}
                <div className="grid grid-cols-3 gap-3 w-full border-t border-slate-100 dark:border-white/5 pt-6">
                   <button 
                     onClick={() => handleStatusClick('mastered')}
                     className="p-2 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:scale-105 active:scale-95 transition-all"
                   >
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.masteredCount}</div>
                      <div className="text-[7px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Mastered</div>
                   </button>
                   <button 
                     onClick={() => handleStatusClick('learning')}
                     className="p-2 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 hover:scale-105 active:scale-95 transition-all"
                   >
                      <div className="text-xl font-black text-amber-600 dark:text-amber-500">{stats.learningCount}</div>
                      <div className="text-[7px] font-black text-amber-600/70 dark:text-amber-500/70 uppercase tracking-widest">Learning</div>
                   </button>
                   <button 
                     onClick={() => handleStatusClick('unseen')}
                     className="p-2 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
                   >
                      <div className="text-xl font-black text-slate-800 dark:text-white">{stats.unseenCount}</div>
                      <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Unseen</div>
                   </button>
                </div>

                <button 
                   onClick={() => handleStatusClick('learning')}
                   className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
                >
                  Bridge Weak Links
                </button>
             </div>
             
             {/* BG Deco */}
             <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] text-slate-900 dark:text-white pointer-events-none">
                <Trophy size={200} />
             </div>
          </div>

          {/* 4. CLINICAL PROTOCOL CARD (Fully Responsive) */}
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-300
            bg-white border-indigo-100 shadow-sm
            dark:bg-darkcard/60 dark:border-indigo-500/20 dark:shadow-[0_0_30px_rgba(99,102,241,0.1)]
          ">
              {/* Light Mode Glow Effect (Subtle) */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none opacity-60 dark:hidden" />

              {/* Dark Mode Glow Effect */}
              <div className="hidden dark:block absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center gap-4 mb-6 relative z-10">
                 {/* Icon Container: Dark/Light Adaptive */}
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg 
                    bg-indigo-600 text-white shadow-indigo-200
                    dark:bg-indigo-500/20 dark:text-indigo-400 dark:shadow-none
                 ">
                    <Target size={24} />
                 </div>
                 <div>
                   <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Strategic Protocol</h4>
                   <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400"> AI-Driven Insight</span>
                 </div>
              </div>
              
              <div className="relative z-10 pl-4 border-l-2 border-indigo-100 dark:border-indigo-500/20">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-pretty">
                  {stats.overallMastery < 20 
                    ? `Immediate Priority: ${stats.lowestCoreDeckId.id}. Stabilize core concepts before engaging with high-complexity scenarios.`
                    : `High performance baseline in ${stats.lowestCoreDeckId.id}. Strategy: Shift to rapid-fire mixed validation sessions.`}
                </p>
              </div>
          </div>

        </div>
      </div>
      {/* --- GRID LAYOUT END --- */}
    </div>
  );
};