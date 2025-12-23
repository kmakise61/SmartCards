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
    <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-darkcard border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand */}
      <div className={`p-6 pb-4 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-glow">
          <HeartPulse size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in">
             <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">PNLE</h1>
             <span className="text-sm font-medium text-[var(--accent)]">SmartCards</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 px-3 py-4 space-y-2`}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              title={isCollapsed ? item.label : undefined}
              className={`
                w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                ${isCollapsed ? 'justify-center px-0' : 'space-x-3'}
              `}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
              {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className={`p-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2`}>
        <button 
          onClick={onOpenSettings}
          title={isCollapsed ? 'Settings' : undefined}
          className={`flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-full px-4 py-2 ${isCollapsed ? 'justify-center px-0' : 'space-x-3'}`}
        >
           <Settings size={20} className="flex-shrink-0" />
           {!isCollapsed && <span className="font-medium animate-fade-in">Settings</span>}
        </button>

        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors group"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Collapse</span>}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};