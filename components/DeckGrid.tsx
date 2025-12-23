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
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 animate-fade-in pb-32 relative">
      {/* Ambient background blobs for glassmorphism */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-slate-200 dark:border-slate-800/60 pb-10">
        <div className="w-16 h-16 bg-[var(--accent-soft)] text-[var(--accent)] rounded-[1.5rem] flex items-center justify-center shadow-soft flex-shrink-0 border border-[var(--accent)]/10 backdrop-blur-sm">
          <Layers size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-rose-500 to-indigo-600 tracking-tighter leading-none drop-shadow-sm">
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