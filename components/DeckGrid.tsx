
import React, { useState } from 'react';
import { DeckCard } from './DeckCard';
import { DECK_LIST } from '../data/deck_config';
import { Layers, LayoutGrid, List as ListIcon } from 'lucide-react';

interface DeckGridProps {
  deckStats: Record<string, any>;
  onStartDeck: (deckId: string) => void;
  onViewDeck: (deckId: string) => void;
}

export const DeckGrid: React.FC<DeckGridProps> = ({ deckStats, onStartDeck, onViewDeck }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 animate-fade-in pb-32 relative">
      {/* Ambient background blobs for glassmorphism */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800/60 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--accent-soft)] text-[var(--accent)] rounded-[2rem] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] flex-shrink-0 border border-[var(--accent)]/10 backdrop-blur-sm">
            <Layers size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-indigo-600">Modules</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium tracking-tight max-w-lg text-pretty">
              Comprehensive nursing domains designed for board exam mastery.
            </p>
          </div>
        </div>

        {/* View Toggle - HIDDEN on Mobile to enforce the optimal vertical stack layout */}
        <div className="hidden md:flex bg-white dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm self-start md:self-auto backdrop-blur-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            title="List View"
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Layout Logic */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8"
        : "flex flex-col gap-4"
      }>
        {DECK_LIST.map(deck => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            stats={deckStats[deck.id] || { total: 0, unseen: 0, learning: 0, mastered: 0 }}
            onStart={onStartDeck}
            onView={onViewDeck}
            layout={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
