import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProgress } from '../context/ProgressContext';
import { DECK_LIST } from '../data/deck_config';
import { FlashcardUI, GradeStatus, QuizSessionRecord } from '../types';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Target, 
  RefreshCw, 
  Eye, 
  Brain, 
  List, 
  RotateCcw, 
  Award, 
  AlertTriangle,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shuffle
} from 'lucide-react';
import { db } from '../utils/db';
import { QuizCardBrowser } from '../components/QuizCardBrowser';

interface QuizModeProps {
  onExit: () => void;
}

type QuizPhase = 'setup' | 'active' | 'summary' | 'browser';

// --- HELPERS ---

const CleanText: React.FC<{ text: string, className?: string }> = ({ text, className = "" }) => {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<b class="font-black text-slate-900 dark:text-white">$1</b>')
    .replace(/_(.*?)_/g, '<span class="italic opacity-80">$1</span>')
    .replace(/\n/g, '<br/>');

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

// --- SUB-COMPONENTS ---

const ClozeSentence: React.FC<{ 
  text: string; 
  isRevealed: boolean; 
  onReveal: () => void; 
}> = ({ text, isRevealed, onReveal }) => {
  const parts = text.split(/{{(.*?)}}/);

  return (
    <div className="text-xl md:text-3xl font-bold leading-relaxed text-slate-700 dark:text-slate-300 text-center">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return <CleanText key={index} text={part} />;
        } else {
          return (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); onReveal(); }}
              disabled={isRevealed}
              className={`
                inline-flex items-center justify-center px-4 py-1 mx-1 align-middle rounded-2xl transition-all duration-500
                border-b-4 font-black tracking-wide text-lg md:text-xl transform
                ${isRevealed 
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] cursor-default scale-100 shadow-md shadow-[var(--accent-glow)]' 
                  : 'bg-slate-200 dark:bg-slate-700 text-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 hover:border-slate-400 cursor-pointer min-w-[100px] active:scale-95 active:border-b-0 translate-y-[-2px] active:translate-y-0'
                }
              `}
            >
              {isRevealed ? (
                part
              ) : (
                <span className="flex items-center justify-center opacity-30 text-slate-500 dark:text-slate-400 text-sm pointer-events-none select-none">
                  <span className="w-2 h-2 bg-current rounded-full mx-0.5 animate-bounce" />
                  <span className="w-2 h-2 bg-current rounded-full mx-0.5 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-current rounded-full mx-0.5 animate-bounce [animation-delay:0.4s]" />
                </span>
              )}
            </button>
          );
        }
      })}
    </div>
  );
};

const StandardReveal: React.FC<{
  question: string;
  answer: string;
  isRevealed: boolean;
  onReveal: () => void;
}> = ({ question, answer, isRevealed, onReveal }) => {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="text-xl md:text-3xl font-bold leading-tight text-slate-800 dark:text-slate-200 text-center">
        <CleanText text={question} />
      </div>
      
      <div className="relative group max-w-2xl mx-auto w-full">
        <button
          onClick={onReveal}
          disabled={isRevealed}
          className={`
            w-full text-center p-6 md:p-10 rounded-[2rem] transition-all duration-700 border-2 relative overflow-hidden
            ${isRevealed 
              ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-xl shadow-[var(--accent-glow)]' 
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-[var(--accent)]/50 cursor-pointer group-hover:shadow-lg'
            }
          `}
        >
          <div className={`
            text-2xl md:text-3xl font-black transition-all duration-500
            ${isRevealed ? 'text-[var(--accent)] blur-0 scale-100' : 'text-transparent blur-xl scale-95 select-none'}
          `}>
            <CleanText text={answer} />
          </div>
          
          {!isRevealed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-darkcard px-6 py-4 rounded-2xl shadow-xl text-sm font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-3 group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
                <Eye size={20} className="animate-pulse" /> Reveal Answer
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const QuizMode: React.FC<QuizModeProps> = ({ onExit }) => {
  const { allCards, applyGrade } = useProgress();
  
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [limit, setLimit] = useState<number>(20);
  const [isShuffleOn, setIsShuffleOn] = useState(true);
  const [currentDeckId, setCurrentDeckId] = useState<string>('');
  const [browsingDeckId, setBrowsingDeckId] = useState<string>('');
  
  // Session State
  const [queue, setQueue] = useState<FlashcardUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<Record<string, GradeStatus>>({});
  
  // UI State
  const [animating, setAnimating] = useState(false);
  const [showFinishWarning, setShowFinishWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use only decks tagged for Quiz
  const quizDecks = DECK_LIST.filter(d => d.visibility.includes('quiz'));

  const startSession = (deckId: string, customLimit?: number, specificCards?: FlashcardUI[]) => {
    let finalQueue: FlashcardUI[] = [];
    setCurrentDeckId(deckId);

    if (specificCards) {
      finalQueue = specificCards;
    } else {
      let deckCards = [];
      if (deckId === 'all') {
        const quizDeckIds = quizDecks.map(d => d.id);
        deckCards = allCards.filter(c => quizDeckIds.includes(c.category as any));
      } else {
        deckCards = allCards.filter(c => c.category === deckId);
      }
      
      finalQueue = isShuffleOn ? [...deckCards].sort(() => Math.random() - 0.5) : [...deckCards];
      
      const cap = customLimit || limit;
      if (cap > 0) {
        finalQueue = finalQueue.slice(0, cap);
      }
    }
    
    setQueue(finalQueue);
    setCurrentIndex(0);
    setSessionHistory({});
    setPhase('active');
    setIsRevealed(false);
    setShowFinishWarning(false);
  };

  const finalizeSession = useCallback(() => {
    if (Object.keys(sessionHistory).length > 0) {
        const correctCount = Object.values(sessionHistory).filter(g => g === 'good').length;
        const record: QuizSessionRecord = {
            id: `QUIZ_${Date.now()}`,
            date: Date.now(),
            deckId: currentDeckId,
            totalItems: queue.length,
            correctCount,
            score: Math.round((correctCount / queue.length) * 100),
        };
        db.saveQuizSession(record);
    }
    setPhase('summary');
  }, [sessionHistory, queue.length, currentDeckId]);

  const attemptFinish = useCallback(() => {
    const answeredCount = Object.keys(sessionHistory).length;
    if (answeredCount === 0) { setPhase('setup'); return; }
    if (answeredCount < queue.length) { setShowFinishWarning(true); } else { finalizeSession(); }
  }, [sessionHistory, queue.length, finalizeSession]);

  const handleNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsRevealed(false);
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        attemptFinish();
    }
  }, [currentIndex, queue.length, attemptFinish]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex]);

  const handleRate = useCallback((grade: GradeStatus) => {
    if (animating) return;
    setAnimating(true);
    const card = queue[currentIndex];
    applyGrade(card.id, grade);
    setSessionHistory(prev => ({ ...prev, [card.id]: grade }));
    setTimeout(() => {
      if (currentIndex === queue.length - 1) { finalizeSession(); } else { handleNext(); }
      setAnimating(false);
    }, 150);
  }, [queue, currentIndex, animating, applyGrade, handleNext, finalizeSession]);

  const gotItCount = Object.values(sessionHistory).filter(g => g === 'good').length;
  const missedCount = Object.values(sessionHistory).filter(g => g === 'again').length;

  useEffect(() => {
    if (phase !== 'active') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFinishWarning || animating) return;
      switch(e.code) {
        case 'Space': case 'Enter': e.preventDefault(); if (!isRevealed) setIsRevealed(true); break;
        case 'ArrowLeft': handlePrevious(); break;
        case 'ArrowRight': if (currentIndex < queue.length - 1) handleNext(); break;
        case 'Digit1': if (isRevealed) handleRate('again'); break;
        case 'Digit3': if (isRevealed) handleRate('good'); break;
        case 'Backspace': handlePrevious(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isRevealed, animating, handleRate, handlePrevious, handleNext, showFinishWarning, currentIndex, queue.length]);

  const handleRetryMissed = () => {
    const missedCards = queue.filter(card => sessionHistory[card.id] === 'again');
    startSession('retry', undefined, missedCards);
  };

  const openBrowser = (deckId: string) => { setBrowsingDeckId(deckId); setPhase('browser'); };
  const handleBrowserRate = (cardId: string, grade: GradeStatus) => applyGrade(cardId, grade);

  if (phase === 'browser' && browsingDeckId) {
    return <QuizCardBrowser deckId={browsingDeckId} onBack={() => setPhase('setup')} onStudy={(cardIds) => startSession(browsingDeckId, undefined, allCards.filter(c => cardIds.includes(c.id)))} onRateCard={handleBrowserRate} />;
  }

  if (phase === 'setup') {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fade-in pb-32">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--accent-soft)] text-[var(--accent)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
              <Zap size={36} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Active Recall</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Gizmo-style spaced repetition for high-yield terms.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${isShuffleOn ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}>
              <Shuffle size={16} /> <span className="hidden sm:inline">{isShuffleOn ? 'Shuffled' : 'Order'}</span>
            </button>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
              <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Cards</span>
              {[10, 20, 50, 0].map(val => (
                  <button key={val} onClick={() => setLimit(val)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${limit === val ? 'bg-[var(--accent)] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                    {val === 0 ? 'Max' : val}
                  </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizDecks.map(deck => (
            <div key={deck.id} className="relative bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:shadow-[var(--accent-glow)] hover:border-[var(--accent)]/50 transition-all text-left overflow-hidden group flex flex-col h-full">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-soft)] rounded-full blur-[50px] -mr-12 -mt-12 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-4 opacity-70 text-[var(--accent)]"><Brain size={18} /><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Cloze / Gizmo</span></div>
                <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight text-slate-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">{deck.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{deck.description}</p>
              </div>
              <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => startSession(deck.id)} className="flex-1 flex items-center justify-center gap-3 bg-[var(--accent)] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent-glow)]">Start <ArrowRight size={14} /></button>
                <button onClick={() => openBrowser(deck.id)} className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all" title="View Card List"><List size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    const percentage = Math.round((gotItCount / queue.length) * 100);
    const isPass = percentage >= 75;
    return (
      <div className="h-full bg-slate-100 dark:bg-darkbg flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white dark:bg-darkcard p-8 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center max-w-xl w-full relative overflow-hidden flex flex-col items-center animate-in zoom-in-95">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner bg-slate-50 dark:bg-slate-800">{isPass ? <Award size={48} className="text-emerald-500" /> : <Target size={48} className="text-[var(--accent)]" />}</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{isPass ? 'Excellent Work!' : 'Keep Practicing!'}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm md:text-base max-w-xs mx-auto">{isPass ? 'You have a strong grasp of these concepts.' : 'Review the missed items to strengthen retention.'}</p>
          <div className="flex items-baseline justify-center gap-2 mb-8"><span className={`text-6xl font-black tracking-tighter ${isPass ? 'text-emerald-500' : 'text-[var(--accent)]'}`}>{percentage}%</span><span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Score</span></div>
          <div className="grid grid-cols-2 gap-4 mb-10 w-full">
             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30"><div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{gotItCount}</div><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">Correct</div></div>
             <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30"><div className="text-2xl font-black text-rose-600 dark:text-rose-400">{missedCount}</div><div className="text-[10px] font-black uppercase tracking-widest text-rose-600/60 dark:text-rose-400/60">Missed</div></div>
          </div>
          <div className="space-y-3 w-full">
            {missedCount > 0 && <button onClick={handleRetryMissed} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"><RefreshCw size={18} /> Retry {missedCount} Missed</button>}
            <button onClick={() => setPhase('setup')} className={`w-full py-4 rounded-2xl font-bold transition-colors ${missedCount === 0 ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Start New Session</button>
            <button onClick={onExit} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-2">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'active') {
    const currentCard = queue[currentIndex];
    const isCloze = currentCard.question.includes('{{');
    const isLastCard = currentIndex === queue.length - 1;
    const progressPct = ((currentIndex + 1) / queue.length) * 100;

    return (
      <div className="h-full flex flex-col bg-slate-100 dark:bg-darkbg overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex-none h-16 md:h-20 bg-white dark:bg-darkcard border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-3">
             <button onClick={attemptFinish} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
               <X size={20} />
             </button>
             <div className="hidden sm:flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recall Active</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{currentDeckId}</span>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg min-w-[40px]">
                 <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400">{gotItCount}</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-lg min-w-[40px]">
                 <span className="text-[8px] font-black text-rose-600 dark:text-rose-400">{missedCount}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 min-w-[80px] sm:min-w-[150px]">
                <div className="flex justify-between w-full">
                    <span className="text-[9px] font-black text-slate-400 uppercase">{currentIndex + 1} / {queue.length}</span>
                    <span className="text-[9px] font-black text-[var(--accent)]">{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT - SCROLLABLE BUT CENTERED */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-100/30 dark:bg-darkbg/30 px-4 py-6 md:py-12 md:px-8">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 items-center min-h-full pb-32 md:pb-8">
            
            {/* CARD CONTAINER */}
            <div className={`w-full bg-white dark:bg-darkcard rounded-[2.5rem] p-8 md:p-14 shadow-2xl border border-slate-200/60 dark:border-white/5 relative flex flex-col min-h-[300px] md:min-h-[450px] justify-center transition-all duration-500 ${animating ? 'opacity-50 scale-98 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)]/5 to-transparent opacity-30 pointer-events-none rounded-[3rem]" />
              
              <div className="relative z-10 w-full">
                {isCloze ? (
                  <ClozeSentence text={currentCard.question} isRevealed={isRevealed} onReveal={() => setIsRevealed(true)} />
                ) : (
                  <StandardReveal question={currentCard.question} answer={currentCard.answer} isRevealed={isRevealed} onReveal={() => setIsRevealed(true)} />
                )}
                
                {isRevealed && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[var(--accent-soft)] text-[var(--accent)] rounded-xl flex items-center justify-center border border-[var(--accent)]/10">
                        <Target size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Validation</span>
                    </div>
                    <div className="text-sm md:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                      <CleanText text={currentCard.rationale} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLS - RE-DETACHED ON DESKTOP BUT CLOSE, FIXED ON MOBILE */}
            <div className="w-full md:max-w-2xl mt-4 md:mt-0 transition-all">
                {/* Mobile: Use bottom-fixed bar for thumbs. Desktop: Natural flow below card. */}
                <div className="md:contents">
                    <div className={`
                        flex items-stretch gap-3 h-16 md:h-20
                        fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-darkcard/80 backdrop-blur-xl md:bg-transparent md:dark:bg-transparent md:static md:p-0 md:backdrop-blur-none border-t border-slate-200 dark:border-slate-800 md:border-none
                        transition-all duration-300 z-50
                        ${isRevealed ? 'animate-in slide-in-from-bottom-2' : ''}
                    `}>
                        {/* Nav: Prev */}
                        <button 
                            onClick={handlePrevious} 
                            disabled={currentIndex === 0} 
                            className="aspect-square flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-[var(--accent)] transition-all disabled:opacity-20 active:scale-95 shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Action: Reveal or Rates */}
                        {!isRevealed ? (
                            <button 
                                onClick={() => setIsRevealed(true)}
                                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                <Eye size={20} className="animate-pulse" /> Reveal Answer
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleRate('again')} 
                                    className="flex-1 bg-white dark:bg-slate-900 text-rose-500 border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-500 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 transition-all active:scale-95 shadow-lg group"
                                >
                                    <XCircle size={18} className="group-hover:rotate-12 transition-transform" /> 
                                    <span>Missed It</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleRate('good')} 
                                    className="flex-1 bg-[var(--accent)] text-white hover:brightness-110 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 transition-all active:scale-95 shadow-xl shadow-[var(--accent-glow)] group"
                                >
                                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> 
                                    <span>Got It</span>
                                </button>
                            </>
                        )}

                        {/* Nav: Next */}
                        <button 
                            onClick={handleNext} 
                            disabled={isLastCard} 
                            className="aspect-square flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-[var(--accent)] transition-all disabled:opacity-20 active:scale-95 shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* HINT LEGEND (Desktop only) */}
                <div className="hidden md:flex justify-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] gap-6">
                    <span className="flex items-center gap-2"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">Space</kbd> Reveal</span>
                    <span className="flex items-center gap-2"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">1</kbd> Missed</span>
                    <span className="flex items-center gap-2"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">3</kbd> Got It</span>
                </div>
            </div>
          </div>
        </div>

        {/* MODAL: EXIT WARNING */}
        {showFinishWarning && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowFinishWarning(false)} />
             <div className="relative bg-white dark:bg-darkcard w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mx-auto mb-8 shadow-inner"><AlertTriangle size={40} /></div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Early Exit?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">Progress for answered items will be saved. Exit now?</p>
                <div className="flex flex-col gap-3">
                   <button onClick={finalizeSession} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity shadow-lg">Save & Close</button>
                   <button onClick={() => setShowFinishWarning(false)} className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Keep Going</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};
