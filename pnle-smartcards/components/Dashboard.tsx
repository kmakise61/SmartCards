import React, { useState } from 'react';
import { Brain, Clock, Activity, ArrowRight, Zap, BookOpen, Edit2, RotateCcw, X, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import Heatmap from './analytics/Heatmap';
import { createPortal } from 'react-dom';
import { TARGET_DATE } from '../constants';

interface DashboardProps {
  onStartSession: () => void;
  onQuickFire: () => void;
  onBrowse: () => void;
  onOpenManuals: () => void;
  onViewAnalytics: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onStartSession,
  onQuickFire,
  onBrowse,
  onOpenManuals,
  onViewAnalytics,
}) => {
  const { isDark } = useTheme();
  const { stats, decks, dashboardConfig, updateDashboardConfig } = useData();
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempSubtitle, setTempSubtitle] = useState('');

  const glassPanelClass = `rounded-2xl border border-border-color backdrop-blur-xl transition-all ${
      isDark 
        ? 'bg-surface/40 shadow-xl' 
        : 'bg-white/70 shadow-lg'
  }`;

  const openRenameModal = () => {
      setTempTitle(dashboardConfig.title);
      setTempSubtitle(dashboardConfig.subtitle);
      setIsRenaming(true);
  };

  const handleSaveRename = () => {
      const finalTitle = tempTitle.trim() || 'Precision Board Review.';
      const finalSubtitle = tempSubtitle.trim() || dashboardConfig.subtitle;
      updateDashboardConfig({ title: finalTitle, subtitle: finalSubtitle });
      setIsRenaming(false);
  };

  const handleResetDefaults = () => {
      const month = new Date().toLocaleString('default', { month: 'long' });
      const year = new Date().getFullYear();
      const nextExamYear = TARGET_DATE.getFullYear();
      setTempTitle("Precision Board Review.");
      setTempSubtitle(`Locked in for ${month} ${year} — Ready for ${nextExamYear}.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-slide-up relative">
      {/* COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`col-span-1 lg:col-span-8 p-8 lg:p-12 relative overflow-hidden group ${glassPanelClass}`}>
          <div
            className={`absolute -top-10 -right-10 w-64 h-64 rounded-full filter blur-[100px] opacity-10 bg-accent transition-transform duration-700 group-hover:scale-125`}
          />

          <div className="relative z-10 flex flex-col h-full justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div
                    className={`px-3 py-1 rounded-md border inline-flex items-center gap-2 bg-surface border-border-color`}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Active Protocol</span>
                </div>
                <button 
                    onClick={openRenameModal}
                    className="p-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all opacity-0 group-hover:opacity-100"
                    title="Rename Dashboard"
                >
                    <Edit2 size={14} />
                </button>
              </div>

              <div>
                <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-text-primary mb-2 line-clamp-2`}>
                    {dashboardConfig.title}
                </h1>
                <p className={`text-base md:text-lg font-medium leading-relaxed italic opacity-90 text-accent line-clamp-2`}>
                    {dashboardConfig.subtitle}
                </p>
              </div>
              
              <p className={`text-sm md:text-base max-w-lg font-medium leading-relaxed text-text-secondary`}>
                Spaced-repetition engine synchronized. <span className="text-accent font-black">{stats.cardsDue} key concepts</span> are prioritized for today's review session.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStartSession}
                className="px-8 py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] text-white bg-accent hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                Ignite Session
              </button>

              <div
                className={`flex items-center gap-6 px-6 py-4 rounded-lg border bg-surface border-border-color`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-accent" />
                  <span className="text-xs font-black text-text-primary">14m Load</span>
                </div>
                <div className="w-px h-6 bg-border-color" />
                <div className="flex items-center gap-3">
                  <Brain size={16} className="text-accent" />
                  <span className="text-xs font-black text-text-primary">High Focus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className={`p-8 flex flex-col justify-between hover:border-accent/20 ${glassPanelClass}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 text-text-primary">Mastery</span>
                <div className="text-5xl font-black tracking-tighter text-text-primary">{stats.retentionRate}%</div>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Activity size={22} />
              </div>
            </div>
            <div className="w-full h-1 rounded-full mt-6 bg-border-color/50">
              <div className="h-full bg-accent rounded-full" style={{ width: `${stats.retentionRate}%` }} />
            </div>
          </div>

          <div className={`p-8 flex flex-col justify-between hover:border-accent/20 relative overflow-hidden ${glassPanelClass}`}>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Zap size={100} className="text-accent" fill="currentColor" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 text-text-primary">Streak</span>
              <div className="text-5xl font-black tracking-tighter text-text-primary">
                {stats.streakDays} <span className="text-[10px] font-black uppercase opacity-20">Days</span>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-accent mt-4">Momentum Stable</p>
          </div>
        </div>
      </div>

      {/* FOOTER MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`col-span-1 lg:col-span-7 p-8 ${glassPanelClass}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-sm uppercase tracking-widest text-text-primary">Priority Sets</h3>
            <button onClick={onBrowse} className="text-[9px] font-black uppercase tracking-widest text-accent hover:underline">
              View Library
            </button>
          </div>
          <div className="space-y-3">
            {decks.slice(0, 3).map((deck, idx) => (
              <div
                key={idx}
                className={`group flex items-center p-4 rounded-lg border transition-all hover:bg-accent/5 cursor-pointer gap-4 bg-surface border-border-color`}
              >
                <div className="w-10 h-10 shrink-0 rounded bg-accent text-white flex items-center justify-center font-black text-xs">
                  NP{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs truncate text-text-primary">{deck.title}</div>
                  <div className="text-[9px] font-bold uppercase opacity-30 tracking-wider text-text-secondary">Module Specialized</div>
                </div>
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-accent"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-5 grid grid-rows-2 gap-6">
          <button
            onClick={onOpenManuals}
            className={`p-8 flex items-center gap-6 group hover:bg-accent transition-all text-left ${glassPanelClass}`}
          >
            <div className="p-4 rounded-lg bg-accent/10 group-hover:bg-white/20 text-accent group-hover:text-white">
              <BookOpen size={28} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-black text-sm uppercase tracking-widest group-hover:text-white text-text-primary">
                Study Manuals
              </h4>
              <p className="text-[10px] font-medium opacity-40 group-hover:text-white/60 text-text-secondary">
                Access Reference PDFs
              </p>
            </div>
          </button>
          <button
            onClick={onQuickFire}
            className={`p-8 flex items-center gap-6 group hover:bg-emerald-500 transition-all text-left ${glassPanelClass}`}
          >
            <div className="p-4 rounded-lg bg-emerald-500/10 group-hover:bg-white/20 text-emerald-500 group-hover:text-white">
              <Zap size={28} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-black text-sm uppercase tracking-widest group-hover:text-white text-text-primary">
                Quick Fire
              </h4>
              <p className="text-[10px] font-medium opacity-40 group-hover:text-white/60 text-text-secondary">
                15 Card Sprint
              </p>
            </div>
          </button>
        </div>
      </div>
      
      {/* ANALYTICS PREVIEW - Full Heatmap */}
      <div className={`col-span-1 lg:col-span-12 p-8 ${glassPanelClass}`}>
          <div className="flex items-center justify-end mb-4">
              <button onClick={onViewAnalytics} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent hover:underline opacity-80 hover:opacity-100">
                  Full Analytics <ArrowRight size={12} />
              </button>
          </div>
          {/* isMini={false} ensures headers and labels are shown */}
          <Heatmap isMini={false} />
      </div>

      {/* Rename Modal */}
      {isRenaming && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div 
                className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
                    isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'
                }`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                }}
              >
                  <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Customize Dashboard
                      </h3>
                      <button 
                        onClick={() => setIsRenaming(false)}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-400'}`}
                      >
                          <X size={18} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                              Headline
                          </label>
                          <input 
                              autoFocus
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value.slice(0, 42))}
                              className={`w-full p-3 rounded-xl outline-none border transition-all text-sm font-bold ${
                                  isDark 
                                    ? 'bg-[#0f172a] border-slate-600 text-white focus:border-accent' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-accent'
                              }`}
                              placeholder="e.g. PNLE Sprint Mode"
                          />
                          <div className="flex justify-end mt-1">
                              <span className={`text-[9px] font-mono ${tempTitle.length >= 42 ? 'text-red-500' : 'text-text-secondary opacity-40'}`}>
                                  {tempTitle.length}/42
                              </span>
                          </div>
                      </div>

                      <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                              Subtitle
                          </label>
                          <input 
                              value={tempSubtitle}
                              onChange={(e) => setTempSubtitle(e.target.value.slice(0, 80))}
                              className={`w-full p-3 rounded-xl outline-none border transition-all text-sm font-medium ${
                                  isDark 
                                    ? 'bg-[#0f172a] border-slate-600 text-white focus:border-accent' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-accent'
                              }`}
                              placeholder="e.g. December 2025 focus"
                          />
                          <div className="flex justify-end mt-1">
                              <span className={`text-[9px] font-mono ${tempSubtitle.length >= 80 ? 'text-red-500' : 'text-text-secondary opacity-40'}`}>
                                  {tempSubtitle.length}/80
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-border-color">
                      <button 
                        onClick={handleResetDefaults}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                          <RotateCcw size={12} /> Reset Default
                      </button>
                      
                      <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setIsRenaming(false)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                isDark ? 'text-white/60 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleSaveRename}
                            className="px-6 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                          >
                              <Check size={14} strokeWidth={3} /> Save
                          </button>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default Dashboard;