
import React from 'react';
import { SetMetadata, DeckConfig, DeckId } from '../types';
import { SetCard } from './SetCard';
import { ArrowLeft, LayoutGrid, Stethoscope, Activity, HeartPulse, Brain, Waves, Zap, ShieldCheck } from 'lucide-react';

interface SetGridProps {
  npConfig: DeckConfig;
  sets: SetMetadata[];
  setStats: Record<string, any>;
  onBack: () => void;
  onStartSet: (setId: string) => void;
}

export const SetGrid: React.FC<SetGridProps> = ({ npConfig, sets, setStats, onBack, onStartSet }) => {
  const renderHeaderLogo = (id: DeckId) => {
    switch (id) {
      case 'NP1': return <Waves size={32} />;
      case 'NP2': return <HeartPulse size={32} />;
      case 'NP3': return <Activity size={32} />;
      case 'NP4': return <Stethoscope size={32} />;
      case 'NP5': return <Brain size={32} />;
      case 'PHARM_LABS': return <Zap size={32} />;
      case 'PRIO_DEL': return <ShieldCheck size={32} />;
      default: return <span className="text-2xl font-black">{id}</span>;
    }
  };

  const getBrandingClasses = (id: DeckId) => {
    if (id === 'PHARM_LABS') return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border-indigo-100 dark:border-indigo-800';
    if (id === 'PRIO_DEL') return 'bg-violet-50 dark:bg-violet-900/20 text-violet-500 border-violet-100 dark:border-violet-800';
    return 'bg-pink-50 dark:bg-pink-900/20 text-[var(--accent)] border-pink-100 dark:border-pink-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-fade-in pb-24 h-full overflow-y-auto">
      <div className="bg-white dark:bg-darkcard rounded-[3rem] p-8 md:p-14 border border-slate-100 dark:border-slate-800 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
          {renderHeaderLogo(npConfig.id)}
        </div>

        <button 
          onClick={onBack}
          className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest mb-10 shadow-lg shadow-[var(--accent-glow)] group z-20 relative"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO SELECTION
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 relative z-10">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center shadow-lg border-2 ${getBrandingClasses(npConfig.id)} transform -rotate-3 transition-transform hover:rotate-0 duration-500 flex-shrink-0`}>
            {renderHeaderLogo(npConfig.id)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {npConfig.id}: {npConfig.title.toUpperCase()}
              </h2>
              <span className="text-[var(--accent)] text-xs md:text-sm font-black uppercase tracking-[0.4em] pl-1 opacity-80">
                Learning Module | Learning Paths
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium max-w-2xl leading-relaxed mt-6 border-l-4 border-[var(--accent)]/20 pl-6 py-1">
              {npConfig.description}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-inner flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[var(--accent)] shadow-sm">
              <LayoutGrid size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-700 dark:text-slate-200 leading-none">{sets.length}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paths</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {sets.map(set => (
            <SetCard 
              key={set.setId}
              set={set}
              stats={setStats[set.setId] || { total: 0, unseen: 0, learning: 0, mastered: 0 }}
              onStart={onStartSet}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
