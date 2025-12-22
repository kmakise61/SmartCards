import React, { useMemo } from 'react';
import { CardRating, Flashcard } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface StudyControlsProps {
  onRate: (rating: CardRating) => void;
  disabled?: boolean;
  card?: Flashcard;
}

const StudyControls: React.FC<StudyControlsProps> = ({ onRate, disabled, card }) => {
  const { isDark, isCrescere } = useTheme();

  // --- INTERVAL FORMATTER ---
  const formatInterval = (val: number): string => {
    if (val < 1) {
        // Less than 1 day -> Convert to Minutes or Hours
        const mins = Math.round(val * 24 * 60);
        if (mins < 60) return `< 1m`; // simplified per requirement for New Again
        // If it's specifically around 10 minutes (0.007 days)
        if (mins >= 9 && mins <= 11) return '10m';
        const hours = (mins / 60).toFixed(1);
        return `${hours}h`;
    }
    // Days
    if (val < 30) return `${Math.round(val * 10) / 10}d`;
    // Months
    if (val < 365) return `${(val / 30).toFixed(1)}mo`;
    // Years
    return `${(val / 365).toFixed(1)}y`;
  };

  // --- DYNAMIC INTERVAL CALCULATION ---
  const intervals = useMemo(() => {
      if (!card) return { again: '< 1m', hard: '10m', good: '1d', easy: '4d' };

      const isNew = card.status === 'new' || card.interval === 0;
      
      if (isNew) {
          // NEW CARD RULES (Fixed)
          return {
              again: '< 1m',
              hard: '10m',
              good: '1d',
              easy: '4d'
          };
      } else {
          // REVIEW CARD RULES
          // Current interval in days
          const iv = Math.max(1, card.interval); 
          
          return {
              again: '10m', // Relearn step
              hard: formatInterval(iv * 1.2),
              good: formatInterval(iv * 2.5),
              easy: formatInterval(iv * 4.0) // 4x multiplier for Easy (Good * 1.6 essentially)
          };
      }
  }, [card]);

  const buttons = [
    { rating: 'again', label: 'Again', time: intervals.again, color: 'bg-rose-500', shadow: 'shadow-rose-500/20', key: '1' },
    { rating: 'hard', label: 'Hard', time: intervals.hard, color: 'bg-orange-500', shadow: 'shadow-orange-500/20', key: '2' },
    { rating: 'good', label: 'Good', time: intervals.good, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', key: '3' },
    { rating: 'easy', label: 'Easy', time: intervals.easy, color: 'bg-sky-500', shadow: 'shadow-sky-500/20', key: '4' },
  ] as const;

  // Theme-based style resolver
  const getButtonStyle = () => {
    if (isCrescere) {
      return 'bg-[#000000] border-white/10 text-white hover:bg-white/5 hover:border-white/20';
    }
    if (isDark) {
      return 'bg-[#1e293b] border-slate-700 text-white hover:bg-slate-700/80'; // Improved Dark Mode
    }
    return 'bg-white/80 border-slate-100 text-slate-900 hover:bg-white';
  };

  const getSubTextStyle = () => {
    if (isCrescere || isDark) return 'text-white/40';
    return 'text-slate-400';
  };

  const getKeyStyle = () => {
    if (isCrescere) return 'bg-white/5 border-white/10 text-white/30 group-hover:text-white/60';
    if (isDark) return 'bg-slate-800 border-slate-600 text-slate-400 group-hover:text-slate-200';
    return 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-slate-600';
  };

  return (
    <div className={`grid grid-cols-4 gap-3 md:gap-6 w-full max-w-2xl transition-all duration-700 ease-out ${disabled ? 'opacity-0 translate-y-12 pointer-events-none blur-sm' : 'opacity-100 translate-y-0'}`}>
      {buttons.map((btn) => (
        <button
          key={btn.rating}
          onClick={(e) => {
            e.stopPropagation();
            onRate(btn.rating);
          }}
          className={`
            group relative flex flex-col items-center justify-center py-5 md:py-6 rounded-2xl md:rounded-3xl border transition-all duration-300 active:scale-95 hover:-translate-y-1
            ${getButtonStyle()}
            ${btn.shadow} hover:shadow-xl
          `}
        >
          {/* Top Accent Line */}
          <div className={`absolute top-0 inset-x-4 h-0.5 md:h-1 rounded-b-full transition-all duration-300 opacity-60 group-hover:opacity-100 ${btn.color}`} />
          
          <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${getSubTextStyle()}`}>
             {btn.time}
          </span>
          <span className={`text-sm md:text-lg font-black tracking-tight`}>
             {btn.label}
          </span>
          
          <div className={`mt-2 md:mt-3 px-1.5 py-0.5 rounded md:rounded-md border text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-opacity ${getKeyStyle()}`}>
             {btn.key}
          </div>
        </button>
      ))}
    </div>
  );
};

export default StudyControls;