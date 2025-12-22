import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Tags, MoreVertical, Folder, ArrowLeft, Layers, Edit, Trash2, Copy, AlertTriangle, X } from 'lucide-react';
import { Deck } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface DeckGridProps {
  onSelectDeck: (deck: Deck) => void;
  onCreateDeck: () => void;
  onEditDeck: (deck: Deck) => void;
}

const DeckGrid: React.FC<DeckGridProps> = ({ onSelectDeck, onCreateDeck, onEditDeck }) => {
  const { isDark, isCrescere } = useTheme();
  const { decks, deleteDeck, updateDeck, copyDeck } = useData();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const [menuOpenForDeckId, setMenuOpenForDeckId] = useState<string | null>(null);
  const [renamingDeck, setRenamingDeck] = useState<Deck | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const folders = [
    { id: 'NP1', title: 'NP 1: Nursing Foundations', desc: 'Community Health Nursing, Communicable Diseases, and Fundamentals of Nursing Practice.' },
    { id: 'NP2', title: 'NP 2: Maternal & Child', desc: 'Obstetrics, Pediatrics, Labor & Delivery, and Growth & Development.' },
    { id: 'NP3', title: 'NP 3: Medical-Surgical I', desc: 'Perioperative Care, Oxygenation, Metabolism, and Endocrine.' },
    { id: 'NP4', title: 'NP 4: Medical-Surgical II', desc: 'Perception, Coordination, Acute Care, and Emergency Nursing.' },
    { id: 'NP5', title: 'NP 5: Psych & Leadership', desc: 'Mental Health, Psychiatric Nursing, Management, and Leadership.' },
  ];

  const customDecks = useMemo(() => decks.filter(d => d.tags.includes('Custom')), [decks]);

  const glassCard =
    'relative overflow-hidden rounded-[2rem] border ring-1 ring-white/5 backdrop-blur-xl ' +
    (isDark || isCrescere
      ? 'bg-white/[0.06] border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]'
      : 'bg-white/70 border-slate-200/60 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.22)]');

  const glassInner =
    (isDark || isCrescere) ? 'bg-black/10 border-white/10' : 'bg-white border-slate-200/70';

  const subtleGrid = (isDark || isCrescere)
    ? 'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:18px_18px]'
    : 'bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] bg-[size:18px_18px]';

  const getDeckCount = (folderId: string) => decks.filter((d) => d.tags.some((t) => t.includes(folderId))).length;

  const filteredDecks = useMemo(() => {
    if (!activeFolder) return [];
    if (activeFolder === 'Custom') return customDecks;
    return decks.filter((d) => d.tags.some((t) => t.includes(activeFolder)));
  }, [activeFolder, decks, customDecks]);
  
  const handleOpenMenu = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    setMenuOpenForDeckId(deckId);
  };

  const handleCloseMenu = () => setMenuOpenForDeckId(null);

  const handleEditClick = (e: React.MouseEvent, deck: Deck) => {
    e.stopPropagation();
    onEditDeck(deck);
    handleCloseMenu();
  };

  const handleRenameClick = (e: React.MouseEvent, deck: Deck) => {
    e.stopPropagation();
    setRenamingDeck(deck);
    setNewTitle(deck.title);
    setNewDesc(deck.description);
    handleCloseMenu();
  };

  const handleDeleteClick = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    setDeletingDeckId(deckId);
    handleCloseMenu();
  };
  
  const handleCopyClick = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    copyDeck(deckId);
    handleCloseMenu();
  };

  const confirmRename = () => {
    if (!renamingDeck || !newTitle.trim()) return;
    updateDeck(renamingDeck.id, { title: newTitle, description: newDesc });
    setRenamingDeck(null);
  };
  
  const confirmDelete = () => {
    if (!deletingDeckId) return;
    deleteDeck(deletingDeckId);
    setDeletingDeckId(null);
  };
  
  useEffect(() => {
    if (!menuOpenForDeckId) return;
    const handleClickOutside = () => handleCloseMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [menuOpenForDeckId]);

  if (!activeFolder) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="text-center md:text-left">
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>My Library</h2>
          <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select a subject module to browse its decks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {folders.map((folder) => {
            const count = getDeckCount(folder.id);
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`${glassCard} group p-8 text-left flex flex-col justify-between min-h-[18rem] transition-all hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 opacity-55 ${subtleGrid}`} />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[130px] opacity-12 bg-accent" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl border ${glassInner} group-hover:bg-accent/10 transition-colors`}>
                      <Folder size={32} className={isDark || isCrescere ? 'text-slate-200' : 'text-slate-700'} />
                    </div>
                    {/* Fixed: Added text-text-primary to ensure visibility in all themes */}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-2xl border ${glassInner} text-text-primary opacity-80`}>
                      {count} DECKS
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black tracking-tight mb-3 leading-snug group-hover:text-accent transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {folder.title}
                  </h3>
                  <p className={`text-sm font-medium opacity-70 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {folder.desc}
                  </p>
                </div>
              </button>
            );
          })}

          <button
            key="custom"
            onClick={() => setActiveFolder('Custom')}
            className={`${glassCard} group p-8 text-left flex flex-col justify-between min-h-[18rem] transition-all hover:-translate-y-1 ring-blue-500/20`}
          >
            <div className={`absolute inset-0 opacity-55 ${subtleGrid}`} />
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[130px] opacity-12 bg-blue-500" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl border ${glassInner} group-hover:bg-blue-500/10 transition-colors`}>
                    <Layers size={32} className={isDark || isCrescere ? 'text-slate-200' : 'text-slate-700'} />
                </div>
                {/* Fixed: Added text-text-primary */}
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-2xl border ${glassInner} text-text-primary opacity-80`}>
                    {customDecks.length} DECKS
                </span>
                </div>

                <h3 className={`text-2xl font-black tracking-tight mb-3 leading-snug group-hover:text-blue-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Custom Decks
                </h3>
                <p className={`text-sm font-medium opacity-70 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Flashcards you have created yourself.
                </p>
            </div>
          </button>

          <button
            onClick={onCreateDeck}
            className={`${glassCard} group min-h-[18rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all hover:border-accent/40`}
          >
            <div className={`absolute inset-0 opacity-45 ${subtleGrid}`} />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full border ${glassInner} text-accent`}>
                <Plus size={32} />
              </div>
              <span className={`font-black uppercase tracking-widest text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Create Custom Deck</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const activeFolderData = activeFolder === 'Custom' 
    ? { title: 'Custom Decks', desc: 'Flashcards you have created.' } 
    : folders.find(f => f.id === activeFolder);

  return (
    <>
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveFolder(null)} className={`p-3 rounded-2xl hover:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeFolderData?.title}</h2>
          <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{activeFolderData?.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDecks.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center opacity-50">
            <Layers size={48} className="mb-4" />
            <p>No decks found in this folder yet.</p>
          </div>
        ) : (
          filteredDecks.map((deck) => {
            const isCustom = deck.tags.includes('Custom');
            const customStyle = isCustom 
                ? (isDark ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50') 
                : '';

            return (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className={`${glassCard} ${customStyle} group p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 min-h-[320px]`}
              >
                <div className={`absolute inset-0 opacity-55 ${subtleGrid}`} />
                <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[130px] opacity-10 ${isCustom ? 'bg-blue-500' : 'bg-accent'}`} />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-accent/20 ${deck.color || (isCustom ? 'bg-blue-500' : 'bg-accent')}`}>
                      {activeFolder?.[0] === 'N' ? activeFolder : 'C'}
                    </div>
                    <div className="relative">
                      <button onClick={(e) => handleOpenMenu(e, deck.id)} className={`p-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10 ${isDark ? 'text-white' : 'text-slate-600'}`}>
                        <MoreVertical size={20} />
                      </button>
                      {menuOpenForDeckId === deck.id && (
                          <div className={`absolute top-full right-0 mt-2 w-48 p-2 rounded-2xl border z-[5000] animate-in fade-in zoom-in-95 ${glassInner} shadow-xl`}>
                            {isCustom ? (
                              <>
                                <button onClick={(e) => handleEditClick(e, deck)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold hover:bg-white/5 transition-colors"><Plus size={14}/> Edit Cards</button>
                                <button onClick={(e) => handleRenameClick(e, deck)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold hover:bg-white/5 transition-colors"><Edit size={14}/> Rename</button>
                                <button onClick={(e) => handleDeleteClick(e, deck.id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={14}/> Delete</button>
                              </>
                            ) : (
                              <button onClick={(e) => handleCopyClick(e, deck.id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold hover:bg-white/5 transition-colors"><Copy size={14}/> Copy to My Decks</button>
                            )}
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <h3 className={`font-black text-2xl leading-snug mb-3 ${isDark ? 'text-white' : 'text-slate-900'} ${isCustom ? 'text-blue-500 dark:text-blue-400' : ''}`}>{deck.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed opacity-70 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{deck.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-auto">
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${glassInner} text-text-primary`}>
                      {deck.cardCount} Cards
                    </span>
                    {deck.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isCustom ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-accent/10 text-accent border-accent/15'}`}>
                        <Tags size={12} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
    
    {/* MODALS */}
    {renamingDeck && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className={`${glassCard} w-full max-w-md p-6 animate-in zoom-in-95`}>
                <h3 className="font-black text-lg mb-4 text-text-primary">Rename Deck</h3>
                <div className="space-y-4">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Deck Title" className={`w-full p-3 rounded-xl border outline-none ${glassInner} focus:border-accent text-text-primary`} />
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" className={`w-full p-3 rounded-xl border outline-none h-24 resize-none ${glassInner} focus:border-accent text-text-primary`} />
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => setRenamingDeck(null)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors text-text-primary">Cancel</button>
                    <button onClick={confirmRename} className="flex-1 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:brightness-110 transition-all">Save</button>
                </div>
            </div>
        </div>, document.body
    )}

    {deletingDeckId && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className={`${glassCard} w-full max-sm p-6 text-center animate-in zoom-in-95`}>
                <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 mb-4">
                  <AlertTriangle size={24}/>
                </div>
                <h3 className="font-black text-lg text-text-primary">Delete Deck?</h3>
                <p className="text-sm opacity-60 mt-2 text-text-secondary">This will permanently delete the deck and all its cards. This action cannot be undone.</p>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => setDeletingDeckId(null)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors text-text-primary">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-all">Delete</button>
                </div>
            </div>
        </div>, document.body
    )}
    </>
  );
};

export default DeckGrid;