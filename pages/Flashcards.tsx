
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FlashcardCard } from '../components/FlashcardCard';
import { TriageButtons } from '../components/TriageButtons';
import { DeckGrid } from '../components/DeckGrid';
import { SetGrid } from '../components/SetGrid';
import { DeckDetails } from '../components/DeckDetails';
import { CardBrowser } from '../components/CardBrowser';
import { DECKS, DECK_LIST } from '../data/deck_config';
import { FlashcardUI, GradeStatus, MasteryStatus, DeckId, FlashcardsViewMode, SetMetadata, SessionFilters } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Shuffle, 
  Type, 
  Settings2,
  Target,
  Eye
} from 'lucide-react';

// Utility to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const Flashcards: React.FC<{ 
  initialFilters?: SessionFilters;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  onResumeSession?: boolean;
  onExit?: () => void;
}> = ({ initialFilters, isFocusMode = false, onResumeSession, onExit }) => {
  const { allCards, progress, applyGrade, toggleFlag, getCardMastery, setLastActive, lastSession } = useProgress();
  const { settings } = useSettings();
  const lastProcessedFiltersRef = useRef<string | null>(null);

  // VIEW MODE & NAVIGATION
  const [viewMode, setViewMode] = useState<FlashcardsViewMode>(() => {
    if (onResumeSession && lastSession?.setId) return 'study';
    if (initialFilters?.setId || initialFilters?.cardIds) return 'study';
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

  // STUDY SESSION STATE
  const [sessionQueue, setSessionQueue] = useState<FlashcardUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<Record<string, GradeStatus>>({});
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{msg: string, color: string} | null>(null);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [isTargetedReview, setIsTargetedReview] = useState(false);
  
  // SESSION SETTINGS
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGradedMode, setIsGradedMode] = useState(true); // Default to Graded (Track Progress)
  
  const [sessionStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // --- DATA LOADING & PREP ---
  // Use allCards from context (includes edits) instead of static adaptCards()
  const { setsByNp, deckStats, setStats } = useMemo(() => {
    const dStats: Record<string, any> = {};
    const sStats: Record<string, any> = {};
    const sets: Record<string, SetMetadata[]> = {};
    const setTracking = new Set<string>();
    
    DECK_LIST.forEach(d => { 
      dStats[d.id] = { total: 0, unseen: 0, learning: 0, mastered: 0 }; 
      sets[d.id] = []; 
    });

    allCards.forEach(card => {
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
  }, [progress, getCardMastery, allCards]);

  const handleBack = useCallback(() => {
    if (viewMode === 'study') {
       if (isTargetedReview) {
         if (selectedSetId && viewMode === 'study' && !isTargetedReview) {
            setViewMode('browser');
         } else {
            onExit?.();
         }
       } else {
         setViewMode('browser');
         setIsRated(false);
         setSessionResults({});
       }
    } else if (viewMode === 'browser') {
      setViewMode('sets');
    } else if (viewMode === 'sets') {
      setViewMode('decks');
    } else if (viewMode === 'details') {
      setViewMode('decks');
    } else {
      onExit?.();
    }
  }, [viewMode, onExit, isTargetedReview, selectedSetId]);

  useEffect(() => {
    if (viewMode === 'study' && selectedSetId && !isTargetedReview && !isShuffleOn) {
      setLastActive(selectedDeckId, selectedSetId, currentIndex, selectedMastery);
    }
  }, [currentIndex, selectedMastery, viewMode, selectedDeckId, selectedSetId, setLastActive, isTargetedReview, isShuffleOn]);

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
      isFlagged: !!record?.isFlagged,
      masteryStatus: getCardMastery(!!record?.seen, record?.goodCount || 0)
    };
  }, [sessionQueue, currentIndex, progress, getCardMastery]);

  const initializeStudySession = useCallback((
    setId: string | null, 
    startIdx = 0, 
    overrideFilters?: MasteryStatus[],
    specificCardIds?: string[],
    shuffle = false
  ) => {
    let finalQueue: any[] = [];
    let targeted = false;

    if (specificCardIds && specificCardIds.length > 0) {
      const cardsInList = allCards.filter(c => specificCardIds.includes(c.id));
      finalQueue = cardsInList;
      targeted = true;
    } 
    else if (setId) {
      let activeMastery = overrideFilters || selectedMastery;
      let cardsInSet = allCards.filter(c => c.setId === setId);

      if (activeMastery.length > 0) {
        finalQueue = cardsInSet.filter(c => {
           const record = progress[c.id];
           const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
           return activeMastery.includes(mastery);
        });
      } else {
        finalQueue = cardsInSet;
      }
      setSelectedSetId(setId);
    }

    if (shuffle) {
      finalQueue = shuffleArray(finalQueue);
      startIdx = 0;
    } else {
      finalQueue.sort((a, b) => {
         const mA = getCardMastery(!!progress[a.id]?.seen, progress[a.id]?.goodCount || 0);
         const mB = getCardMastery(!!progress[b.id]?.seen, progress[b.id]?.goodCount || 0);
         if (mA === 'unseen' && mB !== 'unseen') return -1;
         if (mA === 'learning' && mB === 'mastered') return -1;
         return 0;
      });
    }

    setSessionQueue(finalQueue);
    setCurrentIndex(Math.min(startIdx, Math.max(0, finalQueue.length - 1)));
    
    setSessionResults({});
    setIsSessionFinished(false);
    setIsRated(false);
    setIsFlipped(false);
    setIsTargetedReview(targeted);
    setIsShuffleOn(shuffle);
    setIsGradedMode(true);
    
    const effectiveDeckId = (finalQueue[0]?.category as DeckId) || selectedDeckId;
    if (effectiveDeckId) setSelectedDeckId(effectiveDeckId);

    setViewMode('study');
  }, [progress, getCardMastery, selectedMastery, selectedDeckId, allCards]);

  const handleSetClick = (setId: string) => {
    setSelectedSetId(setId);
    setViewMode('browser');
  };

  const handleFilterToggle = (status: MasteryStatus) => {
    if (isTargetedReview || !selectedSetId) return;
    const newFilters = selectedMastery.includes(status) 
      ? selectedMastery.filter(s => s !== status)
      : [...selectedMastery, status];
    
    setSelectedMastery(newFilters);
    initializeStudySession(selectedSetId, 0, newFilters, undefined, isShuffleOn);
  };

  const toggleShuffle = () => {
    if (!selectedSetId) return;
    const newShuffleState = !isShuffleOn;
    setIsShuffleOn(newShuffleState);
    initializeStudySession(selectedSetId, 0, selectedMastery, undefined, newShuffleState);
    setIsSettingsOpen(false);
  };

  const goToNextCard = useCallback(() => {
    setIsRated(false);
    setIsFlipped(false);
    
    if (currentIndex < sessionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsSessionFinished(true);
    }
  }, [currentIndex, sessionQueue.length]);

  const handleRate = useCallback((grade: GradeStatus) => {
    if (!currentCard || showFeedback || isRated) return;
    
    applyGrade(currentCard.id, grade);
    setSessionResults(prev => ({ ...prev, [currentCard.id]: grade }));
    
    let msg = '';
    let color = '';
    if (grade === 'again') {
        msg = 'STILL LEARNING';
        color = 'bg-amber-500';
    } else {
        msg = 'KNOW';
        color = 'bg-emerald-500';
    }

    setShowFeedback({ msg, color });
    setIsRated(true);

    setTimeout(() => {
      setShowFeedback(null);
      if (settings.autoAdvance) {
        goToNextCard();
      }
    }, 300); 
  }, [currentCard, showFeedback, isRated, applyGrade, settings.autoAdvance, goToNextCard]);

  useEffect(() => {
    const filterKey = JSON.stringify(initialFilters) + (onResumeSession ? '_resume' : '');
    if (lastProcessedFiltersRef.current !== filterKey) {
      lastProcessedFiltersRef.current = filterKey;
      if (onResumeSession && lastSession?.setId) {
        initializeStudySession(lastSession.setId, lastSession.currentIndex);
      } else if (initialFilters?.cardIds) {
        initializeStudySession(null, 0, undefined, initialFilters.cardIds);
      } else if (initialFilters?.setId) {
        setSelectedSetId(initialFilters.setId);
        setViewMode('browser');
      }
    }
  }, [initialFilters, onResumeSession, initializeStudySession, lastSession]);

  useEffect(() => {
    if (viewMode !== 'study' || isSessionFinished || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if user is typing in a form or editor (e.g. Edit Card Modal)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable || 
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      if (showFeedback) return;
      switch(e.key) {
        case ' ':
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          if (isRated && !settings.autoAdvance) goToNextCard();
          else setIsFlipped(prev => !prev);
          break;
        case '1':
          if (isGradedMode && isFlipped && !isRated) handleRate('again');
          break;
        case '3':
          if (isGradedMode && isFlipped && !isRated) handleRate('good');
          break;
        case 'ArrowLeft':
          if (!isGradedMode && currentIndex > 0) setCurrentIndex(prev => prev - 1);
          break;
        case 'ArrowRight':
          if (isRated && !settings.autoAdvance) goToNextCard();
          else if (!isGradedMode && currentIndex < sessionQueue.length - 1) setCurrentIndex(prev => prev + 1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isSessionFinished, currentCard, isFlipped, isRated, handleRate, currentIndex, sessionQueue.length, showFeedback, settings.autoAdvance, goToNextCard, isGradedMode]);

  const studyProgressPercent = Math.round(((currentIndex + 1) / (sessionQueue.length || 1)) * 100);
  
  const knowCount = Object.values(sessionResults).filter(r => r === 'good').length;
  const learningCount = Object.values(sessionResults).filter(r => r === 'again').length;
  const totalPlayed = knowCount + learningCount;
  const masteryPercent = totalPlayed > 0 ? Math.round((knowCount / totalPlayed) * 100) : 0;

  if (viewMode !== 'study') {
    return (
      <div className="h-full bg-gray-50 dark:bg-darkbg overflow-y-auto overflow-x-hidden">
        {viewMode === 'decks' && <DeckGrid deckStats={deckStats} onStartDeck={(id) => { setSelectedDeckId(id as DeckId); setViewMode('sets'); }} onViewDeck={(id) => { setSelectedDeckId(id as DeckId); setViewMode('details'); }} />}
        
        {viewMode === 'details' && selectedDeckId && <DeckDetails deck={DECKS[selectedDeckId]} stats={deckStats[selectedDeckId]} onBack={() => setViewMode('decks')} onStartSession={(id, mastery) => { setSelectedDeckId(id as DeckId); if(mastery) setSelectedMastery(mastery); setViewMode('sets'); }} />}
        
        {viewMode === 'sets' && selectedDeckId && <SetGrid npConfig={DECKS[selectedDeckId]} sets={setsByNp[selectedDeckId] || []} setStats={setStats} onBack={() => setViewMode('decks')} onStartSet={handleSetClick} />}
        
        {viewMode === 'browser' && selectedSetId && (
          <CardBrowser 
            setId={selectedSetId} 
            onBack={() => setViewMode('sets')} 
            isSidebarOpen={!isFocusMode}
            onStudy={(filters) => {
              const startIdx = filters?.startIndex || 0;
              if (filters?.cardIds) {
                initializeStudySession(null, 0, undefined, filters.cardIds, filters?.shuffle);
              } else if (filters?.setId) {
                initializeStudySession(filters.setId, startIdx, filters.mastery, undefined, filters?.shuffle);
              } else {
                initializeStudySession(selectedSetId, 0, undefined, undefined, filters?.shuffle);
              }
            }}
          />
        )}
      </div>
    );
  }

  // ... (rest of render logic remains same)
  let headerTitle = 'Review';
  if (isTargetedReview) headerTitle = 'Focused Review';
  else if (selectedSetId) headerTitle = setsByNp[selectedDeckId || 'NP1']?.find(s => s.setId === selectedSetId)?.setName || 'Unknown Set';

  return (
    <div className="fixed inset-0 z-[120] bg-slate-100 dark:bg-darkbg flex flex-col h-[100dvh] overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none h-14 bg-white dark:bg-darkcard border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 shadow-sm relative">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <button 
            onClick={handleBack} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[120px] sm:max-w-full">
              {headerTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[7px] sm:text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">{selectedDeckId || 'Custom'}</span>
              {isShuffleOn && (
                 <span className="text-[7px] sm:text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                  <Shuffle size={8} /> Mixed
                </span>
              )}
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={8} /> {formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

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

        <div className="flex items-center gap-2">
          {/* Graded Mode Toggle */}
          <button
            onClick={() => setIsGradedMode(!isGradedMode)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isGradedMode
                ? 'bg-indigo-500 text-white shadow-glow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isGradedMode ? "Graded Mode: Rate cards to advance" : "Browse Mode: Freely navigate cards"}
          >
            {isGradedMode ? (
              <>
                <Target size={12} /> Graded
              </>
            ) : (
              <>
                <Eye size={12} /> Browse
              </>
            )}
          </button>

          {/* Options Menu Trigger */}
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-slate-100 dark:bg-slate-800 text-[var(--accent)]' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Settings2 size={20} />
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-darkcard rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Session Options</div>
                
                {/* Mobile Toggle inside menu */}
                <button 
                  onClick={() => setIsGradedMode(!isGradedMode)}
                  className="w-full flex sm:hidden items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    {isGradedMode ? <Target size={14} /> : <Eye size={14} />} 
                    {isGradedMode ? 'Graded Mode' : 'Browse Mode'}
                  </span>
                  <CheckCircle2 size={14} className={isGradedMode ? "text-indigo-500" : "text-slate-200"} />
                </button>

                <button 
                  onClick={toggleShuffle}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2"><Shuffle size={14} /> Shuffle Cards</span>
                  {isShuffleOn && <CheckCircle2 size={14} className="text-emerald-500" />}
                </button>
                <button 
                  onClick={() => setIsLargeText(!isLargeText)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2"><Type size={14} /> Large Text</span>
                  {isLargeText && <CheckCircle2 size={14} className="text-emerald-500" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* OVERLAY for Settings */}
      {isSettingsOpen && <div className="fixed inset-0 z-20 bg-transparent" onClick={() => setIsSettingsOpen(false)} />}

      <main className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2 sm:p-4 md:p-10 bg-slate-100/50 dark:bg-darkbg/50">
        
        {/* FEEDBACK TOAST */}
        {showFeedback && (
          <div className={`absolute top-4 z-[100] px-6 py-2 rounded-full font-black text-[10px] md:text-xs text-white shadow-2xl animate-in zoom-in slide-in-from-top-2 duration-300 ${showFeedback.color} border-2 border-white/20`}>
            {showFeedback.msg}
          </div>
        )}

        <div className="w-full h-full max-w-5xl min-h-0 flex flex-col items-center justify-center relative">
          
          {/* NAVIGATION ARROWS (Desktop) */}
          {!isSessionFinished && !isGradedMode && (
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

          {/* --- CONTENT --- */}
          {isSessionFinished ? (
            // === END OF SESSION SUMMARY SCREEN ===
            <div className="w-full max-w-4xl bg-white dark:bg-darkcard rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500 overflow-hidden flex flex-col md:flex-row">
              
              {/* LEFT: RESULTS */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-8">Amazing! You're almost there.</h2>
                 
                 <div className="flex items-center gap-8 mb-8 w-full max-w-sm">
                    {/* Donut Chart Simulation with SVG */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                       <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                          {/* Background Circle */}
                          <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                          {/* Progress Circle (Green) */}
                          <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${masteryPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-800 dark:text-white">
                          {masteryPercent}%
                       </div>
                    </div>

                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Know</span>
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{knowCount}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Still learning</span>
                          <span className="text-xl font-black text-amber-600 dark:text-amber-500">{learningCount}</span>
                       </div>
                    </div>
                 </div>

                 <button onClick={handleBack} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest flex items-center gap-2">
                    <ArrowLeft size={14} /> Back to Dashboard
                 </button>
              </div>

              {/* RIGHT: NEXT STEPS */}
              <div className="flex-1 p-8 md:p-12 bg-slate-50/50 dark:bg-black/20 flex flex-col justify-center">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Next steps</h3>
                 
                 <div className="space-y-4">
                    {learningCount > 0 && (
                      <button 
                        onClick={() => {
                           const againIds = Object.keys(sessionResults).filter(id => sessionResults[id] === 'again');
                           initializeStudySession(null, 0, undefined, againIds);
                        }}
                        className="w-full py-5 px-6 bg-[var(--accent)] text-white font-black rounded-2xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
                      >
                         <span className="uppercase tracking-widest text-xs">Focus on {learningCount} Still learning cards</span>
                         <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    <button 
                       onClick={() => {
                          if (isTargetedReview && initialFilters?.cardIds) {
                             initializeStudySession(null, 0, undefined, initialFilters.cardIds);
                          } else if (selectedSetId) {
                             initializeStudySession(selectedSetId, 0);
                          }
                       }}
                       className="w-full py-5 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-3 group"
                    >
                       <RotateCcw size={16} className="group-hover:-rotate-90 transition-transform duration-500" />
                       <span className="uppercase tracking-widest text-xs">Restart Flashcards</span>
                    </button>
                 </div>
              </div>

            </div>
          ) : currentCard ? (
            // === FLASHCARD STUDY VIEW ===
            <div className="w-full h-full min-h-0 flex flex-col" key={currentCard.id}>
              <div className="flex-1 min-h-0 mb-3 md:mb-6 w-full max-w-4xl mx-auto">
                <FlashcardCard 
                  card={currentCard} 
                  isFlipped={isFlipped}
                  textSize={isLargeText ? 'large' : 'normal'}
                  onToggleFlag={() => toggleFlag(currentCard.id)}
                  onFlip={() => {
                    if (isRated && !settings.autoAdvance) {
                      goToNextCard();
                    } else {
                      setIsFlipped(!isFlipped);
                    }
                  }} 
                />
              </div>
              
              <div className="flex-none h-16 sm:h-20 md:h-24 flex items-center justify-center w-full max-w-3xl mx-auto px-1">
                {isFlipped ? (
                  isGradedMode ? (
                    // GRADED MODE (Back): Show Triage Buttons or Next if rated
                    isRated && !settings.autoAdvance ? (
                      <button 
                        onClick={goToNextCard}
                        className="w-full h-full bg-emerald-600 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl shadow-glow flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                      >
                        NEXT MODULE <ArrowRight size={18} />
                      </button>
                    ) : (
                      <div className="w-full h-full animate-in slide-in-from-bottom-2 duration-300 pb-1">
                        <TriageButtons onRate={handleRate} disabled={showFeedback !== null || isRated} />
                      </div>
                    )
                  ) : (
                    // BROWSE MODE (Back): Show Navigation Controls
                    <div className="w-full flex items-center gap-2 md:gap-4 h-full pb-1">
                      <button 
                        onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)} 
                        disabled={currentIndex === 0}
                        className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                      >
                        <ArrowLeft size={20} />
                      </button>

                      <button 
                        onClick={goToNextCard}
                        className="flex-1 h-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                      >
                        NEXT CARD <ArrowRight size={16} />
                      </button>

                      <button 
                        onClick={() => currentIndex < sessionQueue.length - 1 && setCurrentIndex(prev => prev + 1)} 
                        disabled={currentIndex === sessionQueue.length - 1}
                        className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  )
                ) : (
                  // FRONT OF CARD
                  <div className="w-full flex items-center gap-2 md:gap-4 h-full pb-1">
                    {!isGradedMode && (
                      <button 
                        onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)} 
                        disabled={currentIndex === 0}
                        className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                      >
                        <ArrowLeft size={20} />
                      </button>
                    )}

                    <button 
                      onClick={() => setIsFlipped(true)} 
                      className="flex-1 h-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-2xl shadow-glow flex items-center justify-center gap-2 sm:gap-3 hover:brightness-110 active:scale-[0.98] transition-all group touch-manipulation"
                    >
                      <Zap size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> 
                      <span>REVEAL ANALYSIS</span>
                    </button>

                    {!isGradedMode && (
                      <button 
                        onClick={() => currentIndex < sessionQueue.length - 1 && setCurrentIndex(prev => prev + 1)} 
                        disabled={currentIndex === sessionQueue.length - 1}
                        className="md:hidden h-full aspect-square flex items-center justify-center bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 disabled:opacity-20 active:scale-95 transition-all shadow-sm touch-manipulation"
                      >
                        <ArrowRight size={20} />
                      </button>
                    )}
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
                <p className="text-sm text-slate-500 mb-8">No cards matching your criteria were found.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => selectedSetId && initializeStudySession(selectedSetId)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-transform">Reset Filters</button>
                  <button onClick={handleBack} className="w-full py-4 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-black rounded-2xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">Go Back</button>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};
