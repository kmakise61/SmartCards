import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, Clock, Activity, AlertCircle, Tag, BrainCircuit, Target, ArrowRight, Zap, Trophy } from 'lucide-react';
import Heatmap from './Heatmap';
import { FormattedText } from '../study/Flashcard';
import { Flashcard } from '../../types';

interface AnalyticsPageProps {
    onStartDrill?: (cards: Flashcard[]) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onStartDrill }) => {
  const { stats, cards } = useData();
  const { isDark } = useTheme();

  const totalCards = cards.length;
  const matureCards = cards.filter(c => c.interval > 21).length;
  const learningCards = cards.filter(c => c.status === 'learning' || c.status === 'relearning').length;
  const newCards = cards.filter(c => c.status === 'new').length;

  const masteryPercentage =
    totalCards > 0 ? Math.round((matureCards / totalCards) * 100) : 0;

  // --- INSIGHTS LOGIC ---
  const insights = useMemo(() => {
    const tagScores = new Map<string, { totalScore: number, count: number }>();
    const missedCards = cards
        .filter(c => (c.struggleScore || 0) > 0)
        .sort((a,b) => (b.struggleScore || 0) - (a.struggleScore || 0));

    cards.forEach(card => {
        if (card.struggleScore && card.struggleScore > 0) {
            const tagsToUse = card.tags.length > 0 ? card.tags : ['Untagged'];
            tagsToUse.forEach(tag => {
                const current = tagScores.get(tag) || { totalScore: 0, count: 0 };
                tagScores.set(tag, {
                    totalScore: current.totalScore + card.struggleScore!,
                    count: current.count + 1
                });
            });
        }
    });

    const sortedTags = Array.from(tagScores.entries())
        .map(([tag, data]) => ({ tag, score: Math.round(data.totalScore / data.count), count: data.count }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return {
        topWeakTags: sortedTags,
        topMissedCards: missedCards.slice(0, 5)
    };
  }, [cards]);

  const handleDrillTag = (tag: string) => {
      if (!onStartDrill) return;
      const cardsForDrill = cards.filter(c => c.tags.includes(tag) || (tag === 'Untagged' && c.tags.length === 0));
      onStartDrill(cardsForDrill);
  };

  const handleDrillCard = (card: Flashcard) => {
      if (!onStartDrill) return;
      onStartDrill([card]);
  };

  const glassPanelClass = `rounded-[2rem] border border-border-color backdrop-blur-xl transition-all ${
      isDark 
        ? 'bg-surface/40 shadow-2xl' 
        : 'bg-white/80 shadow-xl'
  }`;

  // PREMIUM RETENTION RING CONFIG
  const size = 220;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (masteryPercentage / 100) * circumference;

  return (
    <div className="w-full flex justify-center p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* ROW 1: HEADER */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary">
            Study Analytics
          </h2>
          <p className="text-text-secondary text-sm md:text-base font-medium max-w-xl mx-auto">
            Visualize your progress and identify areas for improvement.
          </p>
        </div>

        {/* ROW 2: RETENTION + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: RETENTION MASTERY */}
          <div className={`lg:col-span-4 p-8 flex flex-col items-center justify-between text-center relative overflow-hidden ${glassPanelClass} min-h-[340px]`}>
            <div className="relative z-10 w-full flex flex-col items-center h-full">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-text-secondary opacity-80">
                Retention Mastery
                </h3>

                {/* SVG Ring */}
                <div className="relative flex-1 flex items-center justify-center">
                    <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
                        {/* Track */}
                        <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-text-primary/5"
                        />
                        {/* Progress */}
                        <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-accent transition-all duration-1000 ease-out"
                        style={{ filter: "drop-shadow(0 0 6px rgba(var(--accent-rgb), 0.4))" }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-6xl font-black leading-none text-text-primary tracking-tighter">
                        {masteryPercentage}%
                        </span>
                        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                        Mature
                        </span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-2 w-full mt-8 pt-6 border-t border-border-color">
                    {[
                        { label: 'Mature', value: matureCards, color: 'text-accent' },
                        { label: 'Learning', value: learningCards, color: 'text-text-primary' },
                        { label: 'New', value: newCards, color: 'text-text-secondary' },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center">
                            <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                            <span className="text-[9px] font-bold uppercase opacity-60 text-text-secondary tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* RIGHT: STAT CARDS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
                {[
                    {
                    icon: TrendingUp,
                    color: 'text-blue-500 bg-blue-500/10',
                    value: stats.cardsLearned,
                    label: 'Total Reviews',
                    sub: 'Lifetime cards studied'
                    },
                    {
                    icon: Clock,
                    color: 'text-purple-500 bg-purple-500/10',
                    value: `${Math.round(stats.totalStudyTimemins / 60)}h`,
                    label: 'Study Time',
                    sub: 'Total focused hours'
                    },
                    {
                    icon: Activity,
                    color: 'text-orange-500 bg-orange-500/10',
                    value: stats.streakDays,
                    label: 'Day Streak',
                    sub: 'Consecutive activity'
                    },
                ].map((stat) => (
                    <div key={stat.label} className={`p-6 flex flex-col items-center justify-center text-center gap-3 hover:scale-[1.02] transition-transform ${glassPanelClass}`}>
                        <div className={`p-3 rounded-2xl ${stat.color} mb-1`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-text-secondary opacity-70 mt-1">{stat.label}</div>
                        </div>
                        <div className="text-[10px] font-medium text-text-secondary opacity-50">{stat.sub}</div>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* ROW 3: INSIGHTS (Full Width) */}
        <div className={`p-8 relative overflow-hidden group ${glassPanelClass}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <BrainCircuit size={180} className="text-red-500" />
            </div>
            
            <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/50 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-text-primary">Mistake Pattern Insights</h3>
                            <p className="text-sm font-medium opacity-60 text-text-secondary">AI-powered analysis of your weak spots.</p>
                        </div>
                    </div>
                    {insights.topWeakTags.length > 0 && (
                        <div className="px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
                            {insights.topMissedCards.length} Cards Need Review
                        </div>
                    )}
                </div>

                {insights.topWeakTags.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                        <Trophy size={48} className="text-text-secondary mb-4 opacity-50" />
                        <p className="text-sm font-bold text-text-primary">No mistake patterns detected yet.</p>
                        <p className="text-xs text-text-secondary mt-1">Keep studying to generate insights!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Weak Tags */}
                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-text-secondary pl-1">Top Weak Topics</h4>
                            <div className="space-y-3">
                                {insights.topWeakTags.map((item, idx) => (
                                    <div key={item.tag} className="flex items-center justify-between p-3 rounded-2xl bg-surface/50 border border-border-color hover:border-red-500/30 transition-all group/item">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                                idx === 0 ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-text-primary/5 text-text-secondary'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={12} className="opacity-40 text-text-primary" />
                                                    <span className="text-sm font-bold truncate text-text-primary">{item.tag}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDrillTag(item.tag)}
                                            className="ml-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover/item:opacity-100"
                                        >
                                            <Target size={12} /> Drill
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Missed Cards */}
                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-text-secondary pl-1">Most Missed Cards</h4>
                            <div className="space-y-3">
                                {insights.topMissedCards.map((card) => (
                                    <div key={card.id} className="p-4 rounded-2xl bg-surface/50 border border-border-color hover:border-red-500/30 transition-all flex items-center justify-between gap-4 group/card cursor-pointer" onClick={() => handleDrillCard(card)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-text-primary line-clamp-1 mb-2">
                                                <FormattedText text={card.front} size="sm"/>
                                            </div>
                                            <div className="w-full h-1.5 bg-text-primary/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${card.struggleScore}%`}} />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 opacity-0 group-hover/card:opacity-100 transition-all scale-90 group-hover/card:scale-100">
                                            <Zap size={14} fill="currentColor"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* ROW 4: HEATMAP (Full Width) */}
        <div className={`p-8 ${glassPanelClass}`}>
            <Heatmap />
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;