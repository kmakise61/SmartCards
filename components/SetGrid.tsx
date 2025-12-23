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
      case 'NP1': return <Waves size={48} strokeWidth={1.5} />;
      case 'NP2': return <HeartPulse size={48} strokeWidth={1.5} />;
      case 'NP3': return <Activity size={48} strokeWidth={1.5} />;
      case 'NP4': return <Stethoscope size={48} strokeWidth={1.5} />;
      case 'NP5': return <Brain size={48} strokeWidth={1.5} />;
      case 'PHARM_LABS': return <Zap size={48} strokeWidth={1.5} />;
      case 'PRIO_DEL': return <ShieldCheck size={48} strokeWidth={1.5} />;
      default: return <span className="text-4xl font-black">{id}</span>;
    }
  };

  return (
    <div className="h-full bg-[#F8FAFC] dark:bg-darkbg overflow-hidden flex flex-col relative">
      {/* Ambient background for glassmorphism */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-soft)] rounded-full blur-[100px] -z-10 opacity-60 pointer-events-none" />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 lg:p-12 scroll-smooth">
        <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 pb-32">
          
          {/* HERO CARD (Glassmorphism) */}
          <div className="relative rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl overflow-hidden group
            bg-white/60 dark:bg-darkcard/60 backdrop-blur-2xl border border-white/40 dark:border-white/5
          ">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-bl from-[var(--accent)]/10 to-transparent rounded-bl-full -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-8 md:gap-10">
              
              {/* Top Navigation Row */}
              <div className="flex justify-between items-start">
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 md:gap-3 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 pl-4 pr-6 py-3 md:py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 group/btn backdrop-blur-sm border border-white/50 dark:border-white/10"
                >
                  <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                  Back to Selection
                </button>

                {/* Tablet/Desktop Badge */}
                <div className="hidden md:flex bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 px-5 py-3 rounded-2xl items-center gap-3 backdrop-blur-sm">
                   <LayoutGrid size={18} className="text-slate-400" />
                   <div className="flex flex-col items-end leading-none">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{sets.length}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Paths</span>
                   </div>
                </div>
              </div>

              {/* Content Row */}
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                
                {/* Icon */}
                <div className="w-20 h-20 md:w-32 md:h-32 bg-[var(--accent-soft)] rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-[var(--accent)] shadow-inner border border-[var(--accent)]/10 shrink-0 backdrop-blur-sm">
                  {renderHeaderLogo(npConfig.id)}
                </div>

                {/* Text */}
                <div className="flex-1 space-y-4 md:space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-lg backdrop-blur-sm">Learning Module</span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                      <span className="px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[var(--accent)]/20 backdrop-blur-sm">Validation Paths</span>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1] tracking-tighter uppercase break-words drop-shadow-sm">
                      <span className="text-[var(--accent)]">{npConfig.id}:</span> <br className="hidden lg:block" />
                      {npConfig.title}
                    </h1>
                  </div>

                  <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
                    {npConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
    </div>
  );
};