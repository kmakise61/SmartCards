
import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { Flame, CheckCircle2, Target, Info } from 'lucide-react';

export const DailyGoalWidget: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { dailyStats } = useProgress();
  const { settings } = useSettings();

  const count = dailyStats.count;
  const goal = settings.dailyGoal || 50;
  const progress = Math.min(100, Math.round((count / goal) * 100));
  const isGoalMet = count >= goal;

  // Calculate circumference for circle (r=32)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`bg-white dark:bg-darkcard rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group ${className}`}>
      
      {/* Background Pulse if Goal Met */}
      {isGoalMet && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      )}

      <div className="flex items-center justify-between relative z-10">
        
        {/* Left: Text Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1.5 rounded-lg ${isGoalMet ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'}`}>
              {isGoalMet ? <CheckCircle2 size={16} /> : <Target size={16} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Target</span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{count}</span>
            <span className="text-xs font-bold text-slate-400">/ {goal}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-orange-600 dark:text-orange-400">
              <Flame size={12} className={dailyStats.streak > 0 ? "fill-current" : ""} />
              <span className="text-[10px] font-black uppercase tracking-wide">{dailyStats.streak} Day Streak</span>
            </div>
            
            {/* Info Tooltip */}
            <div className="group/info relative">
              <Info size={14} className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] font-medium rounded-xl shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                 Review at least one card every day to build your streak. Missing a day resets it to zero.
                 <div className="absolute top-full left-1.5 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Progress Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${isGoalMet ? 'text-emerald-500' : 'text-[var(--accent)]'}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-slate-900 dark:text-white translate-y-[1px]">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
