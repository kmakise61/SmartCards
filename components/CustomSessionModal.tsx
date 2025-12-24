
import React, { useState, useMemo } from 'react';
import { X, Layers, Filter, PlayCircle, CheckCircle2, Circle } from 'lucide-react';
import { DECK_LIST } from '../data/deck_config';
import { DeckId, MasteryStatus } from '../types';
import { useProgress } from '../context/ProgressContext';

interface CustomSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (cardIds: string[]) => void;
}

export const CustomSessionModal: React.FC<CustomSessionModalProps> = ({ isOpen, onClose, onStart }) => {
  const { allCards, progress, getCardMastery } = useProgress();
  
  // Selection State
  const [selectedDecks, setSelectedDecks] = useState<DeckId[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<MasteryStatus[]>(['learning', 'unseen']);
  const [limit, setLimit] = useState<number>(20);

  // Calculate potential card count
  const matchingCards = useMemo(() => {
    if (!isOpen) return [];
    return allCards.filter(card => {
      // Deck Filter
      if (selectedDecks.length > 0 && !selectedDecks.includes(card.category as DeckId)) {
        return false;
      }
      // Status Filter
      const record = progress[card.id];
      const status = getCardMastery(!!record?.seen, record?.goodCount || 0);
      if (selectedStatus.length > 0 && !selectedStatus.includes(status)) {
        return false;
      }
      return true;
    });
  }, [isOpen, selectedDecks, selectedStatus, progress, getCardMastery, allCards]);

  const toggleDeck = (id: DeckId) => {
    setSelectedDecks(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const toggleStatus = (status: MasteryStatus) => {
    setSelectedStatus(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const handleStart = () => {
    // Randomize and limit
    const shuffled = [...matchingCards].sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, limit === -1 ? undefined : limit).map(c => c.id);
    onStart(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-darkcard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="text-[var(--accent)]" /> Custom Cram
            </h2>
            <p className="text-xs text-slate-500 font-medium">Build a targeted review session</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Deck Selection */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Select Domains (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              {DECK_LIST.map(deck => (
                <button
                  key={deck.id}
                  onClick={() => toggleDeck(deck.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedDecks.includes(deck.id)
                      ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {deck.id}
                </button>
              ))}
            </div>
            {selectedDecks.length === 0 && <p className="text-[10px] text-slate-400 italic">All domains included by default.</p>}
          </section>

          {/* Status Selection */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Filter by Mastery</h3>
            <div className="flex gap-2">
              {[
                { id: 'unseen', label: 'Unseen', icon: Circle, color: 'text-slate-400' },
                { id: 'learning', label: 'Learning', icon: Filter, color: 'text-amber-500' },
                { id: 'mastered', label: 'Mastered', icon: CheckCircle2, color: 'text-emerald-500' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleStatus(s.id as MasteryStatus)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                    selectedStatus.includes(s.id as MasteryStatus)
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-slate-900 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 grayscale'
                  }`}
                >
                  <s.icon size={16} className={selectedStatus.includes(s.id as MasteryStatus) ? s.color : ''} />
                  <span className="text-xs font-black uppercase tracking-wide">{s.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Limit Selection */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Session Length</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[10, 20, 50, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setLimit(val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    limit === val 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {val}
                </button>
              ))}
              <button
                  onClick={() => setLimit(-1)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    limit === -1
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Max
                </button>
            </div>
          </section>

        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-bold text-slate-500">Matching Cards:</span>
             <span className="text-xl font-black text-slate-900 dark:text-white">{matchingCards.length}</span>
          </div>
          <button 
            onClick={handleStart}
            disabled={matchingCards.length === 0}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} /> Start Session
          </button>
        </div>

      </div>
    </div>
  );
};
