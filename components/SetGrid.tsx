
import React, { useState } from 'react';
import { SetMetadata, DeckConfig, DeckId } from '../types';
import { SetCard } from './SetCard';
import { ArrowLeft, LayoutGrid, List as ListIcon, Stethoscope, Activity, HeartPulse, Brain, Waves, Zap, ShieldCheck, BookOpen } from 'lucide-react';

interface SetGridProps {
  npConfig: DeckConfig;
  sets: SetMetadata[];
  setStats: Record<string, any>;
  onBack: () => void;
  onStartSet: (setId: string) => void;
}

export const SetGrid: React.FC<SetGridProps> = ({ npConfig, sets, setStats, onBack, onStartSet }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const renderHeaderLogo = (id: DeckId) => {
    switch (id) {
      case 'NP1': return <Waves size={36} strokeWidth={2.5} />;
      case 'NP2': return <HeartPulse size={36} strokeWidth={2.5} />;
      case 'NP3': return <Activity size={36} strokeWidth={2.5} />;
      case 'NP4': return <Stethoscope size={36} strokeWidth={2.5} />;
      case 'NP5': return <Brain size={36} strokeWidth={2.5} />;
      case 'PHARM_LABS': return <Zap size={36} strokeWidth={2.5} />;
      case 'PRIO_DEL': return <ShieldCheck size={36} strokeWidth={2.5} />;
      default: return <BookOpen size={36} strokeWidth={2.5} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 animate-fade-in pb-32 relative min-h-screen">
      {/* Background Ambience */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[var(--accent-soft)] rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800/60 pb-8">
        <div className="flex flex-col gap-6">
          <button 
            onClick={onBack}
            className="self-start flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Modules
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)] flex-shrink-0">
              {renderHeaderLogo(npConfig.id)}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {npConfig.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium tracking-tight max-w-2xl text-pretty">
                {npConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle (Hidden on Mobile) */}
        <div className="hidden md:flex bg-white dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            title="List View"
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Grid/List Layout */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8"
        : "flex flex-col gap-4"
      }>
        {sets.map(set => (
          <SetCard 
            key={set.setId}
            set={set}
            stats={setStats[set.setId] || { total: 0, unseen: 0, learning: 0, mastered: 0 }}
            onStart={onStartSet}
            layout={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
