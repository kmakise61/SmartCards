
import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Calendar, Clock, AlertCircle, Trophy, Target } from 'lucide-react';

interface ExamCountdownProps {
  onSetDate: () => void;
  className?: string;
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({ onSetDate, className = "" }) => {
  const { settings } = useSettings();

  if (!settings.targetExamDate) {
    return (
      <div 
        onClick={onSetDate}
        className={`bg-white dark:bg-darkcard rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${className}`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Set Exam Date</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enable the countdown widget</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center group-hover:text-[var(--accent)] transition-colors">
            <Calendar size={20} />
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  // Reset time to midnight for accurate day calculation
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(settings.targetExamDate).getTime();
  
  const diffTime = target - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Visual Configuration based on urgency
  let theme = {
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: Trophy,
    message: 'Build solid foundations',
    progressColor: 'bg-emerald-500'
  };

  if (daysLeft < 0) {
    return (
      <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center ${className}`}>
        <div className="inline-flex p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 mb-3">
          <Trophy size={24} />
        </div>
        <h3 className="text-lg font-black text-slate-700 dark:text-slate-300">Exam Completed</h3>
        <button onClick={onSetDate} className="text-xs font-bold text-[var(--accent)] mt-2 hover:underline">Set New Date</button>
      </div>
    );
  }

  if (daysLeft <= 30) {
    theme = {
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      border: 'border-rose-100 dark:border-rose-900/30',
      text: 'text-rose-700 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      icon: AlertCircle,
      message: 'Urgent: Focus on Weaknesses',
      progressColor: 'bg-rose-500'
    };
  } else if (daysLeft <= 90) {
    theme = {
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      border: 'border-amber-100 dark:border-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: Clock,
      message: 'Intensify Practice Questions',
      progressColor: 'bg-amber-500'
    };
  }

  // Calculate percentage for a visual bar (assuming a 6-month / 180 day prep cycle as baseline max)
  const maxDays = 180;
  const percentage = Math.min(100, Math.max(5, ((maxDays - daysLeft) / maxDays) * 100));

  return (
    <div 
      onClick={onSetDate}
      className={`relative rounded-3xl p-6 border transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${theme.bg} ${theme.border} ${className}`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.iconColor}`}>
          <theme.icon size={20} />
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${theme.text} opacity-80`}>
          Target: {new Date(settings.targetExamDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-5xl font-black tracking-tighter ${theme.text}`}>{daysLeft}</span>
          <span className={`text-sm font-bold uppercase tracking-widest ${theme.text} opacity-80`}>Days Left</span>
        </div>
        <p className={`text-xs font-bold ${theme.text} opacity-90 mb-4`}>{theme.message}</p>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${theme.progressColor} transition-all duration-1000 ease-out relative`} 
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-[pulse_2s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};
