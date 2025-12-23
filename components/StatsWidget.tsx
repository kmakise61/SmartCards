
import React from 'react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string; // e.g., "text-pink-500"
  className?: string;
  children?: React.ReactNode;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = "text-slate-800 dark:text-white",
  className = "",
  children
}) => {
  return (
    <div className={`bg-white dark:bg-darkcard rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{title}</h3>
        {icon && <div className={`${accentColor} opacity-80`}>{icon}</div>}
      </div>
      <div className="flex flex-col">
        <span className={`text-4xl font-black tracking-tighter ${accentColor} mb-1`}>{value}</span>
        {subtitle && <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{subtitle}</span>}
        {children && <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">{children}</div>}
      </div>
    </div>
  );
};
