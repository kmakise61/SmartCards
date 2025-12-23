
import React from 'react';
import { DeckCard } from './DeckCard';
import { DECK_LIST } from '../data/deck_config';
import { Layers } from 'lucide-react';

interface DeckGridProps {
  deckStats: Record<string, any>;
  onStartDeck: (deckId: string) => void;
  onViewDeck: (deckId: string) => void;
}

export const DeckGrid: React.FC<DeckGridProps> = ({ deckStats, onStartDeck, onViewDeck }) => {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 animate-fade-in pb-32">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-slate-200 dark:border-slate-800/60 pb-10">
        <div className="w-16 h-16 bg-[var(--accent-soft)] text-[var(--accent)] rounded-[1.5rem] flex items-center justify-center shadow-soft flex-shrink-0 border border-[var(--accent)]/10">
          <Layers size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Core Learning Modules
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium tracking-tight">
            Comprehensive NP domains designed for PNLE validation readiness.
          </p>
        </div>
      </div>

      {/* Adaptive Grid: 1 col on mobile, 2 on tablet, 3 on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DECK_LIST.map(deck => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            stats={deckStats[deck.id] || { total: 0, unseen: 0, learning: 0, mastered: 0 }}
            onStart={onStartDeck}
            onView={onViewDeck}
          />
        ))}
      </div>
    </div>
  );
};
