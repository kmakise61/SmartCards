// SIDEBAR.tsx — refined (removed the distracting divider under "SmartCards")
// Focus: premium glass, NO hard separator line between brand and nav

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { RouteName } from '../types';

interface SidebarProps {
  currentRoute: RouteName;
  onNavigate: (route: RouteName) => void;
  isMinimized: boolean;
  toggleMinimize: () => void;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isMinimized,
  toggleMinimize,
  isMobileOpen,
  closeMobileMenu,
}) => {
  const [isTabletOrBelow, setIsTabletOrBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsTabletOrBelow(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen, closeMobileMenu]);

  useEffect(() => {
    if (!isTabletOrBelow || !isMobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isTabletOrBelow, isMobileOpen]);

  /* ---------- BRAND (no divider below) ---------- */
  const brand = (
    <div
      className={`flex-none h-14 md:h-16 flex items-center px-5 md:px-6 transition-all duration-300 ${
        isMinimized ? 'lg:justify-center lg:px-0' : ''
      }`}
    >
      <div className={`flex items-center ${isMinimized ? 'gap-0' : 'gap-3'}`}>
        <div className="relative p-2 rounded-xl bg-accent text-white shadow-lg shadow-accent/25">
          <GraduationCap size={22} />
          <div className="pointer-events-none absolute -inset-6 blur-2xl bg-accent/20 opacity-40" />
        </div>

        {!isMinimized && (
          <div className="flex flex-col leading-none">
            <span className="font-black text-lg tracking-tight text-text-primary">
              PNLE
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mt-1">
              SmartCards
            </span>
          </div>
        )}
      </div>
    </div>
  );

  /* ---------- NAV ---------- */
  const nav = (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
      {NAV_ITEMS.map((item) => {
        const isActive = currentRoute === item.name;

        return (
          <button
            key={item.name}
            onClick={() => {
              onNavigate(item.name);
              if (isTabletOrBelow) closeMobileMenu();
            }}
            className={[
              'group relative w-full flex items-center',
              'rounded-2xl px-4 py-3 transition-all duration-150',
              isMinimized ? 'lg:justify-center lg:px-0' : 'gap-3',
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
            ].join(' ')}
            title={isMinimized ? item.name : ''}
          >
            {/* subtle accent rail (only on active/hover) */}
            <span
              className={[
                'absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full transition-all',
                isActive
                  ? 'bg-accent opacity-100 shadow-lg shadow-accent/50'
                  : 'bg-accent/60 opacity-0 group-hover:opacity-40',
              ].join(' ')}
            />

            <div
              className={[
                'w-9 h-9 rounded-2xl flex items-center justify-center transition-all',
                isActive ? 'bg-accent/10' : 'group-hover:bg-white/5',
              ].join(' ')}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.8 : 2} />
            </div>

            {!isMinimized && (
              <span className="text-[11px] font-black uppercase tracking-[0.14em]">
                {item.name}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  /* ---------- DESKTOP ---------- */
  const desktopSidebar = (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-[250] hidden lg:flex flex-col h-full',
        'transition-all duration-300 ease-in-out',
        'glass-panel',
        'ring-1 ring-white/5',
        'shadow-[0_24px_80px_-30px_rgba(0,0,0,0.65)]',
        isMinimized ? 'w-20' : 'w-64',
      ].join(' ')}
    >
      <button
        onClick={toggleMinimize}
        className={[
          'absolute -right-3 top-10 w-7 h-7 rounded-full',
          'glass-panel border border-border-color/70',
          'flex items-center justify-center',
          'text-text-secondary hover:text-text-primary',
          'hover:bg-accent/10 hover:border-accent/40 transition-all',
          'z-[260]',
        ].join(' ')}
      >
        {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {brand}
      {nav}
    </aside>
  );

  /* ---------- MOBILE / TABLET ---------- */
  const drawer = (
    <>
      <div
        className={`fixed inset-0 z-[9996] bg-black/60 backdrop-blur-sm transition-opacity ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-[9997] w-72 max-w-[85vw]',
          'flex flex-col lg:hidden',
          'transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'glass-panel ring-1 ring-white/5',
          'shadow-[0_24px_120px_-40px_rgba(0,0,0,0.8)]',
        ].join(' ')}
      >
        <div className="relative">
          {brand}
          <button
            onClick={closeMobileMenu}
            className="absolute right-3 top-3 w-9 h-9 rounded-2xl glass-panel border border-border-color/70 flex items-center justify-center hover:bg-accent/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {nav}
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {isTabletOrBelow && createPortal(drawer, document.body)}
    </>
  );
};

export default Sidebar;
