import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Edit3,
  X,
  Save,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  Eye,
  Indent,
  Outdent,
  Star,
  Filter,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Flashcard } from '../../types';
import { FormattedText } from '../study/Flashcard';

// --- UTILS ---

type Field = 'front' | 'back';
type Cmd = 'bold' | 'italic' | 'underline' | 'quote' | 'list' | 'indent' | 'outdent';

const getModalRoot = () =>
  (document.getElementById('modal-root') as HTMLElement) || document.body;

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
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || '').replace(/\u00A0/g, ' ');
    }
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
  if (!/<\/?(strong|b|em|i|u|mark|blockquote|ul|ol|li|div|p|br)\b/i.test(s)) return s;
  return htmlToMdFromHtmlString(s);
};

// --- SUB-COMPONENTS ---

const ToolBtn = ({ title, onClick, children }: { title: string, onClick: () => void, children?: React.ReactNode }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()} 
    onClick={onClick}
    className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary"
  >
    {children}
  </button>
);

const EditorToolbar = React.memo(({ field, onExec }: { field: Field; onExec: (cmd: Cmd, f: Field) => void }) => {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-2xl border w-fit bg-surface border-border-color"
    >
      <ToolBtn title="Bold" onClick={() => onExec('bold', field)}><Bold size={14} /></ToolBtn>
      <ToolBtn title="Italic" onClick={() => onExec('italic', field)}><Italic size={14} /></ToolBtn>
      <ToolBtn title="Underline" onClick={() => onExec('underline', field)}><Underline size={14} /></ToolBtn>
      <div className="w-px h-5 bg-border-color mx-1" />
      <ToolBtn title="Bullet List" onClick={() => onExec('list', field)}><List size={14} /></ToolBtn>
      <ToolBtn title="Blockquote" onClick={() => onExec('quote', field)}><Quote size={14} /></ToolBtn>
      <div className="w-px h-5 bg-border-color mx-1" />
      <ToolBtn title="Indent" onClick={() => onExec('indent', field)}><Indent size={14} /></ToolBtn>
      <ToolBtn title="Outdent" onClick={() => onExec('outdent', field)}><Outdent size={14} /></ToolBtn>
    </div>
  );
});

const EditableDiv = React.forwardRef<HTMLDivElement, { initialHtml: string, onInput: () => void }>(
  ({ initialHtml, onInput }, ref) => {
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
      <div className={`w-full rounded-2xl border transition-all outline-none px-6 py-5 min-h-[9rem] leading-relaxed
        bg-surface border-border-color text-text-primary
        focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/10`}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="rte outline-none whitespace-pre-wrap break-words"
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

const MobilePreviewModal = ({ 
  card, 
  onClose, 
  onEdit, 
  isDark 
}: { 
  card: Flashcard; 
  onClose: () => void; 
  onEdit: () => void; 
  isDark: boolean 
}) => {
  if (!card) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-[2rem] border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200
        bg-surface border-border-color
      `}>
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 border-border-color bg-surface/50`}>
          <div className="flex items-center gap-2 text-accent">
            <Eye size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Answer Preview</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="text-sm leading-relaxed text-text-primary">
            <FormattedText text={card.back} size="sm" />
          </div>
          {card.hint && (
            <div className="mt-6 p-4 rounded-xl border bg-panel border-border-color">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 text-text-secondary">Hint</div>
              <div className="text-xs opacity-90 text-text-primary">{card.hint}</div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {card.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-panel border-border-color text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 border-t shrink-0 border-border-color bg-surface/50">
          <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20">
            <Edit3 size={14} /> Edit Card
          </button>
        </div>
      </div>
    </div>,
    getModalRoot()
  );
};

const Browser: React.FC = () => {
  const { cards, updateCard } = useData();
  const { isDark, isCrescere } = useTheme();
  const darkLike = isDark || isCrescere;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortMode, setSortMode] = useState<'standard' | 'struggle'>('standard');
  const [visibleCount, setVisibleCount] = useState(50);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [draftHint, setDraftHint] = useState('');
  const [liveFrontMd, setLiveFrontMd] = useState('');
  const [liveBackMd, setLiveBackMd] = useState('');
  const [isSmall, setIsSmall] = useState(false);

  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const [initialFrontHtml, setInitialFrontHtml] = useState('');
  const [initialBackHtml, setInitialBackHtml] = useState('');
  const liveTimer = useRef<number | null>(null);

  const filters = ['All', 'Starred', 'NP1', 'NP2', 'NP3', 'NP4', 'NP5', 'Custom'];

  useEffect(() => setVisibleCount(50), [search, activeFilter, sortMode]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsSmall(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, card: Flashcard) => {
    e.stopPropagation();
    updateCard(card.id, { isFavorite: !card.isFavorite });
  };

  const filteredCards = useMemo(() => {
    if (!Array.isArray(cards)) return [];
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    
    // Filter
    let result = cards.filter((card) => {
      if (!card) return false;
      const front = (card.front || '').toLowerCase();
      const back = (card.back || '').toLowerCase();
      const tags = Array.isArray(card.tags) ? card.tags.map((t) => t.toLowerCase()).join(' ') : '';
      const matchesSearch = terms.every((t) => front.includes(t) || back.includes(t) || tags.includes(t));
      
      let matchesFilter = true;
      if (activeFilter === 'Starred') {
        matchesFilter = !!card.isFavorite;
      } else if (activeFilter !== 'All') {
        matchesFilter = Array.isArray(card.tags) && card.tags.some((t) => t.includes(activeFilter));
      }
      return matchesSearch && matchesFilter;
    });

    // Sort
    if (sortMode === 'struggle') {
        result.sort((a, b) => (b.struggleScore || 0) - (a.struggleScore || 0));
    }

    return result;
  }, [cards, search, activeFilter, sortMode]);

  const displayedCards = useMemo(() => filteredCards.slice(0, visibleCount), [filteredCards, visibleCount]);
  
  const activePreviewCard = useMemo(() => cards.find(c => c.id === previewId), [cards, previewId]);

  const cardShell = 'relative isolate overflow-hidden rounded-[2rem] border ring-1 ring-white/5 backdrop-blur-xl ' + (darkLike ? 'bg-white/[0.06] border-white/10 shadow-lg' : 'bg-white/70 border-slate-200/60 shadow-sm');
  const subtleGrid = (darkLike ? 'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)]' : 'bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)]') + ' bg-[size:18px_18px]';
  const overlayBase = darkLike ? { base: 'bg-black/95', grad: 'from-black/40 via-black/80 to-black', text: 'text-white', sub: 'text-white/70', hint: 'bg-white/[0.06] border-white/15 text-white/80' } : { base: 'bg-white/95', grad: 'from-white/40 via-white/80 to-white', text: 'text-slate-900', sub: 'text-slate-600', hint: 'bg-slate-900/[0.03] border-slate-200 text-slate-700' };

  const openEditor = (card: Flashcard) => {
    const frontMd = normalizeStoredTextToMd(card.front || '');
    const backMd = normalizeStoredTextToMd(card.back || '');
    setInitialFrontHtml(mdToHtml(frontMd));
    setInitialBackHtml(mdToHtml(backMd));
    setLiveFrontMd(frontMd);
    setLiveBackMd(backMd);
    setDraftHint(card.hint || '');
    setEditingCard(card);
    setPreviewId(null);
  };

  const syncLivePreview = useCallback(() => {
    if (liveTimer.current) window.clearTimeout(liveTimer.current);
    liveTimer.current = window.setTimeout(() => {
      if (frontRef.current) setLiveFrontMd(htmlToMdFromHtmlString(frontRef.current.innerHTML));
      if (backRef.current) setLiveBackMd(htmlToMdFromHtmlString(backRef.current.innerHTML));
    }, 150);
  }, []);

  const handleExec = useCallback((cmd: Cmd, field: Field) => {
    const root = field === 'front' ? frontRef.current : backRef.current;
    if (!root) return;
    root.focus();
    if (cmd === 'indent') document.execCommand('indent');
    else if (cmd === 'outdent') document.execCommand('outdent');
    else if (cmd === 'list') document.execCommand('insertUnorderedList');
    else if (cmd === 'quote') document.execCommand('formatBlock', false, 'blockquote');
    else document.execCommand(cmd);
    syncLivePreview();
  }, [syncLivePreview]);

  const handleSaveEdit = () => {
    if (!editingCard) return;
    const fHtml = frontRef.current ? frontRef.current.innerHTML : '';
    const bHtml = backRef.current ? backRef.current.innerHTML : '';
    const next: Flashcard = {
      ...editingCard,
      front: htmlToMdFromHtmlString(fHtml),
      back: htmlToMdFromHtmlString(bHtml),
      hint: draftHint,
    };
    updateCard(next.id, next);
    setEditingCard(null);
  };

  const editorModal = editingCard ? createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onMouseDown={(e) => { e.preventDefault(); setEditingCard(null); }} />
      <div className={['fixed', isSmall ? 'inset-0 w-full h-full rounded-none' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(980px,calc(100vw-24px))] max-h-[85vh] rounded-[1.75rem]', 'overflow-hidden border ring-1 ring-white/5', 'bg-surface border-border-color shadow-2xl z-[10000]'].join(' ')} role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
        <div className="relative z-10 px-4 py-3 border-b border-border-color bg-surface/80 backdrop-blur-xl flex items-center justify-between">
          <button onClick={() => setEditingCard(null)} className="px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity text-text-primary flex items-center gap-2">
            <X size={16} /> Close
          </button>
          <span className="font-black text-[10px] uppercase tracking-widest text-text-primary">Edit Card</span>
          <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition-all">
            <Save size={16} /> Save
          </button>
        </div>
        <div className="relative z-10 p-5 md:p-6 overflow-y-auto custom-scrollbar h-full pb-20 bg-background/50">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <div className={`p-6 rounded-[2rem] border border-border-color bg-surface/50 backdrop-blur-md shadow-sm`}>
              <div className="relative z-10 space-y-7">
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 text-text-primary">Front (Question)</label>
                    <EditorToolbar field="front" onExec={handleExec} />
                  </div>
                  <EditableDiv ref={frontRef} initialHtml={initialFrontHtml} onInput={syncLivePreview} />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 text-text-primary">Back (Answer)</label>
                    <EditorToolbar field="back" onExec={handleExec} />
                  </div>
                  <EditableDiv ref={backRef} initialHtml={initialBackHtml} onInput={syncLivePreview} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 text-text-primary">Hint (Optional)</label>
                  <input value={draftHint} onChange={e => setDraftHint(e.target.value)} className="w-full p-4 rounded-2xl outline-none border transition-all bg-surface border-border-color text-text-primary focus:border-accent/60 focus:ring-2 focus:ring-accent/10" placeholder="Add a hint..." />
                </div>
                <div className="pt-2">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-text-primary">Preview (saved format)</div>
                  <div className="mt-3 p-5 rounded-[2rem] border border-border-color bg-surface shadow-sm">
                    <div className="relative z-10 space-y-4">
                      <div className="text-text-primary"><FormattedText text={liveFrontMd} size="sm" /></div>
                      <div className="w-full h-px bg-border-color" />
                      <div className="text-text-secondary"><FormattedText text={liveBackMd} size="sm" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    getModalRoot()
  ) : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-6">
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary">Card Browser</h2>
            <p className="text-text-secondary">Explore and edit your evidence-based nursing database.</p>
          </div>
          <button 
            onClick={() => setSortMode(prev => prev === 'standard' ? 'struggle' : 'standard')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${sortMode === 'struggle' ? 'bg-red-500 text-white shadow-lg' : 'bg-transparent border border-white/10 text-text-secondary hover:bg-white/5'}`}
          >
            <ArrowUpDown size={14} />
            Sort: {sortMode === 'struggle' ? 'Most Missed' : 'Default'}
          </button>
        </div>
        
        <div className={`${cardShell} p-5`}>
          <div className={`absolute inset-0 opacity-55 ${subtleGrid}`} />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-60 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input type="text" placeholder="Search terms (e.g. 'asthma')..." value={search} onChange={(e) => setSearch(e.target.value)} className={`w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all ${darkLike ? 'bg-white/5 border-white/10 text-text-primary' : 'bg-white border-slate-200/70 text-text-primary'} focus:border-accent/60 focus:ring-2 focus:ring-accent/25`} />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)} 
                  className={[
                    'px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all', 
                    'border ring-1 ring-white/5 flex items-center gap-2',
                    activeFilter === filter 
                      ? 'bg-accent text-on-accent border-accent/30 shadow-lg shadow-accent/20' 
                      : `${darkLike ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200/70'} hover:border-accent/30 hover:text-text-primary text-text-secondary`
                  ].join(' ')}
                >
                  {filter === 'Starred' && <Star size={12} fill={activeFilter === 'Starred' ? "currentColor" : "none"} />}
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayedCards.length === 0 ? <div className="col-span-full py-20 text-center opacity-60"><p>No cards found matching your criteria.</p></div> : displayedCards.map(card => (
          <div key={card.id} className={[cardShell, 'group flex flex-col min-h-[230px]', 'transition-transform duration-300 hover:-translate-y-1'].join(' ')}>
            <div className={`absolute inset-0 opacity-55 ${subtleGrid}`} />
            <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-[120px] opacity-10 bg-accent" />
            
            <div className={['relative z-[1] p-5 flex flex-col flex-1 transition-all duration-300', 'md:group-hover:opacity-15 md:group-hover:blur-[1px] md:group-hover:scale-[0.995]'].join(' ')}>
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-1.5 flex-wrap">
                    {card.tags.slice(0, 2).map(t => <span key={t} className="px-2 py-1 rounded-2xl border text-[8px] font-black uppercase tracking-widest bg-accent/10 text-accent border-accent/15">{t}</span>)}
                    {card.struggleScore && card.struggleScore > 40 && (
                        <span className="px-2 py-1 rounded-2xl border text-[8px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
                            <AlertTriangle size={8} /> Struggle
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => toggleFavorite(e, card)}
                    className={`p-2 rounded-2xl border transition-all ${card.isFavorite ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : (darkLike ? 'border-white/10 text-text-secondary hover:text-text-primary' : 'border-slate-200 text-slate-400 hover:text-slate-600')}`}
                  >
                    <Star size={14} fill={card.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setPreviewId(card.id)} className={['p-2 rounded-2xl border transition-all md:hidden', darkLike ? 'border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'].join(' ')}><Eye size={14} /></button>
                  <button onClick={() => openEditor(card)} className="p-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white text-text-secondary shrink-0" title="Edit Card"><Edit3 size={14} /></button>
                </div>
              </div>
              <div className="font-bold flex-1 text-text-primary"><FormattedText text={card.front} size="sm" /></div>
              <div className="mt-5 flex items-center justify-between"><div className="text-[9px] font-black uppercase tracking-widest opacity-35 text-text-secondary">Hover / Preview</div><div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent opacity-80"><Eye size={12} /> Answer</div></div>
            </div>

            <div className={[
                'hidden md:block absolute inset-0 z-[50]', 
                'transition-all duration-300',
                'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            ].join(' ')}>
              <div className={`absolute inset-0 ${overlayBase.base} backdrop-blur-xl`} />
              <div className="absolute inset-x-0 top-0 h-[3px] bg-accent shadow-[0_0_26px_rgba(var(--accent-rgb),0.6)]" />
              <div className={`relative h-full p-5 flex flex-col ${overlayBase.text}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-[10px] font-black uppercase tracking-widest text-accent">Answer</div><div className={`mt-1 text-[9px] font-black uppercase tracking-widest ${overlayBase.sub}`}>{card.tags?.slice(0, 2).join(' • ') || 'Card'}</div></div>
                  <button 
                    onClick={(e) => toggleFavorite(e, card)}
                    className={`pointer-events-auto p-2 rounded-2xl border transition-all ${card.isFavorite ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'border-white/10 text-white/40 hover:text-white'}`}
                  >
                    <Star size={14} fill={card.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="mt-4 flex-1 overflow-auto custom-scrollbar pr-1"><div className={darkLike ? 'text-white/92 text-sm leading-relaxed' : 'text-slate-800 text-sm leading-relaxed'}><FormattedText text={card.back} size="sm" /></div>{(card.hint || '').trim().length > 0 && <div className={`mt-4 rounded-2xl border p-4 ${overlayBase.hint}`}><div className="text-[9px] font-black uppercase tracking-widest opacity-80">Hint</div><div className="mt-1 text-xs opacity-90">{card.hint}</div></div>}</div>
                <div className="mt-4 flex items-center justify-between"><div className={`text-[9px] font-black uppercase tracking-widest ${overlayBase.sub}`}></div><button onClick={() => openEditor(card)} className="pointer-events-auto px-3 py-2 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition-all">Edit</button></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < filteredCards.length && <div className="flex justify-center pt-8"><button onClick={() => setVisibleCount(p => p + 50)} className={`${cardShell} px-6 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all`}><span className="text-text-primary">Load More</span><span className="opacity-50 text-xs">({filteredCards.length - visibleCount})</span></button></div>}
      
      {activePreviewCard && (
        <MobilePreviewModal 
          card={activePreviewCard} 
          onClose={() => setPreviewId(null)} 
          onEdit={() => openEditor(activePreviewCard)}
          isDark={darkLike}
        />
      )}

      {editorModal}
    </div>
  );
};

export default Browser;