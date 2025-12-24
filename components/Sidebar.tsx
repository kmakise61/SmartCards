
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, WalletCards, Settings, HeartPulse, ChevronRight, ChevronLeft, BarChart2 } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  onOpenSettings, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flashcards', label: 'Flashcards', icon: WalletCards },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-darkcard/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand */}
      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 gap-3'}`}>
        <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-[var(--accent)]/30">
          <HeartPulse size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">PNLE <span className="text-[var(--accent)]">SmartCards</span></h1>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 py-6 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              title={isCollapsed ? item.label : undefined}
              className={`
                group w-full flex items-center h-12 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                ${isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'}
              `}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="flex-shrink-0"
              />
              {!isCollapsed && (
                <span className="font-bold text-sm">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <button 
          onClick={onOpenSettings}
          title={isCollapsed ? 'Settings' : undefined}
          className={`flex items-center h-12 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full ${isCollapsed ? 'justify-center' : 'px-4 space-x-3'}`}
        >
           <Settings size={20} className="flex-shrink-0" />
           {!isCollapsed && <span className="font-bold text-sm">Settings</span>}
        </button>

        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className={`flex items-center h-12 rounded-xl text-slate-400 hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all w-full group ${isCollapsed ? 'justify-center' : 'px-4 space-x-3'}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className="relative">
               {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>
            {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
