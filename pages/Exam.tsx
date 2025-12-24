
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { adaptCards } from '../utils/adaptCards';
import { DECK_LIST, DECKS } from '../data/deck_config';
import { ExamRecord, DeckId } from '../types';
import { db } from '../utils/db';
import { 
  ArrowLeft, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  AlertTriangle, 
  Brain, 
  ChevronRight,
  PlayCircle,
  FileCheck,
  History
} from 'lucide-react';

interface ExamProps {
  onExit: () => void;
}

type ExamState = 'setup' | 'active' | 'review';

export const Exam: React.FC<ExamProps> = ({ onExit }) => {
  const [state, setState] = useState<ExamState>('setup');
  
  // Setup State
  const [selectedDeck, setSelectedDeck] = useState<string>('COMPREHENSIVE');
  const [itemCount, setItemCount] = useState<number>(50);
  const [examHistory, setExamHistory] = useState<ExamRecord[]>([]);

  // Active Exam State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({}); // cardId -> isCorrect
  const [isRevealed, setIsRevealed] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load history on mount
  useEffect(() => {
    db.loadExams().then(recs => {
        setExamHistory(recs.sort((a, b) => b.date - a.date));
    });
  }, []);

  // Timer
  useEffect(() => {
    let interval: number;
    if (state === 'active') {
      interval = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, startTime]);

  const startExam = () => {
    const all = adaptCards();
    let pool = selectedDeck === 'COMPREHENSIVE' 
      ? all 
      : all.filter(c => c.category === selectedDeck);
    
    // Shuffle
    pool = pool.sort(() => 0.5 - Math.random());
    const selected = pool.slice(0, itemCount);
    
    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setIsRevealed(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setState('active');
  };

  const handleAnswer = (correct: boolean) => {
    const card = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [card.id]: correct }));
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      finishExam({ ...answers, [card.id]: correct });
    }
  };

  const finishExam = (finalAnswers: Record<string, boolean>) => {
    const correctCount = Object.values(finalAnswers).filter(Boolean).length;
    const incorrectIds = questions.filter(q => !finalAnswers[q.id]).map(q => q.id);
    
    const record: ExamRecord = {
      id: `EXAM_${Date.now()}`,
      date: Date.now(),
      deckId: selectedDeck,
      totalItems: questions.length,
      correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      incorrectCardIds: incorrectIds,
      durationSeconds: Math.floor((Date.now() - startTime) / 1000)
    };

    db.saveExam(record);
    setExamHistory(prev => [record, ...prev]);
    setState('review');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDERERS ---

  if (state === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in pb-32">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-darkcard rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Board Simulator</h1>
              <p className="text-slate-500 font-medium">Test your readiness under exam conditions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Scope</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedDeck('COMPREHENSIVE')}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${selectedDeck === 'COMPREHENSIVE' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                  >
                    <div className="font-bold text-sm">Comprehensive</div>
                    <div className="text-[10px] opacity-70">All Topics Mixed</div>
                  </button>
                  {DECK_LIST.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDeck(d.id)}
                      className={`p-4 rounded-xl text-left border-2 transition-all ${selectedDeck === d.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                    >
                      <div className="font-bold text-sm">{d.id}</div>
                      <div className="text-[10px] opacity-70 truncate">{d.title}</div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">2. Exam Length</h3>
                <div className="flex gap-4">
                  {[20, 50, 100].map(n => (
                    <button
                      key={n}
                      onClick={() => setItemCount(n)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${itemCount === n ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                    >
                      {n} Items
                    </button>
                  ))}
                </div>
              </section>

              <button 
                onClick={startExam}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle size={20} /> Begin Exam
              </button>
            </div>

            {/* History Column */}
            <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-12 pt-8 md:pt-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} /> Recent Attempts
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {examHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-sm">No exams taken yet.</p>
                  </div>
                ) : (
                  examHistory.map(exam => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">{exam.deckId}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                          {new Date(exam.date).toLocaleDateString()} • {Math.floor(exam.durationSeconds / 60)} min
                        </div>
                      </div>
                      <div className={`text-xl font-black ${exam.score >= 75 ? 'text-emerald-500' : exam.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {exam.score}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'active') {
    const card = questions[currentIndex];
    const progressPct = Math.round(((currentIndex) / questions.length) * 100);

    return (
      <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900">
        {/* Exam Header */}
        <div className="h-16 bg-white dark:bg-darkcard border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500">
              {currentIndex + 1}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Timer size={20} className="text-indigo-500" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="max-w-3xl w-full bg-white dark:bg-darkcard rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-8">
                {card.question.replace(/\*\*/g, '')}
              </h2>
              
              {isRevealed && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-l-4 border-indigo-500">
                  <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Correct Answer</div>
                  <p className="text-lg text-slate-800 dark:text-slate-200 font-medium mb-4">
                    {card.answer.replace(/\*\*/g, '')}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.rationale.replace(/\*\*/g, '')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white dark:bg-darkcard border-t border-slate-200 dark:border-slate-800 p-6">
          <div className="max-w-3xl mx-auto">
            {!isRevealed ? (
              <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg"
              >
                Show Answer
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 bg-rose-100 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/50 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <XCircle size={20} /> Incorrect
                </button>
                <button 
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 size={20} /> Correct
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review State
  const score = examHistory[0]?.score || 0;
  const rating = score >= 85 ? 'Topnotcher' : score >= 75 ? 'Passed' : score >= 60 ? 'Conditional' : 'Failed';
  const color = score >= 75 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in pb-32 flex flex-col items-center">
      <div className="bg-white dark:bg-darkcard rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 text-center w-full relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Trophy size={40} className={color} />
          </div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Exam Result</h2>
          <div className={`text-6xl md:text-8xl font-black ${color} tracking-tighter mb-4`}>
            {score}%
          </div>
          <div className={`inline-block px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm border ${score >= 75 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            {rating}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-12 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Items</div>
              <div className="text-xl font-black text-slate-700 dark:text-white">{examHistory[0]?.totalItems}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Duration</div>
              <div className="text-xl font-black text-slate-700 dark:text-white">{Math.floor((examHistory[0]?.durationSeconds || 0)/60)} min</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8 w-full max-w-md">
        <button onClick={onExit} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:border-slate-400 transition-all">
          Exit to Dashboard
        </button>
        <button onClick={() => setState('setup')} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all">
          Take Another
        </button>
      </div>
    </div>
  );
};