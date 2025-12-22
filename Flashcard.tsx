import React from 'react';
import { Eye, BookOpen, Sparkles } from 'lucide-react';
import { Flashcard as FlashcardType } from '../../types';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
}

// --- TEXT PARSING UTILITIES ---

const decodeEntities = (s: string) => {
  if (!s) return s;
  if (!/[&][a-zA-Z]+;|&#\d+;|&#x[a-fA-F0-9]+;/.test(s)) return s;
  try {
    const ta = document.createElement('textarea');
    ta.innerHTML = s;
    return ta.value;
  } catch (e) {
    return s;
  }
};

const normalizeToMarkdown = (input: string) => {
  let s = decodeEntities(input || '');

  // Basic HTML to Markdown conversion for legacy data or mixed content
  if (/<(br|div|p|ul|ol|li|strong|b|em|i|u|mark|blockquote)\b/i.test(s)) {
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/?(div|p)[^>]*>/gi, '\n'); 
    s = s.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
    s = s.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '_$2_');
    s = s.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');
    s = s.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==');
    s = s.replace(/<blockquote[^>]*>/gi, '\n> ').replace(/<\/blockquote>/gi, '\n');
    s = s.replace(/<li[^>]*>/gi, '\n- ').replace(/<\/li>/gi, '');
    s = s.replace(/<\/?(ul|ol)[^>]*>/gi, '');
    s = s.replace(/\n{3,}/g, '\n\n');
  }
  
  return s.trim();
};

// Recursive Inline Parser
const parseInline = (text: string): React.ReactNode => {
  if (!text) return null;

  const parts = text.split(/(==.+?==|\*\*.+?\*\*|__.+?__|_[^_]+?_)/g);

  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    // Highlight: ==text==
    if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
      return (
        <mark key={index} className="bg-accent/20 text-text-primary px-1 rounded-sm font-bold mx-0.5">
          {parseInline(part.slice(2, -2))}
        </mark>
      );
    }
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-black text-accent">
          {parseInline(part.slice(2, -2))}
        </strong>
      );
    }
    // Underline: __text__
    if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
      return (
        <u key={index} className="decoration-accent decoration-2 underline-offset-4">
          {parseInline(part.slice(2, -2))}
        </u>
      );
    }
    // Italic: _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      return (
        <em key={index} className="italic opacity-90 text-accent/80">
          {parseInline(part.slice(1, -1))}
        </em>
      );
    }
    
    return part;
  });
};

export const FormattedText: React.FC<{
  text: string;
  align?: 'center' | 'left';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}> = ({ text, align = 'left', size = 'base', className = '' }) => {
  if (!text) return null;

  const normalized = normalizeToMarkdown(text);
  const lines = normalized.split('\n');
  
  const textSize =
    size === 'sm'
      ? 'text-[13px]'
      : size === 'lg'
      ? 'text-lg'
      : size === 'xl'
      ? 'text-xl md:text-2xl'
      : size === '2xl'
      ? 'text-2xl md:text-4xl'
      : 'text-base';

  const textAlign = align === 'center' ? 'text-center' : 'text-left';

  const renderedElements: React.ReactNode[] = [];
  
  let inList = false;
  let listBuffer: { indent: number; content: string }[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="list-none space-y-2 my-2 w-full">
          {listBuffer.map((item, idx) => (
            <li 
              key={idx} 
              className="flex gap-3 items-start text-left"
              style={{ paddingLeft: `${item.indent * 1.5}rem` }}
            >
              <span className="text-accent mt-[0.5em] text-[8px] shrink-0 opacity-80">●</span>
              <span className="flex-1 leading-relaxed break-words min-w-0">
                {parseInline(item.content)}
              </span>
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
      inList = false;
    }
  };

  lines.forEach((rawLine, i) => {
    const cleanLine = rawLine.replace(/\t/g, '  ');
    const leadingSpaces = cleanLine.match(/^[ ]*/)?.[0].length || 0;
    const indentLevel = Math.floor(leadingSpaces / 2);
    const content = cleanLine.trim();

    if (!content) {
      flushList();
      renderedElements.push(<div key={`spacer-${i}`} className="h-2" />);
      return;
    }

    if (content.startsWith('- ') || content.startsWith('• ')) {
      inList = true;
      listBuffer.push({ indent: indentLevel, content: content.substring(2) });
    } 
    else if (content.startsWith('> ')) {
      flushList();
      renderedElements.push(
        <blockquote 
          key={`quote-${i}`} 
          className="border-l-4 border-accent/40 pl-4 py-2 my-3 italic opacity-90 bg-surface/5 rounded-r w-full text-left"
          style={{ marginLeft: `${indentLevel * 1}rem` }}
        >
          {parseInline(content.substring(2))}
        </blockquote>
      );
    } 
    else {
      flushList();
      renderedElements.push(
        <div 
          key={`p-${i}`} 
          className="mb-2 leading-relaxed break-words min-w-0 w-full"
          style={{ paddingLeft: `${indentLevel * 1}rem` }}
        >
          {parseInline(content)}
        </div>
      );
    }
  });

  flushList();

  return (
    <div className={`w-full ${textAlign} ${textSize} text-text-primary ${className}`}>
      {renderedElements}
    </div>
  );
};

const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      className="relative w-full max-w-2xl mx-auto perspective-1000 group cursor-pointer"
      onClick={onFlip}
      style={{ minHeight: '60vh' }}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT */}
        {/* Added bg-white and dark:bg-slate-900 to ensure visibility if glass effect fails */}
        <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col bg-white dark:bg-slate-900 glass-panel sharp-card shadow-2xl rounded-[2rem] border border-white/20">
          <div className="absolute top-0 inset-x-0 h-1 bg-accent" />
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar">
            <div className="mb-8 md:mb-12">
              <span className="px-4 py-1.5 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.25em] rounded-full bg-accent/5 shadow-sm">
                Inquiry
              </span>
            </div>
            <div className="font-bold leading-relaxed tracking-tight w-full flex-1 flex flex-col justify-center">
              <FormattedText text={card.front} align="center" size="2xl" />
            </div>
            {card.hint && (
              <div className="mt-8 md:mt-12 group/hint relative inline-block">
                <div className="px-5 py-2.5 border border-border-color transition-all duration-300 blur-sm hover:blur-none select-none text-xs bg-panel text-text-secondary rounded-lg">
                  {card.hint}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-accent opacity-50 group-hover/hint:opacity-0 transition-opacity">
                  <Eye size={8} /> Clue
                </div>
              </div>
            )}
          </div>
          <div className="p-5 border-t border-border-color text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-text-secondary">
            Tap to Reveal
          </div>
        </div>

        {/* BACK */}
        {/* Added solid background colors to fix transparency issues */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col bg-white dark:bg-slate-900 glass-panel sharp-card shadow-2xl rounded-[2rem] border border-white/20">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-purple-600" />
          
          <div className="flex-1 p-8 md:p-12 flex flex-col items-center overflow-y-auto custom-scrollbar">
            <div className="mb-8 w-full flex justify-center">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5">
                  <BookOpen size={12} className="text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                    Rationale
                  </span>
               </div>
            </div>
            
            <div className="w-full flex-1 flex flex-col justify-center">
              <FormattedText text={card.back} align="left" size="xl" />
            </div>

            {card.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border-color w-full flex flex-wrap gap-2 justify-center">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg border border-border-color bg-panel text-[9px] font-black text-text-secondary uppercase tracking-widest"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-border-color text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-text-secondary">
            <Sparkles size={10} className="inline mr-1" /> Peer Verified
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;