import React from 'react';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  BrainCircuit,
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { Page } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const { themeMode, reduceMotion, fontSize } = useTheme();

  // SmartCards Specific Navigation - Removed Settings
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'today', label: 'Today Queue', icon: <BrainCircuit size={20} />, special: true }, // Highlighted
    { id: 'decks', label: 'My Decks', icon: <Layers size={20} /> },
    { id: 'create-card', label: 'Create Card', icon: <PlusCircle size={20} /> },
    { id: 'test', label: 'Test Mode', icon: <BookOpen size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
  ];

  const isDark = themeMode === 'dark';
  const isCrescere = themeMode === 'crescere';

  // --- DYNAMIC FONT SIZES ---
  const getNavTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-xs';
          case 'large': return 'text-sm';
          case 'extra-large': return 'text-base';
          default: return 'text-[13px]'; // Normal
      }
  };

  const getLogoTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-sm';
          case 'large': return 'text-lg';
          case 'extra-large': return 'text-xl';
          default: return 'text-base';
      }
  };

  const navTextClass = getNavTextSize();
  const logoTextClass = getLogoTextSize();

  // --- PREMIUM GLASS CONTAINER ---
  const sidebarContainerClass = isDark
    ? 'bg-[#0B1121]/80 backdrop-blur-[40px] border-r border-white/5 shadow-2xl'
    : 'bg-white/60 backdrop-blur-[40px] border-r border-white/40 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.05)]';

  const dur = reduceMotion ? 0 : 300;

  // --- DYNAMIC NAV ITEMS ---
  const getNavItemClass = (isActive: boolean, isSpecial?: boolean) => {
    const base = `relative flex items-center transition-all duration-${dur} ease-out font-bold select-none outline-none group w-full cursor-pointer min-h-[3rem] overflow-hidden`;
    // Optimized padding for narrower sidebar
    const layout = isMinimized 
        ? 'justify-center p-0 rounded-xl mx-auto w-10 h-10' 
        : 'justify-start px-3.5 py-2.5 rounded-xl mx-auto w-[92%] gap-3';

    let stateClasses = '';

    if (isSpecial) {
        // Special items (Today Queue) - Keep distinct
        if (isActive) {
             stateClasses = 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/30 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]';
        } else {
             stateClasses = 'text-accent hover:bg-accent/10';
        }
    } else {
        // Standard Items
        if (isActive) {
            stateClasses = isDark 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]'
                : 'bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10';
        } else {
            // Hover State
            stateClasses = isDark 
                ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80';
        }
    }

    return `${base} ${layout} ${stateClasses}`;
  };

  // --- LUXURY LOGO STYLES ---
  const companionGradient = isDark
    ? 'bg-gradient-to-r from-blue-300 via-indigo-200 to-violet-200' 
    : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500';

  // Logo Icon Background:
  const logoIconClass = isCrescere
    ? 'bg-gradient-to-br from-rose-400 to-amber-300 text-white shadow-lg shadow-rose-500/20'
    : 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 ring-1 ring-white/20';

  const handleLogoClick = () => {
    onNavigate('dashboard');
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:relative flex flex-col h-full
          ${sidebarContainerClass}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isMinimized ? 'lg:w-[4.5rem]' : 'lg:w-64'} 
          md:rounded-r-[2.5rem]
          w-[clamp(260px,80vw,18rem)]`}
      >
        {/* Minimize Toggle */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className={`hidden lg:flex absolute -right-3 top-10 w-6 h-6 rounded-full items-center justify-center z-[60] shadow-lg border transition-all active:scale-90 hover:scale-110
              ${isDark 
                ? 'bg-slate-800 border-white/10 text-slate-400 hover:text-white' 
                : 'bg-white border-slate-100 text-slate-400 hover:text-slate-800'}`}
          >
            {isMinimized ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        )}

        {/* --- LOGO HEADER --- */}
        <div className={`flex-none p-5 transition-all duration-300 ${isMinimized ? 'lg:p-0 lg:h-20 lg:flex lg:items-center lg:justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <button 
                onClick={handleLogoClick}
                className={`relative p-2.5 rounded-2xl shrink-0 overflow-hidden transition-transform hover:scale-105 active:scale-95 ${logoIconClass} ${isMinimized ? 'p-2' : ''}`}
                title="Go to Dashboard"
            >
              <GraduationCap size={isMinimized ? 20 : 22} className="relative z-10" />
              {/* Icon Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
            </button>
            
            <div 
                onClick={handleLogoClick}
                className={`flex flex-col justify-center min-w-0 transition-opacity duration-300 cursor-pointer ${isMinimized ? 'lg:hidden' : 'block'}`}
            >
                <h1 className={`font-black ${logoTextClass} leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  PNLE <br/>
                  <span className="flex items-center gap-1.5">
                    {/* PREMIUM GRADIENT TEXT */}
                    <span className={`${companionGradient} bg-clip-text text-transparent filter drop-shadow-sm`}>
                        SmartCards
                    </span>
                  </span>
                </h1>
            </div>
            <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* --- NAVIGATION LIST --- */}
        <nav className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2 space-y-1.5 ${isMinimized ? 'px-2' : 'px-3'}`}>
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as Page);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={getNavItemClass(isActive, item.special)}
                title={isMinimized ? item.label : ''}
              >
                {/* Active Indicator Glow (Left) - Only for standard items */}
                {isActive && !isMinimized && !item.special && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-primary shadow-[0_0_10px_rgb(var(--primary))]" />
                )}

                <span className={`relative z-10 flex items-center justify-center shrink-0 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                </span>
                
                <span className={`relative z-10 ${navTextClass} font-bold tracking-tight text-left transition-opacity duration-200 ${isMinimized ? 'lg:hidden' : 'block'}`}>
                  {item.label}
                </span>
                
                {/* Active Dot (Right) - For minimized state */}
                {isMinimized && isActive && (
                  <div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgb(var(--primary))]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;