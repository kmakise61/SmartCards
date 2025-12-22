import React, { useEffect, useRef, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  Indent,
  Outdent,
  Save,
  X,
  Tags,
  Copy,
  Layout
} from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { FormattedText } from '../study/Flashcard';

interface DeckBuilderProps {
  onClose: () => void;
  deckId?: string;
}

type Field = 'front' | 'back';
type Cmd = 'bold' | 'italic' | 'underline' | 'quote' | 'list' | 'indent' | 'outdent';

// --- STABLE EDITOR UTILS ---

const decodeEntities = (s: string) => {
  if (!s) return s;
  const ta = document.createElement('textarea');
  ta.innerHTML = s;
  return ta.value;
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const mdToHtml = (md: string) => {
  let s = escapeHtml(md || '');
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<u>$1</u>');
  s = s.replace(/_(.+?)_/g, '<em>$1</em>');
  s = s.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
  s = s.replace(/(?:^|\n)(- .*(?:\n- .*)*)/g, (m) => {
    const lines = m.trim().split('\n').filter(Boolean);
    if (!lines.every((l) => l.trim().startsWith('- '))) return m;
    const items = lines.map((l) => `<li>${l.trim().slice(2)}</li>`).join('');
    return `\n<ul>${items}</ul>`;
  });
  s = s.replace(/\n/g, '<br/>');
  return s;
};

const htmlToMdFromHtmlString = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\u00A0/g, ' ');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') return '\n';
    
    const children = Array.from(el.childNodes).map(walk).join('');

    if (tag === 'strong' || tag === 'b' || parseInt(el.style.fontWeight) >= 700) return `**${children}**`;
    if (tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic') return `_${children}_`;
    if (tag === 'u' || el.style.textDecoration.includes('underline')) return `__${children}__`;
    if (tag === 'blockquote') return `\n> ${children.replace(/\n+/g, ' ').trim()}\n`;
    if (tag === 'ul') {
      const items = Array.from(el.children).map(li => `- ${walk(li).trim()}`).join('\n');
      return `\n${items}\n`;
    }
    if (tag === 'li') return children;
    if (tag === 'div' || tag === 'p') return `${children}\n`;

    return children;
  };

  return walk(tmp).replace(/\n{3,}/g, '\n\n').trim();
};

const normalizeStoredTextToMd = (raw: string) => {
  let s = raw || '';
  s = decodeEntities(s);
  // Check if it looks like HTML
  if (!/<\/?(strong|b|em|i|u|blockquote|ul|ol|li|div|p|br)\b/i.test(s)) return s;
  return htmlToMdFromHtmlString(s);
};

// --- EDITOR COMPONENT ---

interface EditorTheme {
    overlayBg: string;
    headerBg: string;
    textPrimary: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    inputBg: string;
    toolbarBg: string;
    toolbarHover: string;
    gridColor: string;
}

const EditorToolbar = React.memo(({ onExec, theme }: { onExec: (cmd: Cmd) => void; theme: EditorTheme }) => {
  const btnClass = `p-1.5 rounded-lg transition-colors ${theme.textSecondary} hover:${theme.textPrimary} ${theme.toolbarHover}`;
  return (
    <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${theme.toolbarBg} ${theme.borderColor}`}>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('bold')} className={btnClass} title="Bold"><Bold size={13} /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('italic')} className={btnClass} title="Italic"><Italic size={13} /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('underline')} className={btnClass} title="Underline"><Underline size={13} /></button>
      <div className={`w-px h-3 mx-0.5 opacity-20 ${theme.textSecondary === 'text-white/50' ? 'bg-white' : 'bg-black'}`} />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('list')} className={btnClass} title="List"><List size={13} /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('quote')} className={btnClass} title="Quote"><Quote size={13} /></button>
      <div className={`w-px h-3 mx-0.5 opacity-20 ${theme.textSecondary === 'text-white/50' ? 'bg-white' : 'bg-black'}`} />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('indent')} className={btnClass} title="Indent"><Indent size={13} /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onExec('outdent')} className={btnClass} title="Outdent"><Outdent size={13} /></button>
    </div>
  );
});

const EditableDiv = React.forwardRef<HTMLDivElement, { initialHtml: string; onInput: () => void; theme: EditorTheme; heightClass: string }>(
  ({ initialHtml, onInput, theme, heightClass }, ref) => {
    const hasMounted = useRef(false);

    useLayoutEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        if (!hasMounted.current || ref.current.innerHTML === '') {
           ref.current.innerHTML = initialHtml;
           hasMounted.current = true;
        }
      }
    }, [initialHtml, ref]);

    return (
      <div className={`w-full rounded-xl border transition-all outline-none px-4 py-3 overflow-y-auto custom-scrollbar leading-relaxed
        ${theme.inputBg} ${theme.borderColor} ${theme.textPrimary} ${heightClass}
        focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/10`}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="rte outline-none whitespace-pre-wrap break-words h-full"
          onInput={onInput}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            onInput();
          }}
        />
      </div>
    );
  }
);

// --- MAIN DECK BUILDER ---

const DeckBuilder: React.FC<DeckBuilderProps> = ({ onClose, deckId }) => {
  const { isDark, isCrescere, theme } = useTheme();
  const { addDeck, addCard, updateCard, deleteCard, decks, cards: allCards, updateDeck } = useData();

  const [deckTitle, setDeckTitle] = useState('');
  const [deckDesc, setDeckDesc] = useState('');

  // Local state for cards being managed in this session
  const [cards, setCards] = useState<Flashcard[]>([]);
  
  // Editor State
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  
  // Refs for inputs
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  
  // Draft state
  const [draftHint, setDraftHint] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [initialFrontHtml, setInitialFrontHtml] = useState('');
  const [initialBackHtml, setInitialBackHtml] = useState('');

  // Styling Helpers
  const darkLike = isDark || isCrescere;
  const glassCard = `relative overflow-hidden rounded-[2rem] border ring-1 ring-white/5 backdrop-blur-xl ${
    darkLike
      ? 'bg-white/[0.06] border-white/10 shadow-2xl'
      : 'bg-white/70 border-slate-200/60 shadow-xl'
  }`;
  const glassInner = darkLike ? 'bg-black/10 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200/70 text-slate-900 placeholder:text-slate-400';
  const textPrimary = darkLike ? 'text-white' : 'text-slate-900';
  const textSecondary = darkLike ? 'text-white/60' : 'text-slate-500';

  // --- EDITOR THEME MAPPING ---
  const editorTheme: EditorTheme = useMemo(() => {
      switch (theme) {
          case 'light': return {
              overlayBg: 'bg-slate-50',
              headerBg: 'bg-white/90 border-slate-200 backdrop-blur-md',
              textPrimary: 'text-slate-900',
              textSecondary: 'text-slate-500',
              cardBg: 'bg-white border-slate-200 shadow-xl',
              borderColor: 'border-slate-200',
              inputBg: 'bg-slate-50',
              toolbarBg: 'bg-white',
              toolbarHover: 'hover:bg-slate-100',
              gridColor: 'rgba(15, 23, 42, 0.04)'
          };
          case 'dark': return {
              overlayBg: 'bg-[#0B1121]', // Deep Slate
              headerBg: 'bg-[#0f172a]/90 border-slate-800 backdrop-blur-md',
              textPrimary: 'text-slate-100',
              textSecondary: 'text-slate-400',
              cardBg: 'bg-[#1e293b] border-slate-700/50 shadow-2xl',
              borderColor: 'border-slate-700',
              inputBg: 'bg-[#0f172a]',
              toolbarBg: 'bg-[#0f172a]',
              toolbarHover: 'hover:bg-slate-700',
              gridColor: 'rgba(255, 255, 255, 0.05)'
          };
          case 'midnight': return {
              overlayBg: 'bg-black',
              headerBg: 'bg-black/80 border-white/10 backdrop-blur-md',
              textPrimary: 'text-white',
              textSecondary: 'text-white/50',
              cardBg: 'bg-[#050505] border-white/10 shadow-2xl',
              borderColor: 'border-white/10',
              inputBg: 'bg-white/5',
              toolbarBg: 'bg-white/5',
              toolbarHover: 'hover:bg-white/10',
              gridColor: 'rgba(255, 255, 255, 0.08)'
          };
      }
  }, [theme]);

  const estimatedTime = Math.ceil(cards.length * 1.5); // 1.5 mins per card avg
  const uniqueTags = new Set(cards.flatMap(c => c.tags)).size;

  useEffect(() => {
    if (deckId) {
      const existingDeck = decks.find(d => d.id === deckId);
      const existingCards = allCards.filter(c => c.deckId === deckId);
      if (existingDeck) {
        setDeckTitle(existingDeck.title);
        setDeckDesc(existingDeck.description);
      }
      setCards(existingCards);
    }
  }, [deckId, decks, allCards]);

  const handleCreateCard = () => {
    const newCard: Flashcard = {
      id: `temp_${Date.now()}_${Math.random()}`,
      deckId: deckId || 'temp_deck', 
      front: '',
      back: '',
      tags: [],
      status: 'new',
      interval: 0,
      easeFactor: 2.5,
    };
    openEditor(newCard);
  };

  const handleDuplicateCard = (e: React.MouseEvent, card: Flashcard) => {
    e.stopPropagation();
    const newCard: Flashcard = {
        ...card,
        id: `temp_${Date.now()}_${Math.random()}`,
        status: 'new',
        interval: 0,
        easeFactor: 2.5
    };
    setCards(prev => [...prev, newCard]);
  };

  const openEditor = (card: Flashcard) => {
    setEditingCard(card);
    const fMd = normalizeStoredTextToMd(card.front);
    const bMd = normalizeStoredTextToMd(card.back);
    setInitialFrontHtml(mdToHtml(fMd));
    setInitialBackHtml(mdToHtml(bMd));
    setDraftHint(card.hint || '');
    setDraftTags(card.tags || []);
    setIsEditingCard(true);
  };

  const handleExec = useCallback((cmd: Cmd, field: Field) => {
    const el = field === 'front' ? frontRef.current : backRef.current;
    if (!el) return;
    el.focus();
    
    if (cmd === 'indent') document.execCommand('indent');
    else if (cmd === 'outdent') document.execCommand('outdent');
    else if (cmd === 'list') document.execCommand('insertUnorderedList');
    else if (cmd === 'quote') document.execCommand('formatBlock', false, 'blockquote');
    else document.execCommand(cmd); // bold, italic, underline
  }, []);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const trimmed = tagInput.trim();
        if (trimmed && !draftTags.includes(trimmed)) {
            setDraftTags([...draftTags, trimmed]);
            setTagInput('');
        }
    }
    if (e.key === 'Backspace' && !tagInput && draftTags.length > 0) {
        setDraftTags(draftTags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setDraftTags(draftTags.filter(t => t !== tag));
  };

  const saveCurrentCard = () => {
    if (!editingCard) return;
    
    // Extract MD from DOM
    const finalFront = frontRef.current ? htmlToMdFromHtmlString(frontRef.current.innerHTML) : '';
    const finalBack = backRef.current ? htmlToMdFromHtmlString(backRef.current.innerHTML) : '';

    const nextCard = { 
        ...editingCard, 
        front: finalFront, 
        back: finalBack, 
        hint: draftHint,
        tags: draftTags
    };

    if (!nextCard.front.trim() && !nextCard.back.trim()) {
      setIsEditingCard(false);
      setEditingCard(null);
      return;
    }

    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === nextCard.id);
      if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = nextCard;
          return newArr;
      }
      return [...prev, nextCard];
    });

    setIsEditingCard(false);
    setEditingCard(null);
  };

  const handleFinalSave = () => {
    if (!deckTitle.trim()) return alert('Please provide a Deck Title.');

    const finalDeckId = deckId || `custom_${Date.now()}`;
    
    const deckPayload: Deck = {
        id: finalDeckId,
        title: deckTitle,
        description: deckDesc || 'Custom Deck',
        cardCount: cards.length,
        tags: ['Custom'], 
        color: 'bg-accent',
    };

    if (deckId) {
      updateDeck(deckId, { title: deckTitle, description: deckDesc, cardCount: cards.length });
    } else {
      addDeck(deckPayload);
    }

    cards.forEach(card => {
      const isTemp = card.id.startsWith('temp_');
      const finalCardId = isTemp ? `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : card.id;

      const finalCard: Flashcard = {
          ...card,
          id: finalCardId,
          deckId: finalDeckId, 
          status: 'new'
      };

      const existsInDb = allCards.some(c => c.id === finalCardId);
      if (existsInDb) {
          updateCard(finalCardId, finalCard);
      } else {
          addCard(finalCard);
      }
    });

    onClose();
  };

  return (
    <div className={`w-full h-full flex flex-col relative ${darkLike ? 'bg-background/50' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`flex-none p-4 md:p-6 flex items-center justify-between border-b backdrop-blur-xl z-[50] ${darkLike ? 'bg-black/20 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onClose} className={`p-2 rounded-2xl transition-colors ${darkLike ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-slate-800'}`}><ArrowLeft size={20} /></button>
          
          <div className="flex flex-col w-full max-w-xl">
             <input 
                value={deckTitle} 
                onChange={e => setDeckTitle(e.target.value)} 
                placeholder="Deck Title" 
                className={`text-lg font-black bg-transparent outline-none placeholder:opacity-30 ${textPrimary}`} 
             />
             <input 
                value={deckDesc} 
                onChange={e => setDeckDesc(e.target.value)} 
                placeholder="Description (Optional)" 
                className={`text-xs font-medium bg-transparent outline-none placeholder:opacity-30 ${textSecondary}`} 
             />
          </div>
        </div>

        {/* Deck Health Stats (Desktop) */}
        <div className="hidden md:flex items-center gap-6 px-6 py-2 rounded-xl border border-white/5 bg-white/5 mr-4">
            <div className="flex flex-col items-center">
                <span className={`text-[10px] font-bold opacity-50 uppercase ${textSecondary}`}>Cards</span>
                <span className={`text-sm font-black ${textPrimary}`}>{cards.length}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col items-center">
                <span className={`text-[10px] font-bold opacity-50 uppercase ${textSecondary}`}>Time</span>
                <span className={`text-sm font-black ${textPrimary}`}>~{estimatedTime}m</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col items-center">
                <span className={`text-[10px] font-bold opacity-50 uppercase ${textSecondary}`}>Tags</span>
                <span className={`text-sm font-black ${textPrimary}`}>{uniqueTags}</span>
            </div>
        </div>

        <button onClick={handleFinalSave} className="hidden md:flex px-6 py-2.5 bg-accent text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all items-center gap-2">
          <Save size={14} /> Save Deck
        </button>
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-32 custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {cards.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 opacity-50 ${textSecondary}`}>
              <Sparkles size={48} className="mb-4 text-accent" />
              <p>Start building your master deck.</p>
              <button onClick={handleCreateCard} className="mt-4 text-accent hover:underline text-sm font-bold">Create First Card</button>
            </div>
          ) : (
            cards.map((card, idx) => (
              <div key={card.id} className={`${glassCard} p-4 flex flex-col gap-3 group transition-all hover:border-accent/30`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black opacity-30 bg-white/10 ${textPrimary}`}>#{idx + 1}</span>
                     {card.tags.slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider">{t}</span>)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={(e) => handleDuplicateCard(e, card)} className={`p-2 rounded-xl hover:bg-white/10 ${textSecondary} hover:text-accent`} title="Duplicate"><Copy size={14}/></button>
                     <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); setCards(prev => prev.filter(c => c.id !== card.id)); }} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500" title="Delete"><Trash2 size={14}/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onClick={() => openEditor(card)}>
                    <div className={`p-4 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-accent/30 transition-colors ${glassInner}`}>
                        <div className={`text-xs font-bold uppercase mb-2 opacity-40 ${textSecondary}`}>Question</div>
                        <div className={`text-sm font-medium line-clamp-3 ${textPrimary}`}><FormattedText text={card.front} size="sm" /></div>
                    </div>
                    <div className={`p-4 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-accent/30 transition-colors ${glassInner}`}>
                        <div className={`text-xs font-bold uppercase mb-2 opacity-40 ${textSecondary}`}>Answer</div>
                        <div className={`text-sm font-medium line-clamp-3 opacity-80 ${textPrimary}`}><FormattedText text={card.back} size="sm" /></div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky Mobile Footer Action Bar */}
      <div className={`md:hidden absolute bottom-0 inset-x-0 p-4 border-t backdrop-blur-xl z-[60] flex items-center gap-3 ${darkLike ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
         <div className="flex-1 flex flex-col">
            <span className={`text-[10px] font-bold uppercase ${textSecondary}`}>Deck Health</span>
            <div className="flex items-center gap-3 text-xs font-black">
                <span className={textPrimary}>{cards.length} Cards</span>
                <span className="opacity-30">•</span>
                <span className={textPrimary}>{estimatedTime}m Study</span>
            </div>
         </div>
         <button onClick={handleCreateCard} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent border border-accent/20">
            <Plus size={24} />
         </button>
         <button onClick={handleFinalSave} className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase shadow-lg">
            Save
         </button>
      </div>

      {/* Desktop FAB */}
      <div className="hidden md:block absolute bottom-8 right-8 z-[60]">
        <button onClick={handleCreateCard} className="w-16 h-16 rounded-full bg-accent text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Plus size={32} />
        </button>
      </div>

      {/* --- FULL SCREEN EDITOR OVERLAY --- */}
      {isEditingCard && (
        <div className={`fixed inset-0 z-[10000] flex flex-col ${editorTheme.overlayBg}`}>
          
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{ backgroundImage: `radial-gradient(${editorTheme.gridColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
          />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-5 bg-accent pointer-events-none" />

          {/* Editor Header */}
          <div className={`relative z-10 px-6 py-4 border-b shrink-0 flex items-center justify-between ${editorTheme.headerBg}`}>
            <div className="flex-1">
                <button 
                    onClick={() => { setIsEditingCard(false); setEditingCard(null); }} 
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${editorTheme.textSecondary} hover:${editorTheme.textPrimary} hover:bg-white/5 flex items-center gap-2`}
                >
                    <X size={16} /> Cancel
                </button>
            </div>
            
            <div className="flex flex-col items-center">
                <span className={`font-black text-xs uppercase tracking-[0.25em] ${editorTheme.textPrimary}`}>Card Editor</span>
                <span className={`text-[10px] font-medium opacity-50 ${editorTheme.textSecondary}`}>Markdown Supported</span>
            </div>

            <div className="flex-1 flex justify-end">
                <button 
                    onClick={saveCurrentCard} 
                    className="px-6 py-2.5 bg-accent text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-accent/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Check size={16} strokeWidth={3} /> Save Card
                </button>
            </div>
          </div>
          
          {/* Editor Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="mx-auto w-full max-w-4xl mt-4 md:mt-8 mb-20 space-y-4">
              
              {/* Main Card */}
              <div className={`p-5 md:p-6 rounded-3xl border ${editorTheme.cardBg} ${editorTheme.borderColor}`}>
                
                {/* Front Section */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black bg-accent/10 text-accent`}>Q</span>
                          <label className={`text-[10px] font-bold uppercase tracking-widest ${editorTheme.textSecondary}`}>Front (Question)</label>
                      </div>
                      <EditorToolbar onExec={(cmd) => handleExec(cmd, 'front')} theme={editorTheme} />
                    </div>
                    <EditableDiv 
                        ref={frontRef} 
                        initialHtml={initialFrontHtml} 
                        onInput={() => {}} 
                        theme={editorTheme} 
                        heightClass="h-[160px] md:h-[180px]" 
                    />
                </div>
                
                {/* Divider */}
                <div className={`w-full h-px my-4 ${editorTheme.borderColor} bg-gradient-to-r from-transparent via-current to-transparent opacity-20`} />

                {/* Back Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-500`}>A</span>
                          <label className={`text-[10px] font-bold uppercase tracking-widest ${editorTheme.textSecondary}`}>Back (Answer)</label>
                      </div>
                      <EditorToolbar onExec={(cmd) => handleExec(cmd, 'back')} theme={editorTheme} />
                    </div>
                    <EditableDiv 
                        ref={backRef} 
                        initialHtml={initialBackHtml} 
                        onInput={() => {}} 
                        theme={editorTheme} 
                        heightClass="h-[200px] md:h-[260px]" 
                    />
                </div>
                
              </div>

              {/* Meta Data Card */}
              <div className={`p-5 rounded-3xl border ${editorTheme.cardBg} ${editorTheme.borderColor} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${editorTheme.textSecondary} flex items-center gap-2`}>
                        <Layout size={12}/> Hint (Optional)
                    </label>
                    <input 
                        value={draftHint} 
                        onChange={e => setDraftHint(e.target.value)} 
                        className={`w-full px-4 py-3 rounded-xl outline-none border transition-all text-sm ${editorTheme.inputBg} ${editorTheme.borderColor} ${editorTheme.textPrimary} focus:border-accent/60`} 
                        placeholder="Add a clue to help recall..." 
                    />
                  </div>

                  <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ${editorTheme.textSecondary} flex items-center gap-2`}>
                          <Tags size={12}/> Tags
                      </label>
                      <div className={`w-full px-3 py-2 rounded-xl border transition-all flex flex-wrap gap-2 items-center min-h-[46px] ${editorTheme.inputBg} ${editorTheme.borderColor} focus-within:border-accent/60`}>
                          {draftTags.map(tag => (
                              <span key={tag} className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/20 text-[10px] font-bold uppercase tracking-wider animate-in zoom-in-95">
                                  {tag}
                                  <button onClick={() => removeTag(tag)} className="p-0.5 hover:bg-accent/20 rounded-md transition-colors"><X size={10}/></button>
                              </span>
                          ))}
                          <input 
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyDown={handleAddTag}
                              placeholder={draftTags.length === 0 ? "Type tag..." : "Add..."}
                              className={`bg-transparent outline-none text-sm min-w-[60px] flex-1 py-0.5 ${editorTheme.textPrimary} placeholder:opacity-40`}
                          />
                      </div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;