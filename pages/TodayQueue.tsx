import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { isDue, calculateNextReview } from '../lib/spacedRepetition';
import { RefreshCw, CheckCircle, RotateCcw } from 'lucide-react';

interface TodayQueueProps {
  cards: Card[];
  onUpdateCard: (updatedCard: Card) => void;
}

const TodayQueue: React.FC<TodayQueueProps> = ({ cards, onUpdateCard }) => {
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [inputAnswer, setInputAnswer] = useState('');

  // Initialize queue
  useEffect(() => {
    const dueCards = cards.filter(c => isDue(c.dueDate));
    setQueue(dueCards);
    setIsFinished(dueCards.length === 0);
  }, [cards]);

  const currentCard = queue[currentIndex];

  const handleNext = (quality: 0 | 3 | 4 | 5) => {
    if (!currentCard) return;

    // Calculate new state
    const changes = calculateNextReview(currentCard, quality);
    const updatedCard = { ...currentCard, ...changes };

    // Update global state (which might trigger useEffect, but we handle queue locally for now to avoid jumpiness)
    onUpdateCard(updatedCard);

    // Move to next
    if (currentIndex < queue.length - 1) {
      setIsFlipped(false);
      setInputAnswer('');
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">All Caught Up!</h2>
        <p className="text-text-muted mb-8 max-w-md">
          Great job! You've reviewed all cards scheduled for today. 
          Check back tomorrow or create new cards to keep learning.
        </p>
        <button 
          onClick={() => window.location.reload()} // Simple reload to simulate going home or finding more work
          className="btn-primary px-6 py-2 rounded-xl text-sm font-medium border border-border bg-surface hover:bg-white/10"
        >
          Review Ahead (Custom Session)
        </button>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>Queue: {currentIndex + 1} / {queue.length}</span>
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono uppercase">
          {currentCard.type}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 relative perspective-1000 group">
        <div 
          className={`
            relative w-full min-h-[400px] transition-all duration-500 transform-style-3d 
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-white/20"
            style={{ transform: 'rotateY(0deg)' }}
          >
            <h3 className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
              {currentCard.front}
            </h3>
            
            {currentCard.type === 'input' && !isFlipped && (
               <input
                type="text"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="glass-input px-4 py-3 rounded-xl w-full max-w-md text-center mt-4"
                onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(true)}
               />
            )}

            {!isFlipped && (
              <button 
                onClick={() => setIsFlipped(true)}
                className="mt-8 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-105"
              >
                Show Answer
              </button>
            )}
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-white/20"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="overflow-y-auto max-h-[250px] w-full px-4 scrollbar-hide">
               <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
                {currentCard.back}
              </h3>
              {currentCard.notes && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-left">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs uppercase tracking-wide block mb-1">
                    Clinical Pearl
                  </span>
                  <p className="text-sm text-text-muted">{currentCard.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8 grid grid-cols-4 gap-2 w-full max-w-lg">
              <button onClick={() => handleNext(0)} className="flex flex-col items-center p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors group">
                <span className="text-sm font-bold mb-1">Again</span>
                <span className="text-xs text-text-muted group-hover:text-red-400">&lt; 1m</span>
              </button>
              <button onClick={() => handleNext(3)} className="flex flex-col items-center p-2 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-colors group">
                <span className="text-sm font-bold mb-1">Hard</span>
                <span className="text-xs text-text-muted group-hover:text-orange-400">2d</span>
              </button>
              <button onClick={() => handleNext(4)} className="flex flex-col items-center p-2 rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-colors group">
                <span className="text-sm font-bold mb-1">Good</span>
                <span className="text-xs text-text-muted group-hover:text-green-400">4d</span>
              </button>
              <button onClick={() => handleNext(5)} className="flex flex-col items-center p-2 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-colors group">
                <span className="text-sm font-bold mb-1">Easy</span>
                <span className="text-xs text-text-muted group-hover:text-blue-400">7d</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper styles for 3d flip are usually not in tailwind by default, adding inline style or assuming plugin. 
          I will add the utility classes to the global CSS in index.html, but here I used standard classes. 
          I need to ensure `rotate-y-180` etc exists. I'll add them to index.html style block actually. 
      */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default TodayQueue;
