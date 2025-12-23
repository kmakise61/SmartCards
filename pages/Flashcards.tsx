import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FlashcardCard } from '../components/FlashcardCard';
import { TriageButtons } from '../components/TriageButtons';
import { DeckGrid } from '../components/DeckGrid';
import { SetGrid } from '../components/SetGrid';
import { DeckDetails } from '../components/DeckDetails';
import { adaptCards } from '../utils/adaptCards';
import { DECKS, DECK_LIST } from '../data/deck_config';
import { FlashcardUI, GradeStatus, MasteryStatus, DeckId, FlashcardsViewMode, SetMetadata } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { 
  Search, 
  ArrowLeft,
  Trophy,
  ChevronRight,
  ArrowRight,
  Clock,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  MoreVertical,
  BrainCircuit,
  Filter
} from 'lucide-react';

export const Flashcards: React.FC<{ 
  initialFilters?: { mastery?: MasteryStatus[], deckId?: DeckId, setId?: string };
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  onResumeSession?: boolean;
  onExit?: () => void;
}> = ({ initialFilters, onResumeSession, onExit }) => {
  const { progress, applyGrade, getCardMastery, setLastActive, lastSession } = useProgress();
  const { settings } = useSettings();
  const lastProcessedFiltersRef = useRef<string | null>(null);

  const [viewMode, setViewMode] = useState<FlashcardsViewMode>(() => {
    if (onResumeSession && lastSession?.setId) return 'study';
    if (initialFilters?.setId) return 'study';
    if (initialFilters?.deckId) return 'sets';
    return 'decks';
  });

  const [selectedDeckId, setSelectedDeckId] = useState<DeckId | null>(() => {
    if (onResumeSession) return lastSession?.deckId || null;
    return initialFilters?.deckId || null;
  });
  
  const [selectedSetId, setSelectedSetId] = useState<string | null>(() => {
    if (onResumeSession) return lastSession?.setId || null;
    return initialFilters?.setId || null;
  });

  const [selectedMastery, setSelectedMastery] = useState<MasteryStatus[]>(() => {
    if (onResumeSession) return lastSession?.masteryFilters || [];
    return initialFilters?.mastery || [];
  });
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (onResumeSession) return lastSession?.currentIndex || 0;
    return 0;
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{msg: string, color: string} | null>(null);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const [sessionStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [sessionQueue, setSessionQueue] = useState<FlashcardUI[]>([]);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0 });

  const handleBack = useCallback(() => {
    if (viewMode === 'study') {
       setViewMode('sets');
       setSessionStats({ again: 0, hard: 0, good: 0 });
       setIsReviewMode(false);
    } else if (viewMode === 'sets') {
      setViewMode('decks');
    } else if (viewMode === 'details') {
      setViewMode('decks');
    } else {
      onExit?.();
    }
  }, [viewMode, onExit]);

  useEffect(() => {
    if (viewMode === 'study' && selectedSetId) {
      setLastActive(selectedDeckId, selectedSetId, currentIndex, selectedMastery);
    }
  }, [currentIndex, selectedMastery, viewMode, selectedDeckId, selectedSetId, setLastActive]);

  useEffect(() => {
    if (viewMode !== 'study' || isSessionFinished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode, isSessionFinished, sessionStartTime]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCard = useMemo(() => {
    const card = sessionQueue[currentIndex];
    if (!card) return null;
    const record = progress[card.id];
    return {
      ...card,
      seen: !!record?.seen,
      goodCount: record?.goodCount || 0,
      masteryStatus: getCardMastery(!!record?.seen, record?.goodCount || 0)
    };
  }, [sessionQueue, currentIndex, progress, getCardMastery]);

  const { setsByNp, deckStats, setStats } = useMemo(() => {
    const dStats: Record<string, any> = {};
    const sStats: Record<string, any> = {};
    const sets: Record<string, SetMetadata[]> = {};
    const setTracking = new Set<string>();
    const allCardsRaw = adaptCards();
    
    DECK_LIST.forEach(d => { 
      dStats[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0 }; 
      sets[d.id] = []; 
    });

    allCardsRaw.forEach(card => {
      const dId = card.category;
      const sId = card.setId;
      const record = progress[card.id];
      const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
      
      if (dStats[dId]) {
        dStats[dId].total++;
        dStats[dId][mastery]++;
      }

      if (!setTracking.has(sId)) {
        setTracking.add(sId);
        sStats[sId] = { total: 0, unseen: 0, learning: 0, mastered: 0 };
        sets[dId].push({ 
          setId: sId, 
          setName: card.setName, 
          setDescription: card.setDescription, 
          setTags: card.setTags || [], 
          np: card.np as any, 
          totalCards: 0 
        });
      }
      
      if (sStats[sId]) {
        sStats[sId].total++;
        sStats[sId][mastery]++;
      }
    });

    Object.keys(sets).forEach(np => {
      sets[np].forEach(s => {
        s.totalCards = sStats[s.setId].total;
      });
    });

    return { deckStats: dStats, setStats: sStats, setsByNp: sets };
  }, [progress, getCardMastery]);

  // SMART STUDY SESSION INITIALIZER
  const initializeStudySession = useCallback((setId: string, forceResetFilters = false, startIdx = 0, overrideFilters?: MasteryStatus[]) => {
    // Use overrideFilters if provided (for immediate click handling), otherwise use state
    let activeMastery = overrideFilters !== undefined ? overrideFilters : (forceResetFilters ? [] : selectedMastery);
    const allCardsRaw = adaptCards();

    // 1. Get all cards in the set
    let cardsInSet = allCardsRaw.filter(c => c.setId === setId);

    // 2. Attach dynamic mastery status to filter accurately
    const cardsWithStatus = cardsInSet.map(c => {
      const record = progress[c.id];
      const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
      return { ...c, _computedMastery: mastery, _record: record };
    });

    // 3. Determine Mode if no explicit filters were provided
    let finalQueue: typeof cardsWithStatus = [];
    let isReview = false;

    if (activeMastery.length > 0) {
      // User specifically asked for certain categories via header buttons
      finalQueue = cardsWithStatus.filter(c => activeMastery.includes(c._computedMastery));
    } else {
      // Smart Default: Prioritize Learning > Unseen. Exclude Mastered unless that's all there is.
      const learningCards = cardsWithStatus.filter(c => c._computedMastery === 'learning');
      const unseenCards = cardsWithStatus.filter(c => c._computedMastery === 'unseen');
      const masteredCards = cardsWithStatus.filter(c => c._computedMastery === 'mastered');

      if (learningCards.length > 0 || unseenCards.length > 0) {
        // Normal Study Mode: Show items that need work
        finalQueue = [...learningCards, ...unseenCards];
        // Sort: Learning first (active recall), then Unseen (new)
        finalQueue.sort((a, b) => {
          if (a._computedMastery === 'learning' && b._computedMastery !== 'learning') return -1;
          if (a._computedMastery !== 'learning' && b._computedMastery === 'learning') return 1;
          return 0;
        });
      } else {
        // Review Mode: Only mastered cards left
        finalQueue = masteredCards;
        isReview = true;
      }
    }

    if (forceResetFilters) setSelectedMastery([]);

    setSessionQueue(finalQueue);
    setSelectedSetId(setId);
    setIsReviewMode(isReview);
    
    const effectiveDeckId = (finalQueue[0]?.category as DeckId) || selectedDeckId;
    if (effectiveDeckId) setSelectedDeckId(effectiveDeckId);

    setViewMode('study');
    setCurrentIndex(startIdx < finalQueue.length ? startIdx : 0);
    setIsFlipped(false);
    setIsSessionFinished(false);
    setSessionStats({ again: 0, hard: 0, good: 0 });
  }, [progress, getCardMastery, selectedMastery, selectedDeckId]);

  // Handle clicking the header badges
  const handleFilterToggle = (status: MasteryStatus) => {
    if (!selectedSetId) return;

    let newFilters: MasteryStatus[];
    if (selectedMastery.includes(status)) {
      newFilters = selectedMastery.filter(s => s !== status);
    } else {
      newFilters = [...selectedMastery, status];
    }
    
    setSelectedMastery(newFilters);
    // Re-initialize immediately with new filter set
    initializeStudySession(selectedSetId, false, 0, newFilters);
  };

  useEffect(() => {
    const filterKey = JSON.stringify(initialFilters) + (onResumeSession ? '_resume' : '');
    if ((initialFilters?.setId || onResumeSession) && lastProcessedFiltersRef.current !== filterKey) {
      lastProcessedFiltersRef.current = filterKey;
      const sid = onResumeSession ? lastSession?.setId : initialFilters?.setId;
      const idx = onResumeSession ? lastSession?.currentIndex : 0;
      if (sid) initializeStudySession(sid, false, idx);
    }
  }, [initialFilters, onResumeSession, initializeStudySession, lastSession]);

  const handleRate = useCallback((grade: GradeStatus) => {
    if (!currentCard || showFeedback) return;
    
    let msg = '';
    let color = '';
    const record = progress[currentCard.id];
    const prevGoodCount = record?.goodCount || 0;

    applyGrade(currentCard.id, grade);
    setSessionStats(prev => ({ ...prev, [grade]: prev[grade] + 1 }));

    setSessionQueue(prev => {
      const newQueue = [...prev];
      if (grade === 'again') {
        msg = 'RETRY QUEUED';
        color = 'bg-rose-500';
        const insertPos = Math.min(currentIndex + 3, newQueue.length);
        newQueue.splice(insertPos, 0, currentCard);
      } else if (grade === 'hard') {
        msg = 'REVISIT SOON';
        color = 'bg-amber-500';
        const insertPos = Math.min(currentIndex + 8, newQueue.length);
        newQueue.splice(insertPos, 0, currentCard);
      } else {
        msg = prevGoodCount === 0 ? 'CONCEPT VALIDATED' : 'MASTERY ACHIEVED';
        color = 'bg-emerald-500';
      }
      return newQueue;
    });

    setShowFeedback({ msg, color });

    setTimeout(() => {
      setShowFeedback(null);
      setIsFlipped(false);
      if (currentIndex < sessionQueue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsSessionFinished(true);
      }
    }, 400); 
  }, [currentCard, showFeedback, applyGrade, currentIndex, sessionQueue.length, progress]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    if (viewMode !== 'study' || isSessionFinished || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showFeedback) return;

      switch(e.key) {
        case ' ':
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case '1':
          if (isFlipped) handleRate('again');
          break;
        case '2':
          if (isFlipped) handleRate('hard');
          break;
        case '3':
          if (isFlipped) handleRate('good');
          break;
        case 'ArrowLeft':
          if (!isFlipped && currentIndex > 0) {
             setCurrentIndex(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (!isFlipped && currentIndex < sessionQueue.length - 1) {
             setCurrentIndex(prev => prev + 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isSessionFinished, currentCard, isFlipped, handleRate, currentIndex, sessionQueue.length, showFeedback]);


  const studyProgressPercent = Math.round(((currentIndex + 1) / (sessionQueue.length || 1)) * 100);

  // --- RENDERS ---

  if (viewMode !== 'study') {
    return (
      <div className="h-full bg-gray-50 dark:bg-darkbg overflow-y-auto overflow-x-hidden">
        {viewMode === 'decks' && <DeckGrid deckStats={deckStats} onStartDeck={(id) => { setSelectedDeckId(id as DeckId); setViewMode('sets'); }} onViewDeck={(id) => { setSelectedDeckId(id as DeckId); setViewMode('details'); }} />}
        {viewMode === 'details' && selectedDeckId && <DeckDetails deck={DECKS[selectedDeckId]} stats={deckStats[selectedDeckId]} onBack={() => setViewMode('decks')} onStartSession={(id, mastery) => { setSelectedDeckId(id as DeckId); if(mastery) setSelectedMastery(mastery); setViewMode('sets'); }} />}
        {viewMode === 'sets' && selectedDeckId && <SetGrid npConfig={DECKS[selectedDeckId]} sets={setsByNp[selectedDeckId] || []} setStats={setStats} onBack={() => setViewMode('decks')} onStartSet={(sid) => initializeStudySession(sid, false)} />}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-slate-100 dark:bg-darkbg flex flex-col h-[100dvh] overflow-hidden">
      
      {/* 1. COMPACT TOP HEADER */}
      <header className="flex-none h-14 bg-white dark:bg-darkcard border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <button 
            onClick={handleBack} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[120px] sm:max-w-full">
              {selectedSetId ? setsByNp[selectedDeckId || 'NP1'].find(s => s.setId === selectedSetId)?.setName : 'Review'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[7px] sm:text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">{selectedDeckId}</span>
              {isReviewMode && <span className="text-[7px] sm:text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/30 px-1.5 rounded bg-emerald-50 dark:bg-emerald-500/10">Review Mode</span>}
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={8} /> {formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-[100px] sm:max-w-[200px] md:max-w-md mx-2 md:mx-4">
          <div className="relative h-1 md:h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-all duration-700 ease-out" 
              style={{ width: `${studyProgressPercent}%` }} 
            />
          </div>
          <div className="mt-1 flex justify-between items-center text-[7px] md:text-[9px] font-black text-slate-400 uppercase">
            <span>{currentIndex + 1}/{sessionQueue.length}</span>
            <span className="text-[var(--accent)]">{studyProgressPercent}%</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {(['unseen', 'learning', 'mastered'] as MasteryStatus[]).map(status => (
            <button 
              key={status} 
              onClick={() => handleFilterToggle(status)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all active:scale-95 ${selectedMastery.includes(status) ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2 sm:p-4 md:p-10 bg-slate-100/50 dark:bg-darkbg/50">
        
        {showFeedback && (
          <div className={`absolute top-4 z-[100] px-6 py-2 rounded-full font-black text-[10px] md:text-xs text-white shadow-2xl animate-in zoom-in slide-in-from-top-2 duration-300 ${showFeedback.color} border-2 border-white/20`}>
            {showFeedback.msg}
          </div>
        )}

        <div className="w-full h-full max-w-5xl min-h-0 flex flex-col items-center justify-center relative">
          
          {/* Conditional Navigation Arrows for Tablet/Desktop (Side Floating) */}
          {!isSessionFinished && !isFlipped && (
            <>
              <button 
                onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className="hidden md:flex absolute left-[-3rem] lg:left-[-4.5rem] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-[var(--accent)] shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-0 touch-manipulation z-10"
              >
                <ArrowLeft size={28} />
              </button>
              <button 
                onClick={() => currentIndex < sessionQueue.length - 1 && setCurrentIndex(prev => prev + 1)}
                disabled={currentIndex === sessionQueue.length - 1}
                className="hidden md:flex absolute right-[-3rem] lg:right-[-4.5rem] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-[var(--accent)] shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-0 touch-manipulation z-10"
              >
                <ArrowRight size={28} />
              </button>
            </>
          )}

          {isSessionFinished ? (
            <div className="w-full max-w-md bg-white dark:bg-darkcard p-8 md:p-10 rounded-[2.5rem] text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Trophy size={48} className="text-emerald-500" />
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 duration-1000" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Session Complete</h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-8 font-medium">Diagnostic loop finished.</p>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
                 <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <div className="text-xl font-black text-red-500">{sessionStats.again}</div>
                    <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Again</div>
                 </div>
                 <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <div className="text-xl font-black text-amber-500">{sessionStats.hard}</div>
                    <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Hard</div>
                 </div>
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="text-xl font-black text-emerald-500">{sessionStats.good}</div>
                    <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Good</div>
                 </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                 <button onClick={() => initializeStudySession(selectedSetId!, true)} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] text-slate-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] sm:text-xs">
                    Replay
                 </button>
                 <button onClick={handleBack} className="flex-1 py-4 bg-[var(--accent)] text-white font-black rounded-2xl shadow-glow hover:scale-105 transition-all uppercase tracking-widest text-[10px] sm:text-xs">
                    Finish
                 </button>
              </div>
            </div>
          ) : currentCard ? (
            <div className="w-full h-full min-h-0 flex flex-col" key={currentCard.id}>
              <div className="flex-1 min-h-0 mb-3 md:mb-6 w-full max-w-4xl mx-auto">
                <FlashcardCard 
                  card={currentCard} 
                  isFlipped={isFlipped} 
                  onFlip={() => setIsFlipped(!isFlipped)} 
                />
              </div>
              
              {/* MOBILE ACTION BAR - Covers default nav bar */}
              <div className="flex-none h-16 sm:h-20 md:h-24 flex items-center justify-center w-full max-w-3xl mx-auto px-1">
                {isFlipped ? (
                  <div className="w-full h-full animate-in slide-in-from-bottom-2 duration-300 pb-1">
                    <TriageButtons onRate={handleRate} disabled={showFeedback !== null} />
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-2 md:gap-4 h-full pb-1">
                    {/* Previous Button (Mobile) */}
                    <button 
                      onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)} 
                      disabled={currentIndex === 0}
                      className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    {/* REVEAL Button */}
                    <button 
                      onClick={() => setIsFlipped(true)} 
                      className="flex-1 h-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-2xl shadow-glow flex items-center justify-center gap-2 sm:gap-3 hover:brightness-110 active:scale-[0.98] transition-all group touch-manipulation"
                    >
                      <Zap size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> 
                      <span className="flex items-center gap-2">REVEAL ANALYSIS <span className="hidden sm:inline opacity-50 text-[10px] normal-case tracking-normal">(Space)</span></span>
                    </button>

                    {/* Next Button (Mobile) */}
                    <button 
                      onClick={() => currentIndex < sessionQueue.length - 1 && setCurrentIndex(prev => prev + 1)} 
                      disabled={currentIndex === sessionQueue.length - 1}
                      className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="text-center p-10 bg-white dark:bg-darkcard rounded-[2.5rem] shadow-soft max-w-sm border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <Search size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">No Matching Items</h3>
                <p className="text-sm text-slate-500 mb-8">No cards matching your criteria were found in this loop.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => initializeStudySession(selectedSetId!, true)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-transform">Reset Filters</button>
                  <button onClick={() => handleFilterToggle('mastered')} className="w-full py-4 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-black rounded-2xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">Show Mastered</button>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};