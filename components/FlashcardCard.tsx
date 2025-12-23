import React, { useEffect, useRef } from 'react';
import { RotateCw, Lightbulb, ShieldCheck, Zap, BookOpen, Volume2, Info, Keyboard, Star } from 'lucide-react';
import { FlashcardUI } from '../types';

interface FlashcardCardProps {
  card: FlashcardUI;
  isFlipped: boolean;
  onFlip: () => void;
  onToggleFlag?: () => void;
  textSize?: 'normal' | 'large';
}

const MasteryIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'mastered') return <ShieldCheck size={14} className="text-emerald-500" />;
  if (status === 'learning') return <Zap size={14} className="text-amber-500" />;
  return <BookOpen size={14} className="text-slate-300 dark:text-slate-600" />;
};

const MarkdownText: React.FC<{ text: string, className?: string, anchorFirst?: boolean }> = ({ text, className = "", anchorFirst = false }) => {
  if (!text) return null;
  
  let processed = text;
  if (anchorFirst) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 0 && !sentences[0].startsWith('**')) {
      sentences[0] = `**${sentences[0]}**`;
      processed = sentences.join(' ');
    }
  }

  const processText = (str: string) => {
    let html = str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="text-[var(--accent)] not-italic font-bold">$1</em>')
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };
  return <span className={`${className} break-words leading-relaxed`} dangerouslySetInnerHTML={processText(processed)} />;
};

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  isFlipped,
  onFlip,
  onToggleFlag,
  textSize = 'normal'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll on flip or card change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [card.id, isFlipped]);

  const isShortQuestion = card.question.length < 80;
  
  // Dynamic text sizing classes
  const questionSize = textSize === 'large' 
    ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl' 
    : (isShortQuestion ? 'text-xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-lg sm:text-xl md:text-3xl');
    
  const answerSize = textSize === 'large'
    ? 'text-xl md:text-4xl'
    : 'text-lg md:text-3xl';
    
  const bodySize = textSize === 'large'
    ? 'text-base md:text-xl'
    : 'text-xs md:text-base';

  const handleTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToRead = isFlipped ? card.answer + ". " + card.rationale : card.question;
    const cleanText = textToRead.replace(/\*\*/g, '').replace(/_/g, '').replace(/\n/g, ' ');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full h-full perspective-1000 group/card">
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-out transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden">
          <div className="h-full bg-white dark:bg-darkcard rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden relative">
             <div className="h-1 md:h-1.5 w-full bg-[var(--accent)]" />

            <div className="flex-none px-4 py-3 md:p-6 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="px-2 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-[8px] md:text-[9px] font-black rounded uppercase tracking-wider">{card.category}</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <MasteryIcon status={card.masteryStatus} />
                  <span className="hidden md:inline text-[9px] font-black text-slate-500 uppercase tracking-tighter">{card.masteryStatus}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                 <button
                  onClick={(e) => { e.stopPropagation(); onToggleFlag?.(); }}
                  className={`p-2 rounded-xl transition-all active:scale-90 touch-manipulation ${
                    card.isFlagged 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-400' 
                      : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-yellow-400'
                  }`}
                  title="Star this card"
                >
                  <Star size={20} className={`md:w-5 md:h-5 ${card.isFlagged ? 'fill-current' : ''}`} />
                </button>
                 <button
                  onClick={handleTTS}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--accent)] transition-colors active:scale-95 touch-manipulation"
                  title="Read aloud"
                >
                  <Volume2 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 md:p-10 cursor-pointer relative"
              onClick={onFlip}
            >
              <div className="h-full flex flex-col justify-center py-2 md:py-4">
                <div className="text-[8px] md:text-[10px] font-black text-[var(--accent)] opacity-40 uppercase tracking-[0.3em] mb-3 md:mb-6">Board Validation Check</div>
                <h2 className={`
                  ${questionSize} 
                  font-black text-slate-900 dark:text-white leading-tight tracking-tight
                `}>
                  <MarkdownText text={card.question} />
                </h2>
              </div>
            </div>

            <div className="flex-none p-4 md:p-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span className="font-mono opacity-50">REF_{card.displayId}</span>
              <span className="uppercase tracking-[0.2em] group-hover/card:text-[var(--accent)] transition-colors flex items-center gap-2">
                <Keyboard size={10} /> <span className="hidden md:inline">Tap Space to Flip</span>
              </span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="h-full bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="h-1 md:h-1.5 w-full bg-emerald-500" />
            
            <div className="flex-none px-4 py-3 md:p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Lightbulb size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Rationale</span>
              </div>
               <div className="flex items-center gap-2">
                 <button
                    onClick={(e) => { e.stopPropagation(); onToggleFlag?.(); }}
                    className={`p-2 rounded-xl transition-all active:scale-90 touch-manipulation ${
                      card.isFlagged 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-400' 
                        : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-yellow-400'
                    }`}
                  >
                    <Star size={20} className={`md:w-5 md:h-5 ${card.isFlagged ? 'fill-current' : ''}`} />
                  </button>
                 <button
                    onClick={handleTTS}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-emerald-500 transition-colors touch-manipulation"
                    title="Read aloud"
                  >
                    <Volume2 size={18} className="md:w-5 md:h-5" />
                  </button>
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 md:p-10 cursor-pointer"
              onClick={onFlip}
            >
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
                <div>
                  <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Validated Response</div>
                  <div className={`${answerSize} font-black text-emerald-600 dark:text-emerald-400 leading-tight`}>
                    <MarkdownText text={card.answer} anchorFirst />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-darkcard p-4 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
                  <div className="absolute -left-1 top-6 md:top-8 w-1 h-8 md:h-12 bg-emerald-500/50 rounded-r-full" />
                  <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Analysis</div>
                  <div className={`${bodySize} text-slate-600 dark:text-slate-300 font-medium leading-relaxed`}>
                    <MarkdownText text={card.rationale} anchorFirst />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-none p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-2" onClick={onFlip}>
                <RotateCw size={12} /> <span className="hidden md:inline">Flip Back</span>
              </div>
              <div className="flex items-center gap-2">
                 <Keyboard size={12} className="text-slate-300" />
                 <span className="hidden md:inline opacity-60">Keys: 1 (Again), 3 (Good)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};