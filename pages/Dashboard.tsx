import React from 'react';
import { Card, Deck } from '../types';
import { Brain, Flame, Target, Clock, ArrowRight } from 'lucide-react';
import { isDue } from '../lib/spacedRepetition';

interface DashboardProps {
  cards: Card[];
  decks: Deck[];
  onNavigate: (page: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cards, decks, onNavigate }) => {
  const dueCount = cards.filter(c => isDue(c.dueDate)).length;
  const newCount = cards.filter(c => c.state === 'new').length;
  const masteredCount = cards.filter(c => c.interval > 21).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain size={120} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome back, Student Nurse!</h2>
        <p className="text-text-muted mb-6 max-w-lg">
          You have <span className="text-primary font-bold">{dueCount} cards</span> due for review today. 
          Consistency is the key to passing the PNLE.
        </p>
        <button 
          onClick={() => onNavigate('today')}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/30 transition-all flex items-center"
        >
          Start Review Session
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl mr-4">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{dueCount}</div>
            <div className="text-sm text-text-muted">Due Today</div>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl mr-4">
            <Target size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{masteredCount}</div>
            <div className="text-sm text-text-muted">Mastered Cards</div>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl mr-4">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">12m</div>
            <div className="text-sm text-text-muted">Study Time</div>
          </div>
        </div>
      </div>

      {/* Recent Decks */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {decks.slice(0, 4).map(deck => (
            <div 
              key={deck.id}
              onClick={() => onNavigate('decks')}
              className="glass-panel p-4 rounded-xl hover:border-primary/50 cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${deck.masteryLevel}%`, backgroundColor: deck.color }}
                ></div>
              </div>
              <h4 className="font-semibold truncate">{deck.title}</h4>
              <p className="text-xs text-text-muted mt-1">{deck.cardCount} Cards</p>
            </div>
          ))}
          <div 
             onClick={() => onNavigate('create-card')}
             className="glass-panel p-4 rounded-xl border-dashed border-2 flex flex-col items-center justify-center text-text-muted hover:text-primary hover:border-primary cursor-pointer transition-colors"
          >
            <PlusCircleIcon size={24} className="mb-2" />
            <span className="text-sm font-medium">Create New Deck</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for the icon in grid
const PlusCircleIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default Dashboard;
