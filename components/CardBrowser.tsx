import React, { useMemo, useState, useRef } from 'react';
import { adaptCards } from '../utils/adaptCards';
import { useProgress } from '../context/ProgressContext';
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
  Sparkles
} from 'lucide-react';

interface CardBrowserProps {
  setId: string;
  onBack: () => void;
  onStudy: () => void;
}

type FilterMode = 'all' | 'new' | 'starred';

export const CardBrowser: React.FC<CardBrowserProps> = ({ setId, onBack, onStudy }) => {
  const { progress, toggleFlag, getCardMastery } = useProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'original' | 'alpha'>('original');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load and prepare data
  const { setCards, setMetadata, stats } = useMemo(() => {
    const all = adaptCards();
    const cards = all.filter(c => c.setId === setId);
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
  }, [setId, progress, getCardMastery]);

  // Filter and Sort Logic
  const filteredCards = useMemo(() => {
    let result = setCards.filter(c => 
      (c.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterMode === 'starred') {
      result = result.filter(c => c.isFlagged);
    } else if (filterMode === 'new') {
      result = result.filter(c => c.mastery === 'unseen');
    }

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.question.localeCompare(b.question));
    } else {
      result.sort((a, b) => parseInt(a.displayId) - parseInt(b.displayId));
    }

    return result;
  }, [setCards, searchTerm, sortBy, filterMode]);

  const handleTTS = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*/g, '').replace(/_/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const MarkdownLite: React.FC<{ text: string }> = ({ text }) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="text-indigo-500 not-italic">$1</em>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      // Toggle sticky state for the top bar title based on scroll position
      setIsHeaderSticky(scrollContainerRef.current.scrollTop > 60);
    }
  };

  const totalCards = setCards.length;
  // Calculate specific percentages
  const masteredPct = totalCards > 0 ? Math.round((stats.mastered / totalCards) * 100) : 0;
  const learningPct = totalCards > 0 ? Math.round((stats.learning / totalCards) * 100) : 0;
  const unseenPct = totalCards > 0 ? Math.round((stats.unseen / totalCards) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-darkbg overflow-hidden relative">
      
      {/* 1. FIXED TOP NAVIGATION (Always Visible) */}
      <div className={`flex-none h-16 flex items-center justify-between px-4 lg:px-8 border-b transition-all z-50 ${isHeaderSticky ? 'bg-white/90 dark:bg-darkcard/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
        </button>
        
        {/* Condensed Title that appears on Scroll */}
        <div className={`flex-1 text-center transition-all duration-300 transform ${isHeaderSticky ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
           <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md mx-auto">
             {setMetadata.name}
           </h3>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={onStudy}
             className={`flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--accent-glow)] transition-all duration-300 ${isHeaderSticky ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
           >
             <PlayCircle size={14} /> Study
           </button>
           <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <MoreHorizontal size={20} />
           </button>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE AREA */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-6xl mx-auto">
          
          {/* HERO SECTION */}
          <div className="px-4 md:px-8 pt-4 pb-8">
             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                
                {/* Hero Left: Title & Info */}
                <div className="flex-1 space-y-6 w-full">
                   <div className="flex flex-wrap items-center gap-3">
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
                     <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                        {setMetadata.desc}
                     </p>
                   </div>

                   <div className="flex items-center gap-4">
                      <button 
                         onClick={onStudy}
                         className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[var(--accent)] hover:brightness-110 text-white pl-6 pr-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all group"
                      >
                         <PlayCircle size={20} className="fill-white/20" /> 
                         Study Flashcards
                      </button>
                   </div>
                </div>

                {/* Hero Right: Redesigned Stats Widget */}
                <div className="w-full lg:w-[420px] bg-white dark:bg-darkcard p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-soft">
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Mastery Progress
                      </h4>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{masteredPct}%</div>
                   </div>

                   {/* Segmented Progress Bar */}
                   <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-8">
                      <div className="h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} title="Mastered" />
                      <div className="h-full bg-amber-400" style={{ width: `${learningPct}%` }} title="Learning" />
                      <div className="h-full bg-slate-200 dark:bg-slate-700" style={{ width: `${unseenPct}%` }} title="Unseen" />
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                         <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">{stats.mastered}</div>
                         <div className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">Mastered</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                         <div className="text-lg font-black text-amber-600 dark:text-amber-500 leading-none mb-1">{stats.learning}</div>
                         <div className="text-[9px] font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider">Learning</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                         <div className="text-lg font-black text-slate-600 dark:text-slate-300 leading-none mb-1">{stats.unseen}</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unseen</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* 3. STICKY SEARCH & FILTER BAR */}
          <div className="sticky top-0 z-40 bg-[#F8FAFC]/95 dark:bg-darkbg/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 transition-all">
             <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                
                {/* Search */}
                <div className="relative flex-1 w-full group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Search terms or definitions..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                   />
                </div>

                {/* Filters & Sort */}
                <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
                   {/* Filter Group */}
                   <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 shrink-0">
                      <button 
                        onClick={() => setFilterMode('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'all' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setFilterMode('new')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'new' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Sparkles size={12} /> New
                      </button>
                      <button 
                        onClick={() => setFilterMode('starred')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'starred' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Star size={12} className={filterMode === 'starred' ? 'fill-current' : ''} /> Starred
                      </button>
                   </div>

                   <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

                   {/* Sort Toggle */}
                   <button 
                      onClick={() => setSortBy(prev => prev === 'original' ? 'alpha' : 'original')}
                      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm shrink-0"
                      title={sortBy === 'original' ? "Switch to Alphabetical" : "Switch to Default"}
                   >
                      <ArrowUpDown size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                        {sortBy === 'original' ? 'Default Order' : 'A-Z Order'}
                      </span>
                   </button>
                </div>
             </div>
          </div>

          {/* 4. CARD LIST */}
          <div className="p-4 md:p-8 space-y-4 pb-24">
             {filteredCards.map((card) => (
                <div 
                   key={card.id} 
                   className="group bg-white dark:bg-darkcard rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-[var(--accent)]/30 transition-all relative overflow-hidden"
                >
                   {/* Status Indicator Line */}
                   <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                      card.mastery === 'mastered' ? 'bg-emerald-500' : 
                      card.mastery === 'learning' ? 'bg-amber-400' : 'bg-slate-100 dark:bg-slate-700'
                   }`} />

                   <div className="flex flex-col md:flex-row gap-6">
                      {/* Question Side */}
                      <div className="flex-1 md:w-[35%] border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-6">
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{card.displayId}</span>
                               {card.mastery === 'mastered' && (
                                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                     <CheckCircle2 size={10} /> Mastered
                                  </span>
                               )}
                               {card.mastery === 'learning' && (
                                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                     <Clock size={10} /> Learning
                                  </span>
                               )}
                               {card.mastery === 'unseen' && (
                                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                     <Circle size={10} /> Unseen
                                  </span>
                               )}
                            </div>
                            <button onClick={(e) => handleTTS(card.question, e)} className="text-slate-300 hover:text-[var(--accent)] transition-colors p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"><Volume2 size={16} /></button>
                         </div>
                         <div className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                            <MarkdownLite text={card.question} />
                         </div>
                      </div>

                      {/* Answer Side */}
                      <div className="flex-[2] relative pr-12 md:pl-2">
                         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 opacity-50">Definition / Answer</div>
                         <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            <MarkdownLite text={card.answer} />
                         </div>

                         {/* Action Buttons */}
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

             {filteredCards.length === 0 && (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                      <Filter size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No cards found</h3>
                   <p className="text-sm text-slate-500 mt-2">
                     {filterMode === 'starred' ? "You haven't starred any cards yet." : 
                      filterMode === 'new' ? "You've reviewed all cards in this set!" : 
                      "Try adjusting your search terms."}
                   </p>
                   {filterMode !== 'all' && (
                      <button onClick={() => setFilterMode('all')} className="mt-6 text-xs font-bold text-[var(--accent)] hover:underline uppercase tracking-widest">
                         View All Cards
                      </button>
                   )}
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};