import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Activity, BookOpen, Clock, AlertTriangle } from 'lucide-react';

interface HeatmapProps {
  isMini?: boolean;
}

const Heatmap: React.FC<HeatmapProps> = ({ isMini = false }) => {
  const { stats } = useData();
  const { isDark } = useTheme();

  // 1. Generate Date Range (Last 365 days)
  const { days, weeks } = useMemo(() => {
    const today = new Date();
    const endDate = today;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); 

    const dayList = [];
    let currentDate = new Date(startDate);

    // Map activity
    const activityMap = new Map(stats.activityHistory.map(item => [item.date, item.count]));

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dayList.push({
        date: new Date(currentDate),
        dateString,
        count: activityMap.get(dateString) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group into weeks for column-based rendering
    const weekList = [];
    let currentWeek: typeof dayList = [];
    
    for (let i = 0; i < dayList.length; i++) {
        currentWeek.push(dayList[i]);
        if (currentWeek.length === 7 || i === dayList.length - 1) {
            weekList.push(currentWeek);
            currentWeek = [];
        }
    }
    
    return { days: dayList, weeks: weekList };
  }, [stats.activityHistory]);

  // 2. Color Logic - Tuned for Deep Mode Visibility
  const getCellColor = (count: number) => {
    if (count === 0) return isDark ? 'bg-white/10 border-transparent' : 'bg-slate-200 border-transparent'; // Darker/Lighter base for empty
    if (count <= 2) return 'bg-accent/30 border-accent/20';
    if (count <= 5) return 'bg-accent/50 border-accent/30';
    if (count <= 9) return 'bg-accent/80 border-accent/50';
    return 'bg-accent border-accent/60 shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]';
  };

  // 3. Month Labels Logic
  const monthLabels = useMemo(() => {
      const labels = [];
      let lastMonth = -1;
      
      weeks.forEach((week, index) => {
          const firstDayOfWeek = week[0].date;
          const month = firstDayOfWeek.getMonth();
          if (month !== lastMonth) {
              labels.push({ text: firstDayOfWeek.toLocaleString('default', { month: 'short' }), colIndex: index });
              lastMonth = month;
          }
      });
      return labels;
  }, [weeks]);

  // KPIs
  const totalReviews = stats.cardsLearned; 
  const totalTimeHours = Math.round(stats.totalStudyTimemins / 60);
  const totalTimeDisplay = totalTimeHours < 1 ? `${stats.totalStudyTimemins}m` : `${totalTimeHours}h`;

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header KPI Row (Nebulearn-inspired) */}
      {!isMini && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border-color/50">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                    Memory Continuity
                    </h3>
                    <p className="text-xs text-text-secondary font-medium opacity-60">
                    Daily review consistency visualizer.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-accent opacity-70" />
                    <div>
                        <div className="text-sm font-black text-text-primary">{totalReviews}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary opacity-60">Studied</div>
                    </div>
                </div>
                <div className="w-px h-8 bg-border-color" />
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-accent opacity-70" />
                    <div>
                        <div className="text-sm font-black text-text-primary">{totalTimeDisplay}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary opacity-60">Time</div>
                    </div>
                </div>
                <div className="w-px h-8 bg-border-color" />
                <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-accent opacity-70" />
                    <div>
                        <div className="text-sm font-black text-text-primary">{stats.cardsDue}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary opacity-60">Due</div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <div className="flex flex-col min-w-max">
          
          {/* Month Labels */}
          {!isMini && (
            <div className="flex relative h-6 mb-1 w-full">
               <div className="w-10 shrink-0" /> 
               <div className="flex relative flex-1">
                   {monthLabels.map((label, i) => (
                       <span 
                        key={i} 
                        className="absolute text-[10px] font-bold uppercase tracking-wider text-text-secondary opacity-70"
                        style={{ left: `${label.colIndex * 14}px` }} 
                       >
                           {label.text}
                       </span>
                   ))}
               </div>
            </div>
          )}

          <div className="flex">
            {/* Day Labels */}
            {!isMini && (
                <div className="flex flex-col justify-between py-[1px] h-[96px] text-[10px] font-bold text-text-secondary opacity-60 shrink-0 text-right w-10 pr-3 leading-none">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>
            )}

            {/* The Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={day.dateString}
                      className={`
                        w-[11px] h-[11px] sm:w-[11px] sm:h-[11px] rounded-[3px] border 
                        transition-all duration-300 hover:scale-125 hover:z-10 cursor-default
                        ${getCellColor(day.count)}
                      `}
                      title={`${day.count} reviews on ${day.date.toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {!isMini && (
        <div className="flex items-center justify-end gap-3 px-1 pt-2 border-t border-border-color/30">
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary opacity-60">Intensity</span>
            <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-[3px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} title="0" />
                <div className="w-3 h-3 rounded-[3px] bg-accent/30" title="1-2" />
                <div className="w-3 h-3 rounded-[3px] bg-accent/50" title="3-5" />
                <div className="w-3 h-3 rounded-[3px] bg-accent/80" title="6-9" />
                <div className="w-3 h-3 rounded-[3px] bg-accent shadow-[0_0_6px_rgba(var(--accent-rgb),0.4)]" title="10+" />
            </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;