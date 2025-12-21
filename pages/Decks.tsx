import React, { useState } from 'react';
import { Deck } from '../types';
import { MoreHorizontal, Plus, PlayCircle, Edit3, X, Check } from 'lucide-react';
import { useDecks } from '../hooks/useData';

interface DecksProps {
  decks: Deck[];
}

const CATEGORIES = ['Fundamentals', 'Med-Surg', 'OB', 'Pedia', 'Psych', 'Community', 'Custom'];
const COLORS = ['#6366f1', '#ef4444', '#22c55e', '#eab308', '#ec4899', '#8b5cf6', '#3b82f6'];

const Decks: React.FC<DecksProps> = ({ decks }) => {
  const { createDeck } = useDecks();
  const [isCreating, setIsCreating] = useState(false);
  
  // New Deck State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Custom');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newTitle) return;
    setSubmitting(true);
    await createDeck({
        title: newTitle,
        description: newDesc,
        category: newCat as any,
        color: newColor
    });
    setSubmitting(false);
    setIsCreating(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
          <p className="text-text-muted mt-1">Manage your flashcard collections.</p>
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl flex items-center shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <Plus size={18} className="mr-2" />
            New Deck
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Creation Card */}
        {isCreating && (
          <div className="glass-panel p-6 rounded-3xl border-2 border-primary/20 relative animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} className="text-text-muted" />
            </button>
            
            <h3 className="text-lg font-bold mb-4">Create New Deck</h3>
            
            <div className="space-y-4">
              <div>
                <input 
                  autoFocus
                  placeholder="Deck Title (e.g., Cardiac Nursing)"
                  className="w-full glass-input p-3 rounded-xl font-medium placeholder:text-text-muted/60"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <textarea 
                  placeholder="Description (Optional)"
                  className="w-full glass-input p-3 rounded-xl text-sm h-20 resize-none placeholder:text-text-muted/60"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setNewCat(cat)}
                     className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${newCat === cat ? 'bg-primary/10 border-primary text-primary' : 'border-border text-text-muted hover:border-primary/50'}`}
                   >
                     {cat}
                   </button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${newColor === c ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-black' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                 </div>
                 <button 
                   onClick={handleCreate}
                   disabled={!newTitle || submitting}
                   className="bg-primary text-white p-2 rounded-xl shadow-md disabled:opacity-50"
                 >
                   <Check size={20} />
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Decks */}
        {decks.map((deck, idx) => (
          <div 
            key={deck.id} 
            className="glass-panel p-6 rounded-3xl group hover:border-primary/30 transition-all duration-300 flex flex-col relative overflow-hidden"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Ambient Background Glow */}
            <div 
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: deck.color }}
            />

            <div className="flex justify-between items-start mb-5 relative z-10">
              <span 
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                style={{ 
                    backgroundColor: `${deck.color}10`, 
                    color: deck.color,
                    borderColor: `${deck.color}20` 
                }}
              >
                {deck.category}
              </span>
              <button className="text-text-muted hover:text-text-main transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-2 relative z-10 tracking-tight">{deck.title}</h3>
            <p className="text-sm text-text-muted mb-8 line-clamp-2 h-10 relative z-10 leading-relaxed">
                {deck.description || 'No description provided.'}
            </p>
            
            <div className="mt-auto flex items-end justify-between relative z-10">
              <div>
                  <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-text-main">{deck.cardCount || 0}</span>
                      <span className="text-xs font-medium text-text-muted uppercase">Cards</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-24 h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${deck.masteryLevel}%`, backgroundColor: deck.color }}></div>
                  </div>
              </div>

              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full flex items-center justify-center border border-border text-text-muted hover:text-primary hover:border-primary/50 hover:bg-white/5 transition-all" title="Edit">
                    <Edit3 size={18} />
                 </button>
                 <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all" title="Study">
                    <PlayCircle size={20} fill="currentColor" />
                 </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State if no decks */}
        {decks.length === 0 && !isCreating && (
             <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                     <Plus size={32} />
                 </div>
                 <h3 className="text-lg font-bold">No decks found</h3>
                 <p className="text-text-muted mb-6">Create your first flashcard deck to get started.</p>
                 <button 
                    onClick={() => setIsCreating(true)}
                    className="text-primary font-bold hover:underline"
                 >
                     Create a Deck
                 </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default Decks;