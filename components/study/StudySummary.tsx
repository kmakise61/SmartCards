import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface StudySummaryProps {
  correct: number;
  total: number;
  onClose: () => void;
}

const StudySummary: React.FC<StudySummaryProps> = ({ correct, total, onClose }) => {
  const { isDark, isCrescere } = useTheme();
  const { cards } = useData();
  const percentage = Math.round((correct / total) * 100) || 0;

  // Compute Mini Insights from Global Data
  // We look for cards with recent 'Again' or 'Hard' ratings
  const weaknessInsights = useMemo(() => {
      const recentStruggles = cards.filter(c => c.struggleScore && c.struggleScore > 50).slice(0, 3);
      const weakTags = new Map<string, number>();
      
      cards.forEach(c => {
          if (c.struggleScore && c.struggleScore > 40) {
              c.tags.forEach(t => weakTags.set(t, (weakTags.get(t) || 0) + 1));
          }
      });

      // Get top 2 weak tags
      const topWeakTags = Array.from(weakTags.entries())
          .sort((a,b) => b[1] - a[1])
          .slice(0, 2)
          .map(e => e[0]);

      return { recentStruggles, topWeakTags };
  }, [cards]);

  // CSS for Confetti Particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 1 + 's',
    backgroundColor: ['#F59E0B', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 relative overflow-hidden animate-in">
      
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
           <div 
             key={i}
             className="absolute top-0 w-2 h-2 rounded-full animate-[float_4s_ease-in-out_infinite]"
             style={{ 
                 left: p.left, 
                 animationDelay: p.animationDelay, 
                 backgroundColor: p.backgroundColor,
                 opacity: 0.6 
             }}
           />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-md p-8 rounded-3xl border shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-6
          ${isDark ? 'bg-[#0B1121]/80 border-white/10' : 'bg-white/90 border-slate-200'}
      `}>
          <div className={`p-6 rounded-full shadow-lg animate-bounce ${isCrescere ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
              <Trophy size={48} fill="currentColor" className="drop-shadow-sm" />
          </div>

          <div>
              <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Session Complete!</h2>
              <p className={`text-sm opacity-70 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You're crushing your goals today.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2 justify-center mb-1 opacity-60">
                      <TrendingUp size={14} /> <span className="text-xs font-bold uppercase">Accuracy</span>
                  </div>
                  <div className={`text-2xl font-black ${percentage >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{percentage}%</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2 justify-center mb-1 opacity-60">
                      <Clock size={14} /> <span className="text-xs font-bold uppercase">Time</span>
                  </div>
                  <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>~2m</div>
              </div>
          </div>

          {/* Mini Insights */}
          {(weaknessInsights.topWeakTags.length > 0 || weaknessInsights.recentStruggles.length > 0) && (
              <div className={`w-full p-4 rounded-2xl border text-left ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mistake Patterns Detected</span>
                  </div>
                  {weaknessInsights.topWeakTags.length > 0 && (
                      <p className={`text-xs mb-1 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                          Weak Topics: <span className="font-bold">{weaknessInsights.topWeakTags.join(', ')}</span>
                      </p>
                  )}
                  {weaknessInsights.recentStruggles.length > 0 && (
                      <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                          {weaknessInsights.recentStruggles.length} cards need review.
                      </p>
                  )}
              </div>
          )}

          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2
                ${isCrescere ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-pink-500 to-rose-600'}
            `}
          >
             Back to Dashboard <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
};

export default StudySummary;