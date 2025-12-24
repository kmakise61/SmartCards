
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ArrowRight, Zap, BookOpen, ShieldCheck, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (cardId: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectCard }) => {
  const { allCards } = useProgress();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter logic using allCards from context
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQ = query.toLowerCase();
    return allCards.filter(c => 
      c.question.toLowerCase().includes(lowerQ) || 
      c.answer.toLowerCase().includes(lowerQ) ||
      c.tags.some(t => t.toLowerCase().includes(lowerQ))
    ).slice(0, 50); // Limit results for performance
  }, [query, allCards]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectCard(results[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectCard, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-darkcard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="text-slate-400" size={24} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            placeholder="Search concepts, drugs, or laws..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              {query ? 'No matching cards found.' : 'Type to search across all decks.'}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Found {results.length} results
              </div>
              {results.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => { onSelectCard(card.id); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-4 transition-all group ${
                    idx === selectedIndex 
                      ? 'bg-[var(--accent)] text-white shadow-md' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`mt-1 shrink-0 ${idx === selectedIndex ? 'text-white/80' : 'text-slate-400'}`}>
                    <Zap size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        idx === selectedIndex 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {card.category}
                      </span>
                      <span className={`text-[10px] truncate font-mono ${
                        idx === selectedIndex ? 'text-white/60' : 'text-slate-400'
                      }`}>
                        {card.setId}
                      </span>
                    </div>
                    <p className={`text-sm font-bold line-clamp-1 ${idx === selectedIndex ? 'text-white' : ''}`}>
                      {card.question.replace(/\*\*/g, '')}
                    </p>
                    <p className={`text-xs line-clamp-1 mt-0.5 ${
                      idx === selectedIndex ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {card.answer.replace(/\*\*/g, '')}
                    </p>
                  </div>
                  {idx === selectedIndex && (
                    <ArrowRight size={16} className="self-center animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-sans">↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-sans">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-sans">esc</kbd> Close</span>
          </div>
          <div>
            Pro Tip: Search via tags like "Pharm" or "Ob"
          </div>
        </div>
      </div>
    </div>
  );
};
