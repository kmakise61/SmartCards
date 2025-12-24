
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, RotateCcw, PenTool, Bold, Italic, List, Type, AlignLeft, Eraser, ChevronDown, Check } from 'lucide-react';
import { CardEdit, FlashcardUI } from '../types';
import { useProgress } from '../context/ProgressContext';
import { adaptCards } from '../utils/adaptCards';

interface EditCardModalProps {
  card: FlashcardUI | null;
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PALETTE = [
  ['#000000', '#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'], // Standard
  ['#6B7280', '#FCA5A5', '#FDBA74', '#FEF08A', '#86EFAC', '#93C5FD', '#D8B4FE'], // Pastel
  ['#374151', '#B91C1C', '#C2410C', '#A16207', '#15803D', '#1D4ED8', '#7E22CE'], // Dark
  ['#1F2937', '#7F1D1D', '#7C2D12', '#713F12', '#14532D', '#1E3A8A', '#581C87'], // Deep
  ['#FFFFFF', '#FECACA', '#FED7AA', '#FEF9C3', '#DCFCE7', '#DBEAFE', '#F3E8FF'], // Light
];

// Helper to reliably format initial content
const formatInitialContent = (text: string) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text) || text.includes('&nbsp;')) {
    return text;
  }
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/_(.*?)_/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
};

const RichTextEditor: React.FC<{
  label: string;
  value: string;
  onChange: (html: string) => void;
  isActive: boolean;
  onFocus: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}> = ({ label, value, onChange, isActive, onFocus, editorRef }) => {
  
  useEffect(() => {
    if (editorRef.current) {
        const currentHTML = editorRef.current.innerHTML;
        const newHTML = formatInitialContent(value);
        
        if (!currentHTML || (currentHTML !== newHTML && !isActive)) {
             editorRef.current.innerHTML = newHTML;
        }
    }
  }, [value, isActive]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className={`space-y-2 group transition-all duration-300`}>
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex justify-between px-1">
        {label}
        {isActive && <span className="text-[var(--accent)] animate-pulse">Editing</span>}
      </label>
      <div
        ref={editorRef}
        contentEditable
        onFocus={onFocus}
        onInput={handleInput}
        className={`
          w-full p-4 rounded-xl text-sm font-medium leading-relaxed min-h-[100px] max-h-[300px] overflow-y-auto resize-y outline-none transition-all
          ${isActive 
            ? 'bg-white dark:bg-[#0f172a] border-2 border-[var(--accent)] shadow-sm' 
            : 'bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }
          text-slate-800 dark:text-slate-200
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
        `}
        style={{ whiteSpace: 'pre-wrap' }} 
      />
    </div>
  );
};

export const EditCardModal: React.FC<EditCardModalProps> = ({ card, isOpen, onClose }) => {
  const { saveCardEdit, deleteCardEdit, cardEdits } = useProgress();
  
  const [form, setForm] = useState({ question: '', answer: '', rationale: '' });
  const [activeField, setActiveField] = useState<'question' | 'answer' | 'rationale'>('rationale');
  const [hasEdit, setHasEdit] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const refs = {
    question: useRef<HTMLDivElement>(null),
    answer: useRef<HTMLDivElement>(null),
    rationale: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (isOpen && card) {
      setForm({
        question: card.question,
        answer: card.answer,
        rationale: card.rationale
      });
      setHasEdit(!!cardEdits[card.id]);
      setShowColorPicker(false);
    }
  }, [isOpen, card, cardEdits]);

  const handleSave = () => {
    if (!card) return;
    const edit: CardEdit = {
      id: card.id,
      question: form.question,
      answer: form.answer,
      rationale: form.rationale,
      updatedAt: Date.now()
    };
    saveCardEdit(edit);
    onClose();
  };

  const handleReset = () => {
    if (!card) return;
    const originalCards = adaptCards();
    const original = originalCards.find(c => c.id === card.id);
    if (original) {
      setForm({
        question: original.question,
        answer: original.answer,
        rationale: original.rationale
      });
      
      if(refs.question.current) refs.question.current.innerHTML = formatInitialContent(original.question);
      if(refs.answer.current) refs.answer.current.innerHTML = formatInitialContent(original.answer);
      if(refs.rationale.current) refs.rationale.current.innerHTML = formatInitialContent(original.rationale);

      deleteCardEdit(card.id);
      setHasEdit(false);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    const activeRef = refs[activeField];
    if (activeRef.current) {
        activeRef.current.focus();
        document.execCommand(command, false, value);
        setForm(prev => ({ ...prev, [activeField]: activeRef.current?.innerHTML || '' }));
    }
  };

  if (!isOpen || !card) return null;

  // Use Portal to ensure modal is always on top of everything (z-index 9999) and escapes parent transform contexts
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* 
        High Opacity Overlay 
        Blocks visuals of underlying flashcards/buttons.
      */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* 
        Modal Card 
        - Solid backgrounds (no transparency) for better text legibility.
        - High contrast borders for dark mode.
      */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#020617] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#020617] rounded-t-[2rem]">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                <PenTool size={20} />
              </span>
              <span>Edit Card</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 ml-1">
               <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                 {card.category}
               </span>
               {hasEdit && (
                 <span className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1">
                   <Check size={10} /> Modified
                 </span>
               )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sticky Toolbar - Overflow Visible to show Dropdown */}
        <div className="flex-none px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/80 dark:bg-[#0f172a] z-50 backdrop-blur-sm relative">
          <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-all shadow-sm" title="Bold">
            <Bold size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-all shadow-sm" title="Italic">
            <Italic size={18} />
          </button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1.5 shrink-0" />
          <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-all shadow-sm" title="Bullet List">
            <List size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); execCmd('indent'); }} className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-all shadow-sm" title="Indent">
            <AlignLeft size={18} />
          </button>
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1.5 shrink-0" />
          
          <div className="relative shrink-0">
            <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm ${showColorPicker ? 'bg-white dark:bg-slate-800 text-[var(--accent)]' : 'text-slate-600 dark:text-slate-400'}`}
                title="Text Color"
            >
                <Type size={18} />
                <ChevronDown size={14} />
            </button>

            {showColorPicker && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-rows-5 gap-2">
                        {COLOR_PALETTE.map((row, i) => (
                            <div key={i} className="flex gap-2 justify-between">
                                {row.map(color => (
                                    <button
                                        key={color}
                                        onMouseDown={(e) => { e.preventDefault(); execCmd('foreColor', color); setShowColorPicker(false); }}
                                        className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 hover:scale-125 transition-transform shadow-sm"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}
          </div>

          <div className="flex-1" />

          <button onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }} className="p-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all shadow-sm" title="Clear Formatting">
            <Eraser size={18} />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
          <RichTextEditor 
            label="Front (Question)" 
            value={form.question} 
            onChange={(html) => setForm(prev => ({ ...prev, question: html }))}
            isActive={activeField === 'question'}
            onFocus={() => setActiveField('question')}
            editorRef={refs.question}
          />

          <RichTextEditor 
            label="Back (Core Answer)" 
            value={form.answer} 
            onChange={(html) => setForm(prev => ({ ...prev, answer: html }))}
            isActive={activeField === 'answer'}
            onFocus={() => setActiveField('answer')}
            editorRef={refs.answer}
          />

          <RichTextEditor 
            label="Rationale / Notes" 
            value={form.rationale} 
            onChange={(html) => setForm(prev => ({ ...prev, rationale: html }))}
            isActive={activeField === 'rationale'}
            onFocus={() => setActiveField('rationale')}
            editorRef={refs.rationale}
          />
        </div>

        {/* Footer */}
        <div className="flex-none p-5 bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4 rounded-b-[2rem]">
          {hasEdit ? (
            <button 
              onClick={handleReset}
              className="px-3 sm:px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider"
            >
              <RotateCcw size={16} /> <span className="hidden sm:inline">Reset Default</span><span className="sm:hidden">Reset</span>
            </button>
          ) : (
            <div /> 
          )}
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 sm:px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
