import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, LogOut, Settings as SettingsIcon, Palette, Check, Monitor, Moon, Sun, BrainCircuit } from 'lucide-react';
import { RouteName, UserProfile, ThemeMode, AccentColor } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import StudySettingsModal from './StudySettingsModal';

interface TopBarProps {
  currentRoute: RouteName;
  openMobileMenu: () => void;
  user?: UserProfile;
}

type DropdownPos = { top: number; right: number };

function useDropdownPosition(anchorRef: React.RefObject<HTMLElement>, open: boolean) {
  const [pos, setPos] = useState<DropdownPos>({ top: 0, right: 0 });

  useEffect(() => {
    if (!open) return;

    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 10;
      const top = rect.bottom + gap;
      const right = Math.max(10, window.innerWidth - rect.right);
      setPos({ top, right });
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);

    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [anchorRef, open]);

  return pos;
}

const TopBar: React.FC<TopBarProps> = ({ currentRoute, openMobileMenu, user }) => {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const { stats, resetData } = useData();
  const { logout } = useAuth();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showStudySettings, setShowStudySettings] = useState(false);

  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);

  const themePos = useDropdownPosition(themeBtnRef, showThemeDropdown);
  const profilePos = useDropdownPosition(profileBtnRef, showProfileDropdown);

  const accents: { id: AccentColor; label: string; color: string }[] = useMemo(
    () => [
      { id: 'rose', label: 'Rose', color: 'bg-pink-500' },
      { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
      { id: 'gold', label: 'Gold', color: 'bg-amber-500' },
      { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
      { id: 'violet', label: 'Violet', color: 'bg-violet-500' },
    ],
    []
  );

  const activeAccentLabel = accents.find(a => a.id === accent)?.label || 'Rose';

  const getAccentLabelStyle = () => {
    if (accent === 'rose') return 'text-pink-600 dark:text-pink-400';
    return 'text-accent';
  };

  const modes: { id: ThemeMode; label: string; icon: any }[] = useMemo(
    () => [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'midnight', label: 'Deep', icon: Monitor },
    ],
    []
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowThemeDropdown(false);
        setShowProfileDropdown(false);
        setShowStudySettings(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = async () => {
      try {
          await logout();
      } catch (error) {
          console.error("Logout failed", error);
      }
  };

  const ThemeDropdownPortal = showThemeDropdown
    ? createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowThemeDropdown(false)} />
          <div
            className={[
              'fixed z-[9999] w-72 p-5',
              'glass-panel',
              'border border-border-color/70',
              'rounded-2xl',
              'shadow-[0_24px_90px_-45px_rgba(0,0,0,0.75)]',
              'animate-in fade-in slide-in-from-top-1',
            ].join(' ')}
            style={{ top: themePos.top, right: themePos.right }}
            role="menu"
          >
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 text-text-primary">
                  Workspace Mode
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTheme(m.id)}
                      className={[
                        'rounded-2xl p-3 border-2 transition-all',
                        'flex flex-col items-center justify-center gap-2',
                        theme === m.id
                          ? 'border-accent bg-accent/10 text-text-primary'
                          : 'border-transparent bg-white/5 hover:bg-white/10 text-text-secondary',
                      ].join(' ')}
                    >
                      <m.icon size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-text-primary">
                    Accent Color
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${getAccentLabelStyle()}`}>
                        {activeAccentLabel}
                    </span>
                </div>
                <div className="flex justify-between p-1 rounded-2xl bg-black/10 border border-white/5">
                  {accents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAccent(a.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-105 ${a.color}`}
                      aria-label={`Set accent ${a.id}`}
                    >
                      {accent === a.id && <Check size={14} className="text-white" strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  const ProfileDropdownPortal = showProfileDropdown
    ? createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowProfileDropdown(false)} />
          <div
            className={[
              'fixed z-[9999] w-64 overflow-hidden',
              'glass-panel',
              'border border-border-color/70',
              'rounded-2xl',
              'shadow-[0_24px_90px_-45px_rgba(0,0,0,0.75)]',
              'animate-in fade-in slide-in-from-top-1',
            ].join(' ')}
            style={{ top: profilePos.top, right: profilePos.right }}
            role="menu"
          >
            <div className="p-4 border-b border-border-color/70 bg-accent/5">
              <p className="text-[11px] font-black tracking-widest uppercase text-text-primary truncate">
                {user?.name || 'Guest'}
              </p>
              <p className="text-[8px] uppercase font-bold opacity-30 mt-1 text-text-primary truncate">
                {user?.email || 'Authorized Candidate'}
              </p>
            </div>
            <div className="p-1 space-y-1">
              <button onClick={() => setShowStudySettings(true)} className="w-full flex items-center gap-3 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors text-text-secondary hover:bg-white/5">
                <SettingsIcon size={14} /> Preferences
              </button>
              
              <button
                onClick={resetData}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors text-red-500 hover:bg-red-500/10"
              >
                <Monitor size={14} /> Wipe Data
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors text-text-primary hover:bg-white/5 border-t border-white/5 mt-1"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <header
        className={[
          'w-full h-14 md:h-16 px-4 md:px-6 flex items-center justify-between',
          'glass-panel',
          'border-x-0 border-t-0 border-b border-border-color/70',
          'shadow-[0_18px_60px_-35px_rgba(0,0,0,0.6)]',
          'relative z-[200]',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={openMobileMenu}
            className={[
              'lg:hidden',
              'w-10 h-10 rounded-2xl',
              'border border-border-color/70',
              'glass-panel',
              'flex items-center justify-center',
              'text-text-secondary hover:text-text-primary',
              'hover:border-accent/40 hover:bg-accent/10',
              'transition-all',
            ].join(' ')}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-text-primary">
            {currentRoute}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {stats.cardsDue > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest bg-accent/5 border-accent/20 text-accent">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              {stats.cardsDue} Due
            </div>
          )}

          <div className="h-4 w-px bg-border-color/80 mx-1 hidden sm:block" />

          {/* New Study Settings Button */}
          <button 
            onClick={() => setShowStudySettings(true)}
            className="w-10 h-10 rounded-2xl border border-border-color/70 glass-panel flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/10 transition-all"
            title="Study Settings"
          >
            <BrainCircuit size={18} />
          </button>

          {/* Visual Settings */}
          <button
            ref={themeBtnRef}
            onClick={() => {
              setShowThemeDropdown((v) => !v);
              setShowProfileDropdown(false);
            }}
            className={[
              'w-10 h-10 rounded-2xl',
              'border border-border-color/70',
              'glass-panel',
              'flex items-center justify-center',
              showThemeDropdown
                ? 'text-accent border-accent/40 bg-accent/10'
                : 'text-text-secondary hover:text-text-primary hover:border-accent/30 hover:bg-accent/10',
              'transition-all',
            ].join(' ')}
            aria-expanded={showThemeDropdown}
            aria-haspopup="menu"
            aria-label="Theme settings"
          >
            <Palette size={18} />
          </button>

          {/* Profile */}
          <button
            ref={profileBtnRef}
            onClick={() => {
              setShowProfileDropdown((v) => !v);
              setShowThemeDropdown(false);
            }}
            className={[
              'flex items-center gap-2',
              'h-10 pl-1 pr-2 rounded-2xl',
              'border border-border-color/70',
              'glass-panel',
              'hover:border-accent/30 hover:bg-white/5',
              'transition-all',
            ].join(' ')}
            aria-expanded={showProfileDropdown}
            aria-haspopup="menu"
            aria-label="Profile menu"
          >
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-2xl object-cover shadow-sm" />
            ) : (
                <div className="w-8 h-8 rounded-2xl bg-accent text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-accent/20">
                {user?.name?.charAt(0) || 'U'}
                </div>
            )}
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-text-secondary max-w-[80px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </button>
        </div>
      </header>

      {ThemeDropdownPortal}
      {ProfileDropdownPortal}
      <StudySettingsModal isOpen={showStudySettings} onClose={() => setShowStudySettings(false)} />
    </>
  );
};

export default TopBar;