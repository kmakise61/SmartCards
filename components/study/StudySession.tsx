import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Maximize2, Minimize2, Zap, Target, Layers, ArrowRight, Lock, Unlock } from 'lucide-react';
import Flashcard from './Flashcard';
import StudyControls from './StudyControls';
import StudySummary from './StudySummary';
import { CardRating, Flashcard as FlashcardType } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StudySessionProps {
  deckId?: string;
  mode?: 'standard' | 'quick-fire' | 'drill'; 
  drillCards?: FlashcardType[]; 
  onExit: () => void;
  toggleFocusMode: (focused: boolean) => void;
}

type SessionStatus = 'initializing' | 'active' | 'empty' | 'complete';

const StudySession: React.FC<StudySessionProps> = ({ deckId, mode = 'standard', drillCards, onExit, toggleFocusMode }) => {
  const { isDark } = useTheme();
  const { cards, logReview, preferences, stats } = useData();
  
  // State Machine for Session Lifecycle
  const [status, setStatus] = useState<SessionStatus>('initializing');
  
  // Session Data
  const [queue, setQueue] = useState<FlashcardType[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  
  // UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // New: Allow user to bypass limits from the "Empty" screen
  const [ignoreLimits, setIgnoreLimits] = useState(false);
  
  // New: Track WHY the queue is empty (True empty vs Limit reached)
  const [limitReachedDetails, setLimitReachedDetails] = useState<{ newBlocked: number; reviewBlocked: number } | null>(null);

  // Focus Mode Effect
  useEffect(() => {
    toggleFocusMode(isFocusMode);
    return () => toggleFocusMode(false);
  }, [isFocusMode, toggleFocusMode]);

  // --- 1. QUEUE GENERATION (Run Once or when ignoreLimits changes) ---
  useEffect(() => {
    // Only rebuild queue if we are initializing OR if we just turned on ignoreLimits
    if (status !== 'initializing' && !ignoreLimits) return;
    // If we are already active and ignoreLimits didn't just change, don't rebuild
    if (status === 'active' && queue.length > 0) return;

    const buildQueue = () => {
        // A. Drill Mode (Direct pass-through)
        if (mode === 'drill' && drillCards && drillCards.length > 0) {
            return [...drillCards];
        }

        let pool = [...cards];

        // B. Filter by Deck (if applicable)
        if (deckId) {
            pool = pool.filter(c => c.deckId === deckId);
        }

        // C. Quick Fire (Random 15)
        if (mode === 'quick-fire') {
            return pool.sort(() => Math.random() - 0.5).slice(0, 15);
        }

        // D. Standard Study Mode (The Algorithm)
        const now = new Date();
        
        // D1. Identify Candidates
        // "New": Never studied
        const candidatesNew = pool.filter(c => c.status === 'new');
        // "Due": Review/Learning cards where nextReview is in the past or null (safety)
        const candidatesDue = pool.filter(c => 
            c.status !== 'new' && 
            (!c.nextReview || new Date(c.nextReview) <= now)
        );

        // D2. Calculate Limits
        const today = new Date().toISOString().split('T')[0];
        const dailyProgress = stats.dailyProgress?.date === today 
            ? stats.dailyProgress 
            : { newStudied: 0, reviewStudied: 0 };

        // Ensure we don't have negative limits
        // IF ignoreLimits is true, we override the daily remaining allowance with the session size
        const limitNew = ignoreLimits 
            ? preferences.sessionSize 
            : Math.max(0, preferences.newCardsPerDay - dailyProgress.newStudied);
            
        const limitReview = ignoreLimits 
            ? preferences.sessionSize 
            : Math.max(0, preferences.reviewCardsPerDay - dailyProgress.reviewStudied);
        
        // CHECK: Are we blocked by limits?
        if (!ignoreLimits && mode === 'standard') {
            const newBlockedCount = candidatesNew.length > 0 && limitNew <= 0 ? candidatesNew.length : 0;
            const reviewBlockedCount = candidatesDue.length > 0 && limitReview <= 0 ? candidatesDue.length : 0;
            
            if (newBlockedCount > 0 || reviewBlockedCount > 0) {
                setLimitReachedDetails({ newBlocked: newBlockedCount, reviewBlocked: reviewBlockedCount });
            } else {
                setLimitReachedDetails(null);
            }
        }

        // D3. Select Cards
        // Priority: Due > New
        // Sort Due cards by date (oldest due first)
        let selectedDue = candidatesDue.sort((a,b) => (a.nextReview && b.nextReview) ? a.nextReview.localeCompare(b.nextReview) : 0).slice(0, limitReview);
        
        // If we filled the session with reviews, great. If not, add new cards.
        let selectedNew = candidatesNew.slice(0, limitNew);

        let finalBatch = [...selectedDue, ...selectedNew];

        // D4. High Yield Sort (Optional)
        if (preferences.highYieldMode) {
            const highYieldKeywords = ['high yield', 'priority', 'board', 'triage', 'essential'];
            finalBatch.sort((a, b) => {
                const aYield = a.tags.some(t => highYieldKeywords.some(k => t.toLowerCase().includes(k))) ? 1 : 0;
                const bYield = b.tags.some(t => highYieldKeywords.some(k => t.toLowerCase().includes(k))) ? 1 : 0;
                return bYield - aYield; // Higher yield first
            });
        }

        // D5. Session Batch Size
        // We ensure we don't exceed session size, but if ignoreLimits is on, we ensure we actually fill the session if cards exist
        const batchSize = preferences.sessionSize || 25;
        if (finalBatch.length > batchSize) {
            finalBatch = finalBatch.slice(0, batchSize);
        }

        return finalBatch;
    };

    const newQueue = buildQueue();

    if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        setStatus('active');
    } else {
        setStatus('empty');
    }

  }, [cards, deckId, mode, drillCards, preferences, stats, status, ignoreLimits]);


  // --- 2. INTERACTION HANDLERS ---

  const handleRate = useCallback((rating: CardRating) => {
    // 1. Get current card
    const currentCard = queue[0];
    if (!currentCard) return;

    // 2. Log to Global Stats (Async side effect)
    logReview(currentCard.id, rating);

    // 3. Update Session Stats
    const isCorrect = rating === 'good' || rating === 'easy';
    setSessionStats(prev => ({
        total: prev.total + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct
    }));

    // 4. Update Queue (The Critical Logic)
    setQueue(prevQueue => {
        const [head, ...rest] = prevQueue;
        
        // Re-queue Logic:
        // "Again" -> Always re-insert into this session.
        // "Hard" -> Re-insert only if it was New/Learning (needs reinforcement).
        const shouldRequeue = rating === 'again' || (rating === 'hard' && (head.status === 'new' || head.status === 'learning'));

        if (shouldRequeue) {
            // Insert back into queue (spaced out by 3 cards or at end)
            const insertIndex = Math.min(rest.length, 3);
            const newQ = [...rest];
            newQ.splice(insertIndex, 0, head); // Insert strictly the same object reference for the session loop
            return newQ;
        } 
        
        return rest;
    });

    // 5. Reset UI
    setIsFlipped(false);

  }, [queue, logReview]);

  // --- 3. COMPLETION CHECK ---
  useEffect(() => {
      if (status === 'active' && queue.length === 0) {
          setStatus('complete');
      }
  }, [queue, status]);


  // --- 4. KEYBOARD SHORTCUTS ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status !== 'active') return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isFlipped) setIsFlipped(true);
    } else if (isFlipped) {
      if (e.key === '1') handleRate('again');
      if (e.key === '2') handleRate('hard');
      if (e.key === '3') handleRate('good');
      if (e.key === '4') handleRate('easy');
    }
  }, [isFlipped, status, handleRate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleContinueAnyway = () => {
      setIgnoreLimits(true);
      setStatus('initializing');
  };


  // --- 5. RENDER STATES ---

  if (status === 'initializing') {
      return (
          <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
      );
  }

  if (status === 'complete') {
      return (
        <StudySummary 
            correct={sessionStats.correct} 
            total={sessionStats.total} 
            onClose={onExit} 
        />
      );
  }

  if (status === 'empty') {
      const isDailyLimitReached = (mode === 'standard' && !ignoreLimits) && limitReachedDetails !== null;
      const { newBlocked, reviewBlocked } = limitReachedDetails || { newBlocked: 0, reviewBlocked: 0 };

      return (
        <div className="flex h-full items-center justify-center flex-col gap-6 text-center p-6 animate-in fade-in zoom-in-95">
            <div className={`p-6 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                {isDailyLimitReached ? (
                    <Lock size={48} className="text-amber-500 opacity-80" />
                ) : (
                    <Target size={48} className="text-emerald-500 opacity-80" />
                )}
            </div>
            
            <div className="max-w-md">
                <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {isDailyLimitReached ? "Daily Limit Reached" : "All Caught Up!"}
                </h2>
                <div className={`text-sm leading-relaxed space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isDailyLimitReached ? (
                        <>
                            <p>You have hit your customized daily limits.</p>
                            <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest mt-2">
                                {newBlocked > 0 && <span className="text-blue-500">{newBlocked} New Available</span>}
                                {reviewBlocked > 0 && <span className="text-orange-500">{reviewBlocked} Reviews Due</span>}
                            </div>
                        </>
                    ) : (
                        <p>There are no more cards matching your criteria right now.</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                {isDailyLimitReached && (
                    <button 
                        onClick={handleContinueAnyway}
                        className={`w-full py-4 rounded-xl bg-accent text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all`}
                    >
                        <Unlock size={14} /> Continue (Cram Mode)
                    </button>
                )}

                <button 
                    onClick={onExit} 
                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                        isDark 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
      );
  }

  // ACTIVE STATE
  const currentCard = queue[0];
  if (!currentCard) return null; // Safety check

  const getModeLabel = () => {
      if (mode === 'drill') return 'Weakness Drill';
      if (mode === 'quick-fire') return 'Quick Fire';
      return ignoreLimits ? 'Cram Mode (Unlimited)' : 'Daily Review';
  };

  return (
    <div className={`relative w-full h-full flex flex-col transition-all duration-700 ${isFocusMode ? 'z-50' : ''}`}>
      
      {/* Header */}
      <div className="flex-none p-4 md:p-6 w-full max-w-4xl mx-auto flex flex-col gap-4 z-20">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                 onClick={onExit}
                 className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isDark || isFocusMode ? 'text-white' : 'text-slate-800'}`}
              >
                 <X size={20} />
              </button>
              <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${isDark || isFocusMode ? 'text-white' : 'text-slate-800'}`}>
                        {getModeLabel()}
                    </span>
                    {mode === 'quick-fire' && <Zap size={12} className="text-accent fill-accent" />}
                    {mode === 'drill' && <Target size={12} className="text-red-500 fill-red-500" />}
                    {ignoreLimits && <Unlock size={12} className="text-amber-500" />}
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`font-bold ${isDark || isFocusMode ? 'text-white' : 'text-slate-900'}`}>
                        {queue.length} Remaining
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-2 rounded-xl border transition-all ${isDark || isFocusMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                title="Toggle Focus Mode"
              >
                 {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
           <div 
             className={`h-full transition-all duration-500 ${mode === 'drill' ? 'bg-red-500' : 'bg-accent'}`} 
             style={{ width: `${Math.max(5, (100 / (queue.length + sessionStats.total)) * sessionStats.total)}%` }}
           />
        </div>
      </div>

      {/* Card Area - Adjusted for Flex grow and better centering on mobile */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 gap-6 overflow-y-auto custom-scrollbar z-10 pb-32 md:pb-20">
         <div className="w-full h-full flex flex-col justify-center">
             <Flashcard 
                card={currentCard} 
                isFlipped={isFlipped} 
                onFlip={() => setIsFlipped(!isFlipped)} 
             />
         </div>

         {/* Controls - Fixed height wrapper to prevent jumping */}
         <div className="w-full flex justify-center flex-none min-h-[100px]">
             <StudyControls 
                onRate={handleRate} 
                disabled={!isFlipped}
                card={currentCard}
             />
         </div>
      </div>

    </div>
  );
};

export default StudySession;
