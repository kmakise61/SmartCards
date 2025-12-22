import React, { useState } from 'react';
import { Quiz, QuizQuestion } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Trophy, 
    Timer, 
    AlertCircle, 
    HelpCircle,
    ChevronLeft
} from 'lucide-react';
import StudySummary from '../study/StudySummary';
import { FormattedText } from '../study/Flashcard';

const QuizModule: React.FC = () => {
    const { quizzes } = useData();
    const { isDark } = useTheme();
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

    // Quiz Session State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleStartQuiz = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsCompleted(false);
        setIsAnswerChecked(false);
        setSelectedOption(null);
    };

    const handleOptionSelect = (index: number) => {
        if (!isAnswerChecked) {
            setSelectedOption(index);
        }
    };

    const handleCheckAnswer = () => {
        if (!activeQuiz || selectedOption === null) return;
        
        const currentQ = activeQuiz.questions[currentQuestionIndex];
        if (selectedOption === currentQ.correctOptionIndex) {
            setScore(s => s + 1);
        }
        setIsAnswerChecked(true);
    };

    const handleNext = () => {
        if (!activeQuiz) return;
        
        if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswerChecked(false);
            setSelectedOption(null);
        } else {
            setIsCompleted(true);
        }
    };

    const handleExit = () => {
        setActiveQuiz(null);
    };

    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

    // --- VIEW: QUIZ SUMMARY / COMPLETION ---
    if (isCompleted && activeQuiz) {
        return (
            <StudySummary 
                correct={score} 
                total={activeQuiz.questions.length} 
                onClose={handleExit} 
            />
        );
    }

    // --- VIEW: ACTIVE QUIZ SESSION ---
    if (activeQuiz) {
        const question = activeQuiz.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / activeQuiz.questions.length) * 100;

        return (
            <div className="w-full h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-right-8 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={handleExit} className={`flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 ${textPrimary}`}>
                        <ChevronLeft size={16} /> Quit Quiz
                    </button>
                    <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black uppercase tracking-widest text-accent`}>
                            Question {currentQuestionIndex + 1} / {activeQuiz.questions.length}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>

                {/* Question Card */}
                <div className="flex-1 flex flex-col gap-8 pb-20 overflow-y-auto custom-scrollbar">
                    <div className={`p-8 rounded-3xl border shadow-lg ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                        <h3 className={`text-xl md:text-2xl font-bold leading-relaxed ${textPrimary}`}>
                            <FormattedText text={question.text} />
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            let optionClass = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
                            let icon = <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />;
                            
                            if (isAnswerChecked) {
                                if (idx === question.correctOptionIndex) {
                                    optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-500';
                                    icon = <CheckCircle2 size={20} className="text-emerald-500" />;
                                } else if (idx === selectedOption) {
                                    optionClass = 'bg-red-500/20 border-red-500 text-red-500';
                                    icon = <XCircle size={20} className="text-red-500" />;
                                } else {
                                    optionClass += ' opacity-50';
                                }
                            } else if (selectedOption === idx) {
                                optionClass = 'bg-accent/10 border-accent text-accent ring-1 ring-accent';
                                icon = <div className="w-5 h-5 rounded-full border-[5px] border-current" />;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isAnswerChecked}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left font-medium transition-all duration-200 ${optionClass} ${textPrimary}`}
                                >
                                    <div className="shrink-0">{icon}</div>
                                    <span className="text-sm md:text-base">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation Reveal */}
                    {isAnswerChecked && (
                        <div className={`p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 ${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-2 text-blue-500 font-black text-xs uppercase tracking-widest">
                                <HelpCircle size={14} /> Rationale
                            </div>
                            <div className={`text-sm leading-relaxed ${textPrimary}`}>
                                <FormattedText text={question.explanation} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className={`fixed bottom-0 right-0 left-0 md:left-64 p-4 border-t backdrop-blur-xl z-20 flex justify-end ${isDark ? 'bg-[#0B1121]/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
                    {!isAnswerChecked ? (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={selectedOption === null}
                            className="px-8 py-3 rounded-xl bg-accent text-white font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            {currentQuestionIndex + 1 === activeQuiz.questions.length ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: QUIZ LIST ---
    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
                <h2 className={`text-3xl font-black tracking-tight ${textPrimary}`}>Practice Quizzes</h2>
                <p className={textSecondary}>Test your knowledge with board-style questions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                    <div 
                        key={quiz.id}
                        className={`group relative p-6 rounded-[2rem] border transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between h-64
                            ${isDark ? 'bg-white/5 border-white/10 hover:border-accent/50' : 'bg-white border-slate-200 hover:border-accent/50'}
                        `}
                        onClick={() => handleStartQuiz(quiz)}
                    >
                        <div className="space-y-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors`}>
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg leading-tight mb-2 ${textPrimary}`}>{quiz.title}</h3>
                                <p className={`text-sm line-clamp-2 ${textSecondary}`}>{quiz.description}</p>
                            </div>
                        </div>

                        <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60">
                                <HelpCircle size={14} />
                                <span>{quiz.questions.length} Questions</span>
                             </div>
                             <div className="w-8 h-8 rounded-full flex items-center justify-center border border-current opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-accent">
                                <ArrowRight size={14} />
                             </div>
                        </div>
                    </div>
                ))}

                {/* Coming Soon Card */}
                <div className={`p-6 rounded-[2rem] border border-dashed flex flex-col items-center justify-center text-center opacity-40 ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
                    <Timer size={32} className="mb-4" />
                    <h3 className="font-bold">More Coming Soon</h3>
                    <p className="text-xs">New sets released weekly</p>
                </div>
            </div>
        </div>
    );
};

export default QuizModule;