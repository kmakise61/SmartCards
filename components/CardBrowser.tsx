
import React, { useMemo, useState, useRef } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { SessionFilters, MasteryStatus, FlashcardUI } from '../types';
import { EditCardModal } from './EditCardModal';
import { 
  ArrowLeft, 
  Search, 
  PlayCircle, 
  Star, 
  Volume2, 
  ArrowUpDown,
  List,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  TrendingUp,
  Filter,
  Zap,
  ShieldCheck,
  RotateCcw,
  Forward,
  Shuffle,
  Edit2,
  LayoutGrid,
  LayoutList,
  Rows,
  RotateCw,
  Lightbulb
} from 'lucide-react';

interface CardBrowserProps {
  setId: string;
  onBack: () => void;
  onStudy: (filters?: SessionFilters) => void;
  isSidebarOpen?: boolean;
}

type FilterMode = 'all' | 'unseen' | 'learning' | 'mastered' | 'starred';
type ViewMode = 'list' | 'grid' | 'table';

// Extracted for performance
const MarkdownLite: React.FC<{ text: string }> = ({ text }) => {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="text-indigo-500 not-italic">$1</em>')
    .replace(/\n/g, '<br/>');
  
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const GridCard: React.FC<{ 
  card: FlashcardUI & { mastery: MasteryStatus }; 
  onToggleFlag: (id: string) => void; 
  onEdit: (card: FlashcardUI) => void; 
  onTTS: (text: string, e: React.MouseEvent) => void;
  renderStatusIcon: (status: string) => React.ReactNode; 
}> = ({ card, onToggleFlag, onEdit, onTTS, renderStatusIcon }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
       className="group bg-white dark:bg-darkcard rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-[var(--accent)]/40 hover:shadow-lg transition-all flex flex-col h-72 relative overflow-hidden cursor-pointer"
       onClick={() => setIsFlipped(!isFlipped)}
    >
       {/* Card Face Content */}
       <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isFlipped ? 'opacity-0 pointer-events-none absolute inset-6' : 'opacity-100'}`}>
         <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">#{card.displayId}</span>
            <div className="flex items-center gap-2">
              {renderStatusIcon(card.mastery)}
              <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFlag(card.id); }}
                  className={`transition-all hover:scale-110 ${card.isFlagged ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 hover:text-yellow-400'}`}
              >
                  <Star size={16} />
              </button>
            </div>
         </div>
         
         <div className="flex-1 overflow-hidden relative">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-6">
               <MarkdownLite text={card.question} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-darkcard to-transparent" />
         </div>

         <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{card.category}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEdit(card); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-500"><Edit2 size={14} /></button>
              <button onClick={(e) => { onTTS(card.question, e); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[var(--accent)]"><Volume2 size={14} /></button>
            </div>
         </div>
       </div>

       {/* Back Face Content (Answer) */}
       <div className={`flex-1 flex flex-col absolute inset-0 p-6 bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Answer</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
             <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                <MarkdownLite text={card.answer} />
             </div>
             {card.rationale && (
               <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">
                   <Lightbulb size={12} /> Analysis
                 </div>
                 <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                   <MarkdownLite text={card.rationale} />
                 </div>
               </div>
             )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
             <span className="text-[9px] font-bold text-slate-400 flex items-center justify-center gap-2">
               <RotateCw size={10} /> Tap to flip back
             </span>
          </div>
       </div>
    </div>
  );
};

export const CardBrowser: React.FC<CardBrowserProps> = ({ setId, onBack, onStudy, isSidebarOpen = true }) => {
  const { allCards, progress, toggleFlag, getCardMastery, lastSession } = useProgress();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'original' | 'alpha'>('original');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardUI | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load and prepare data
  const { setCards, setMetadata, stats } = useMemo(() => {
    const cards = allCards.filter(c => c.setId === setId);
    const meta = cards.length > 0 ? { name: cards[0].setName, desc: cards[0].setDescription, np: cards[0].np } : { name: 'Unknown Set', desc: '', np: '' };
    
    const s = { total: 0, unseen: 0, learning: 0, mastered: 0 };
    
    // Enrich cards with current progress
    const enrichedCards = cards.map(c => {
      const record = progress[c.id];
      const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
      s.total++;
      s[mastery]++;
      return {
        ...c,
        isFlagged: !!record?.isFlagged,
        mastery
      };
    });

    return { setCards: enrichedCards, setMetadata: meta, stats: s };
  }, [setId, progress, getCardMastery, allCards]);

  // Determine if we can resume a session
  const canResume = useMemo(() => {
    return (
      lastSession?.setId === setId && 
      lastSession.currentIndex > 0 && 
      lastSession.currentIndex < setCards.length - 1
    );
  }, [lastSession, setId, setCards.length]);

  // Filter and Sort Logic
  const filteredCards = useMemo(() => {
    let result = setCards.filter(c => 
      (c.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterMode === 'starred') {
      result = result.filter(c => c.isFlagged);
    } else if (filterMode !== 'all') {
      result = result.filter(c => c.mastery === filterMode);
    }

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.question.localeCompare(b.question));
    } else {
      result.sort((a, b) => parseInt(a.displayId) - parseInt(b.displayId));
    }

    return result;
  }, [setCards, searchTerm, sortBy, filterMode]);

  const handleStudyClick = () => {
    if (filterMode !== 'all' || searchTerm) {
      onStudy({ cardIds: filteredCards.map(c => c.id) });
    } else {
      onStudy({ setId });
    }
  };

  const handleResumeClick = () => {
    if (canResume && lastSession) {
      onStudy({ 
        setId, 
        startIndex: lastSession.currentIndex,
        mastery: lastSession.masteryFilters 
      });
    }
  };

  const handleStickyAction = () => {
    if (canResume && filterMode === 'all' && !searchTerm) {
      handleResumeClick();
    } else {
      handleStudyClick();
    }
  };

  const handleRestartClick = () => {
    onStudy({ setId });
  };

  const handleShufflePlay = () => {
    if (filterMode !== 'all' || searchTerm) {
      onStudy({ cardIds: filteredCards.map(c => c.id), shuffle: true });
    } else {
      onStudy({ setId, shuffle: true });
    }
    setShowMenu(false);
  };

  const handleStatClick = (status: MasteryStatus) => {
    const targetIds = setCards.filter(c => c.mastery === status).map(c => c.id);
    if (targetIds.length > 0) {
      onStudy({ cardIds: targetIds });
    }
  };

  const handleTTS = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/_/g, '')
        .replace(/<[^>]*>/g, ''); 
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      if (settings.voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === settings.voiceURI);
        if (voice) utterance.voice = voice;
      }
      utterance.rate = settings.speechRate || 1.1;
      utterance.pitch = settings.speechPitch || 1.0;

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setIsHeaderSticky(scrollContainerRef.current.scrollTop > 60);
    }
  };

  const totalCards = setCards.length;
  const masteredPct = totalCards > 0 ? Math.round((stats.mastered / totalCards) * 100) : 0;
  const learningPct = totalCards > 0 ? Math.round((stats.learning / totalCards) * 100) : 0;
  const unseenPct = totalCards > 0 ? Math.round((stats.unseen / totalCards) * 100) : 0;

  const getFilterButtonClass = (mode: FilterMode) => {
    const isActive = filterMode === mode;
    if (isActive) {
      if (mode === 'mastered') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm border-transparent';
      if (mode === 'learning') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm border-transparent';
      if (mode === 'unseen') return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border-transparent';
      if (mode === 'starred') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 shadow-sm border-transparent';
      return 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border-transparent';
    }
    return 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-transparent';
  };

  const renderStatusIcon = (mastery: string) => {
    if (mastery === 'mastered') return <span className="text-emerald-500"><CheckCircle2 size={12} /></span>;
    if (mastery === 'learning') return <span className="text-amber-500"><Clock size={12} /></span>;
    return <span className="text-slate-300 dark:text-slate-600"><Circle size={12} /></span>;
  };

  // Logic to determine layout modes based on sidebar
  const rowLayoutClass = isSidebarOpen ? 'xl:flex-row xl:items-start xl:text-left xl:gap-12' : 'lg:flex-row lg:items-start lg:text-left lg:gap-12';
  const rowAlignmentClass = isSidebarOpen ? 'xl:items-start xl:justify-start' : 'lg:items-start lg:justify-start';

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-darkbg overflow-hidden relative">
      
      {/* 1. FIXED TOP NAVIGATION */}
      <div className={`flex-none h-16 flex items-center justify-between px-4 lg:px-8 border-b transition-all z-50 ${isHeaderSticky ? 'bg-white/90 dark:bg-darkcard/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
        </button>
        
        <div className={`flex-1 text-center transition-all duration-300 transform ${isHeaderSticky ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
           <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md mx-auto">
             {setMetadata.name}
           </h3>
        </div>

        <div className="flex items-center gap-2 relative">
           <button 
             onClick={handleStickyAction}
             className={`flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--accent-glow)] transition-all duration-300 ${isHeaderSticky ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
           >
             {canResume && filterMode === 'all' && !searchTerm ? (
               <><Forward size={14} /> Resume</>
             ) : (
               <><PlayCircle size={14} /> Study</>
             )}
           </button>
           
           <div className="relative">
             <button 
               onClick={() => setShowMenu(!showMenu)}
               className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                <MoreHorizontal size={20} />
             </button>

             {/* Dropdown Menu */}
             {showMenu && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-darkcard rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Set Actions</div>
                    <button 
                      onClick={handleShufflePlay}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Shuffle size={14} /> Shuffle Play
                    </button>
                    <button 
                      onClick={() => { handleRestartClick(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <RotateCcw size={14} /> Restart Set
                    </button>
                 </div>
               </>
             )}
           </div>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE AREA */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* HERO SECTION */}
          <div className="px-4 md:px-8 pt-4 pb-8">
             <div className={`flex flex-col gap-8 items-center text-center ${rowLayoutClass}`}>
                
                {/* Hero Left: Title & Info */}
                <div className={`flex-1 space-y-6 w-full flex flex-col items-center ${rowAlignmentClass}`}>
                   <div className="flex flex-wrap items-center gap-3 justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                         {setMetadata.np}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                         <List size={14} /> {totalCards} Terms
                      </span>
                   </div>
                   
                   <div>
                     <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4">
                        {setMetadata.name}
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto xl:mx-0">
                        {setMetadata.desc}
                     </p>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      {canResume && filterMode === 'all' && !searchTerm ? (
                        <>
                          <button 
                             onClick={handleResumeClick}
                             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[var(--accent)] hover:brightness-110 text-white pl-6 pr-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all group"
                          >
                             <Forward size={20} className="fill-white/20" /> 
                             Resume ({lastSession!.currentIndex + 1}/{totalCards})
                          </button>
                          
                          <button 
                             onClick={handleRestartClick}
                             className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-[var(--accent)] transition-all active:scale-95"
                          >
                             <RotateCcw size={16} /> Restart
                          </button>
                        </>
                      ) : (
                        <button 
                           onClick={handleStudyClick}
                           className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[var(--accent)] hover:brightness-110 text-white pl-6 pr-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all group"
                        >
                           <PlayCircle size={20} className="fill-white/20" /> 
                           {filterMode !== 'all' || searchTerm ? `Study ${filteredCards.length} Filtered` : 'Study Flashcards'}
                        </button>
                      )}
                   </div>
                </div>

                {/* Hero Right: Interactive Stats Widget */}
                <div className={`w-full bg-white dark:bg-darkcard p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-soft ${isSidebarOpen ? 'xl:w-[420px]' : 'lg:w-[420px]'} text-left`}>
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Mastery Progress
                      </h4>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{masteredPct}%</div>
                   </div>

                   <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-8">
                      <div className="h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} title="Mastered" />
                      <div className="h-full bg-amber-400" style={{ width: `${learningPct}%` }} title="Learning" />
                      <div className="h-full bg-slate-200 dark:bg-slate-700" style={{ width: `${unseenPct}%` }} title="Unseen" />
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleStatClick('mastered')}
                        className="border rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all hover:scale-105 active:scale-95 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 group"
                      >
                         <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">{stats.mastered}</div>
                         <div className="text-[7px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider group-hover:underline">Review</div>
                      </button>
                      <button 
                        onClick={() => handleStatClick('learning')}
                        className="border rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all hover:scale-105 active:scale-95 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/20 group"
                      >
                         <div className="text-lg font-black text-amber-600 dark:text-amber-500 leading-none mb-1">{stats.learning}</div>
                         <div className="text-[7px] font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider group-hover:underline">Practice</div>
                      </button>
                      <button 
                        onClick={() => handleStatClick('unseen')}
                        className="border rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all hover:scale-105 active:scale-95 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 group"
                      >
                         <div className="text-lg font-black text-slate-600 dark:text-slate-300 leading-none mb-1">{stats.unseen}</div>
                         <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider group-hover:underline">Start</div>
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* 3. STICKY SEARCH & FILTER BAR */}
          <div className="sticky top-0 z-40 bg-[#F8FAFC]/95 dark:bg-darkbg/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 transition-all shadow-sm">
             <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                
                {/* Search */}
                <div className="relative flex-1 w-full group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Filter cards by term..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                   />
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
                   {/* Filters */}
                   <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 shrink-0">
                      <button 
                        onClick={() => setFilterMode('all')}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getFilterButtonClass('all')}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setFilterMode('learning')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getFilterButtonClass('learning')}`}
                      >
                        <Zap size={12} className="hidden sm:block" /> Learning
                      </button>
                      <button 
                        onClick={() => setFilterMode('mastered')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getFilterButtonClass('mastered')}`}
                      >
                        <ShieldCheck size={12} className="hidden sm:block" /> Mastered
                      </button>
                      <button 
                        onClick={() => setFilterMode('starred')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getFilterButtonClass('starred')}`}
                      >
                        <Star size={12} className={filterMode === 'starred' ? 'fill-current' : ''} /> <span className="hidden sm:inline">Starred</span>
                      </button>
                   </div>

                   {/* Sorting */}
                   <button 
                      onClick={() => setSortBy(prev => prev === 'original' ? 'alpha' : 'original')}
                      className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:gap-3 md:px-4 md:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm shrink-0"
                      title="Sort Order"
                   >
                      <ArrowUpDown size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                        {sortBy === 'original' ? 'Default' : 'A-Z'}
                      </span>
                   </button>

                   {/* View Toggle (New Feature) */}
                   <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 shrink-0">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title="List View"
                      >
                        <LayoutList size={16} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title="Grid View (Large Icons)"
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title="Table View (Details)"
                      >
                        <Rows size={16} />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* 4. CONTENT RENDERING */}
          <div className="p-4 md:p-8 space-y-4 pb-24">
             {filteredCards.length === 0 ? (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                      <Filter size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No cards found</h3>
                   <p className="text-sm text-slate-500 mt-2">
                     Try adjusting your search or filters.
                   </p>
                   {filterMode !== 'all' && (
                      <button onClick={() => setFilterMode('all')} className="mt-6 text-xs font-bold text-[var(--accent)] hover:underline uppercase tracking-widest">
                         View All Cards
                      </button>
                   )}
                </div>
             ) : (
               <>
                 {/* VIEW MODE: LIST (DEFAULT) */}
                 {viewMode === 'list' && (
                   <div className="space-y-4">
                     {filteredCards.map((card) => (
                        <div 
                           key={card.id} 
                           className="group bg-white dark:bg-darkcard rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-[var(--accent)]/30 transition-all relative overflow-hidden"
                        >
                           <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                              card.mastery === 'mastered' ? 'bg-emerald-500' : 
                              card.mastery === 'learning' ? 'bg-amber-400' : 'bg-slate-100 dark:bg-slate-700'
                           }`} />

                           <div className={`flex flex-col gap-6 ${isSidebarOpen ? 'lg:flex-row' : 'md:flex-row'}`}>
                              <div className={`flex-1 ${isSidebarOpen ? 'lg:w-[35%]' : 'md:w-[35%]'} border-b ${isSidebarOpen ? 'lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0' : 'md:border-b-0 md:border-r md:pr-6 md:pb-0'} border-slate-100 dark:border-slate-800 pb-4`}>
                                 <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{card.displayId}</span>
                                       {renderStatusIcon(card.mastery)}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setEditingCard(card)} className="text-slate-300 hover:text-indigo-500 transition-colors p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800" title="Edit Card"><Edit2 size={14} /></button>
                                      <button onClick={(e) => handleTTS(card.question, e)} className="text-slate-300 hover:text-[var(--accent)] transition-colors p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"><Volume2 size={16} /></button>
                                    </div>
                                 </div>
                                 <div className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                    <MarkdownLite text={card.question} />
                                 </div>
                              </div>

                              <div className={`flex-[2] relative ${isSidebarOpen ? 'lg:pl-2' : 'md:pl-2'} pr-12`}>
                                 <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 opacity-50">Answer</div>
                                 <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    <MarkdownLite text={card.answer} />
                                 </div>

                                 <button 
                                    onClick={() => toggleFlag(card.id)}
                                    className="absolute top-0 right-0 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-90"
                                 >
                                    <Star 
                                       size={20} 
                                       className={`transition-all duration-300 ${
                                          card.isFlagged 
                                          ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-sm' 
                                          : 'text-slate-300 hover:text-yellow-400'
                                       }`} 
                                    />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                   </div>
                 )}

                 {/* VIEW MODE: GRID (LARGE ICONS) */}
                 {viewMode === 'grid' && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {filteredCards.map((card) => (
                        <GridCard 
                          key={card.id} 
                          card={card} 
                          onToggleFlag={toggleFlag} 
                          onEdit={setEditingCard} 
                          onTTS={handleTTS}
                          renderStatusIcon={renderStatusIcon}
                        />
                     ))}
                   </div>
                 )}

                 {/* VIEW MODE: TABLE (DETAILS) */}
                 {viewMode === 'table' && (
                   <div className="bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                     <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm">
                         <thead>
                           <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <th className="p-4 w-12 text-center">Status</th>
                             <th className="p-4 w-20">ID</th>
                             <th className="p-4 min-w-[200px]">Question</th>
                             <th className="p-4 min-w-[200px] hidden md:table-cell">Answer</th>
                             <th className="p-4 w-24 text-right">Actions</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {filteredCards.map((card) => (
                             <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                               <td className="p-4 text-center">
                                 <div className="flex justify-center">{renderStatusIcon(card.mastery)}</div>
                               </td>
                               <td className="p-4 font-mono text-xs text-slate-500">#{card.displayId}</td>
                               <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                                 <div className="line-clamp-2"><MarkdownLite text={card.question} /></div>
                               </td>
                               <td className="p-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                                 <div className="line-clamp-2"><MarkdownLite text={card.answer} /></div>
                               </td>
                               <td className="p-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => toggleFlag(card.id)} className={`${card.isFlagged ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}><Star size={16} className={card.isFlagged ? 'fill-current' : ''} /></button>
                                   <button onClick={() => setEditingCard(card)} className="text-slate-300 hover:text-indigo-500"><Edit2 size={16} /></button>
                                 </div>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </main>
      
      <EditCardModal 
        card={editingCard} 
        isOpen={!!editingCard} 
        onClose={() => setEditingCard(null)} 
      />
    </div>
  );
};
