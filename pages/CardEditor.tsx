import React, { useState } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Deck } from '../types';
import { useCards } from '../hooks/useData';

interface CardEditorProps {
  decks: Deck[];
}

const CardEditor: React.FC<CardEditorProps> = ({ decks }) => {
  const { createCard } = useCards();
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [deckId, setDeckId] = useState(decks[0]?.id || '');
  const [type, setType] = useState('standard');
  const [notes, setNotes] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Sync deckId if decks load late
  React.useEffect(() => {
      if (!deckId && decks.length > 0) setDeckId(decks[0].id);
  }, [decks]);

  const handleSave = async () => {
    if (!deckId) {
        alert("Please create a deck first!");
        return;
    }
    
    setStatus('saving');
    const { error } = await createCard({
        deckId,
        front,
        back,
        type: type as any,
        notes
    });

    if (error) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
    } else {
        setStatus('success');
        setFront('');
        setBack('');
        setNotes('');
        setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (decks.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-3xl text-center p-8">
              <AlertCircle size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-bold">No Decks Found</h3>
              <p className="text-text-muted mt-2 mb-6">You need to create a deck before adding cards.</p>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Card Editor</h2>
            <p className="text-text-muted mt-1">Add new knowledge to your collection.</p>
          </div>
      </div>
      
      <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl relative overflow-hidden">
        
        {/* Success Overlay */}
        {status === 'success' && (
            <div className="absolute inset-0 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold">Card Saved!</h3>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Destination Deck</label>
            <div className="relative">
                <select 
                value={deckId} 
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full glass-input rounded-xl p-4 appearance-none font-medium cursor-pointer"
                >
                {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Card Format</label>
            <div className="relative">
                <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full glass-input rounded-xl p-4 appearance-none font-medium cursor-pointer"
                >
                <option value="standard">Standard (Front/Back)</option>
                <option value="vignette">Clinical Vignette</option>
                <option value="input">Type Answer</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 group-focus-within:text-primary transition-colors">Front (Question)</label>
            <textarea 
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full glass-input rounded-xl p-4 min-h-[120px] resize-none text-lg transition-all focus:min-h-[150px]"
                placeholder={type === 'vignette' ? 'Describe the patient scenario...' : 'Enter the question concept...'}
            />
            </div>

            <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 group-focus-within:text-primary transition-colors">Back (Answer)</label>
            <textarea 
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full glass-input rounded-xl p-4 min-h-[120px] resize-none text-lg transition-all focus:min-h-[150px]"
                placeholder="Enter the core answer..."
            />
            </div>

            <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 group-focus-within:text-primary transition-colors">Clinical Pearl (Notes)</label>
            <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full glass-input rounded-xl p-4"
                placeholder="Add a mnemonic or quick fact..."
            />
            </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!front || !back || status === 'saving'}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {status === 'saving' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
                <Save size={18} className="mr-2" />
            )}
            Save to Deck
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardEditor;