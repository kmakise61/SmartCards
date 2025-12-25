
import React, { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { FlashcardUI, GradeStatus } from '../types';
import { 
  ArrowLeft, 
  Search, 
  PlayCircle, 
  List,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Target,
  RefreshCw,
  Check,
  Filter,
  Eye,
  ArrowUpDown,
  SortAsc
} from 'lucide-react';

interface QuizCardBrowserProps {
  deckId: string;
  onBack: () => void;
  onStudy: (cardIds: string[]) => void;
  onRateCard: (cardId: string, status: GradeStatus) => void;
}

// Helper to highlight cloze deletions and parse markdown bolding
const ClozePreview: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/{{(.*?)}}/);
  
  return (
    <span className="leading-loose text-slate-800 dark:text-slate-200">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          // Context text - Parse Markdown Bold (**text**)
          const boldParts = part.split(/(\*\*.*?\*\*)/);
          return (
            <span key={index}>
              {boldParts.map((subPart, subIndex) => {
                if (subPart.startsWith('**') && subPart.endsWith('**')) {
                  return <strong key={subIndex} className="font-black text-slate-900 dark:text-white">{subPart.slice(2, -2)}</strong>;
                }
                return <span key={subIndex}>{subPart}</span>;
              })}
            </span>
          );
        } else {
          // Cloze Deletion
          return (
            <span key={index} className="mx-1 px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/20 text-xs inline-block align-middle shadow-sm">
              {part}
            </span>
          );
        }
      })}
    </span>
  );
};

export const QuizCardBrowser: React.FC<QuizCardBrowserProps> = ({ deckId, onBack, onStudy, onRateCard }) => {
  const { allCards, progress, getCardMastery } = useProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'mastered' | 'unseen'>('all');
  const [sortMode, setSortMode] = useState<'default' | 'alpha'>('default');

  // Filter cards for this specific deck
  const { deckCards, stats } = useMemo(() => {
    const cards = allCards.filter(c => c.category === deckId);
    const s = { total: 0, unseen: 0, learning: 0, mastered: 0 };

    const enriched = cards.map(c => {
        const record = progress[c.id];
        const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
        s.total++;
        s[mastery]++;
        return { ...c, mastery };
    });

    return { deckCards: enriched, stats: s };
  }, [allCards, deckId, progress, getCardMastery]);

  const filteredCards = useMemo(() => {
    let result = deckCards.filter(c => {
      const matchesSearch = c.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (filterMode === 'mastered') matchesFilter = c.mastery === 'mastered';
      if (filterMode === 'learning') matchesFilter = c.mastery === 'learning';
      if (filterMode === 'unseen') matchesFilter = c.mastery === 'unseen';

      return matchesSearch && matchesFilter;
    });

    if (sortMode === 'alpha') {
      result.sort((a, b) => a.question.localeCompare(b.question));
    }
    // Default maintains original order (usually by ID/Adaptation)

    return result;
  }, [deckCards, searchTerm, filterMode, sortMode]);

  const handleLaunchCategory = (category: 'all' | 'learning' | 'mastered' | 'unseen') => {
    let targetCards = deckCards;
    if (category !== 'all') {
      targetCards = deckCards.filter(c => c.mastery === category);
    }
    if (targetCards.length > 0) {
      onStudy(targetCards.map(c => c.id));
    }
  };

  const masteredPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-darkbg overflow-hidden relative">
      
      {/* HEADER */}
      <div className="flex-none h-16 flex items-center justify-between px-4 lg:px-8 border-b bg-white/90 dark:bg-darkcard/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm z-50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
        </button>
        
        <div className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">
           {deckId} Browser
        </div>

        <button 
             onClick={() => handleLaunchCategory('all')}
             className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all"
           >
             <PlayCircle size={14} /> Review All
        </button>
      </div>

      {/* ACTION WIDGETS (DASHBOARD STYLE) */}
      {/* These now launch study sessions directly */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
         <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Unseen Launcher */}
            <button 
              onClick={() => handleLaunchCategory('unseen')}
              disabled={stats.unseen === 0}
              className="flex-1 p-3 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all group relative overflow-hidden"
            >
               <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Unseen</span>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                     <Eye size={20} />
                     <span className="text-2xl font-black">{stats.unseen}</span>
                  </div>
                  <span className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Start <PlayCircle size={8} />
                  </span>
               </div>
            </button>

            {/* Missed/Learning Launcher */}
            <button 
              onClick={() => handleLaunchCategory('learning')}
              disabled={stats.learning === 0}
              className="flex-1 p-3 rounded-2xl border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group relative overflow-hidden"
            >
               <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/60 dark:text-amber-500/60 mb-1">Missed</span>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                     <Zap size={20} />
                     <span className="text-2xl font-black">{stats.learning}</span>
                  </div>
                  <span className="text-[8px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Review <PlayCircle size={8} />
                  </span>
               </div>
            </button>

            {/* Mastered Launcher */}
            <button 
              onClick={() => handleLaunchCategory('mastered')}
              disabled={stats.mastered === 0}
              className="flex-1 p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group relative overflow-hidden"
            >
               <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60 mb-1">Got It</span>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                     <ShieldCheck size={20} />
                     <span className="text-2xl font-black">{stats.mastered}</span>
                  </div>
                  <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Practice <PlayCircle size={8} />
                  </span>
               </div>
            </button>
         </div>

         {/* FILTER & SORT BAR */}
         <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
               <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex shrink-0">
                  {['all', 'learning', 'mastered', 'unseen'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode as any)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        filterMode === mode 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {mode === 'learning' ? 'Missed' : mode === 'mastered' ? 'Got It' : mode}
                    </button>
                  ))}
               </div>
               
               <button 
                  onClick={() => setSortMode(prev => prev === 'default' ? 'alpha' : 'default')}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-[var(--accent)] transition-all shrink-0 flex items-center gap-1.5"
                  title="Sort Order"
               >
                  {sortMode === 'default' ? <List size={14} /> : <SortAsc size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">
                    {sortMode === 'default' ? 'Default' : 'A-Z'}
                  </span>
               </button>
            </div>

            <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Filter list by content..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all"
                />
            </div>
         </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 pb-24 bg-slate-50/50 dark:bg-darkbg">
         {filteredCards.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
               <Target size={48} className="mx-auto mb-4 opacity-50" />
               <p className="text-sm font-medium">No cards match the active filter.</p>
               <button onClick={() => setFilterMode('all')} className="mt-4 text-xs font-bold text-[var(--accent)] hover:underline">Clear Filters</button>
            </div>
         ) : (
            filteredCards.map((card, index) => (
                <button 
                  key={card.id} 
                  onClick={() => onStudy([card.id])}
                  className="w-full text-left flex flex-col md:flex-row bg-white dark:bg-darkcard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[var(--accent)]/30 hover:shadow-md transition-all group overflow-hidden"
                >
                    {/* Status Indicator Strip */}
                    <div className={`w-full md:w-1.5 h-1.5 md:h-auto order-first ${
                        card.mastery === 'mastered' ? 'bg-emerald-500' :
                        card.mastery === 'learning' ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                    
                    {/* Content */}
                    <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                #{index + 1}
                            </span>
                            {card.mastery === 'mastered' ? (
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                                    <CheckCircle2 size={10} /> Got It
                                </span>
                            ) : card.mastery === 'learning' ? (
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                                    <Zap size={10} /> Missed It
                                </span>
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded">
                                    Unseen
                                </span>
                            )}
                        </div>
                        <div className="text-sm md:text-base font-medium mb-3">
                            <ClozePreview text={card.question} />
                        </div>
                        <div className="text-xs text-[var(--accent)] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Study Card <PlayCircle size={12} />
                        </div>
                    </div>
                </button>
            ))
         )}
      </div>

    </div>
  );
};
