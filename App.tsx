import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Flashcards } from './pages/Flashcards';
import { Analytics } from './pages/Analytics';
import { ViewState, AccentPreset, MasteryStatus, DeckId } from './types';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ProgressProvider } from './context/ProgressContext';
import { X, Check, LayoutDashboard, WalletCards, BarChart2, Download, Upload, AlertCircle, Share2 } from 'lucide-react';
import { db } from './utils/db';

const SettingsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const accentOptions: { id: AccentPreset; label: string; color: string }[] = [
    { id: 'pink', label: 'Pink', color: '#F472B6' },
    { id: 'rose', label: 'Rose', color: '#FB7185' },
    { id: 'violet', label: 'Violet', color: '#A78BFA' },
    { id: 'cyan', label: 'Cyan', color: '#22D3EE' },
  ];

  const handleExport = async () => {
    try {
      const json = await db.exportBackup();
      const filename = `pnle_smartcards_backup_${new Date().toISOString().split('T')[0]}.json`;
      const file = new File([json], filename, { type: 'application/json' });

      // Use Native Share API if available (Mobile/Tablet)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'PNLE SmartCards Backup',
            text: 'Here is my study progress backup.',
          });
          return;
        } catch (shareError) {
          // Fallback if user cancels share or error occurs
          console.log('Share cancelled or failed, falling back to download');
        }
      }

      // Fallback: Standard Download (Desktop)
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to create backup.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await db.importBackup(text);
      setImportStatus('success');
      setTimeout(() => {
        window.location.reload(); // Reload to reflect changes in context
      }, 1500);
    } catch (e) {
      console.error("Import failed", e);
      setImportStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs md:max-w-sm bg-white dark:bg-darkcard h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accent Color</h3>
            <div className="grid grid-cols-2 gap-3">
              {accentOptions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={settings.softMode}
                  onClick={() => updateSettings({ accent: opt.id })}
                  className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all ${
                    !settings.softMode && settings.accent === opt.id 
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  } ${settings.softMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: opt.color }}>
                    {!settings.softMode && settings.accent === opt.id && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Study Preferences</h3>
            
            <label className="flex items-center justify-between p-1 cursor-pointer">
              <span className="text-xs font-semibold">Soft Mode</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.softMode} 
                  onChange={(e) => updateSettings({ softMode: e.target.checked })}
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-1 cursor-pointer">
              <span className="text-xs font-semibold">Auto-advance</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoAdvance} 
                  onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-1 cursor-pointer">
              <span className="text-xs font-semibold">Keyboard hints</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showKeyboardHints} 
                  onChange={(e) => updateSettings({ showKeyboardHints: e.target.checked })}
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </div>
            </label>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Data Management</h3>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group"
                >
                   <div className="flex flex-col items-start">
                      <span className="text-xs font-bold">Sync / Backup</span>
                      <span className="text-[9px] text-slate-400">Share or Download JSON</span>
                   </div>
                   <div className="flex gap-2">
                      <Share2 size={18} className="text-slate-300 group-hover:text-[var(--accent)] transition-colors" />
                      <Download size={18} className="text-slate-300 group-hover:text-[var(--accent)] transition-colors" />
                   </div>
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden" 
                    accept=".json"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 transition-all group"
                  >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold">Restore Data</span>
                        <span className="text-[9px] text-slate-400">Import JSON backup</span>
                    </div>
                    <Upload size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                </div>

                {importStatus === 'success' && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                    <Check size={14} /> Restore successful! Reloading...
                  </div>
                )}
                {importStatus === 'error' && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                    <AlertCircle size={14} /> Invalid file format.
                  </div>
                )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [flashcardFilters, setFlashcardFilters] = useState<{ mastery?: MasteryStatus[], deckId?: DeckId, setId?: string } | undefined>(undefined);
  const [isResuming, setIsResuming] = useState(false);
  const [flashcardsKey, setFlashcardsKey] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const startSession = (filters?: { mastery?: MasteryStatus[], deckId?: DeckId, setId?: string }, resume = false) => {
    setFlashcardFilters(filters);
    setIsResuming(resume);
    setCurrentView('flashcards');
    setIsSidebarCollapsed(true);
    setFlashcardsKey(prev => prev + 1);
  };

  const handleViewChange = (view: ViewState) => {
    // Clear sub-view state and force component remount via key
    setFlashcardFilters(undefined);
    setIsResuming(false);
    setFlashcardsKey(prev => prev + 1);
    
    setCurrentView(view);
    
    // Always expand sidebar when navigating between main views to restore context
    setIsSidebarCollapsed(false);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onChangeView={handleViewChange} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Topbar 
          currentView={currentView}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-hidden relative">
          {currentView === 'dashboard' ? (
            <div className="h-full overflow-y-auto">
              <Dashboard onStartSession={startSession} />
            </div>
          ) : currentView === 'analytics' ? (
            <div className="h-full overflow-y-auto">
              <Analytics />
            </div>
          ) : (
            <Flashcards 
              key={flashcardsKey}
              initialFilters={flashcardFilters} 
              isFocusMode={isSidebarCollapsed} 
              onToggleFocus={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onResumeSession={isResuming}
              onExit={() => handleViewChange('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-darkcard/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 md:hidden flex items-center justify-around z-[110] px-6 shadow-lg">
          <button 
            onClick={() => handleViewChange('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === 'dashboard' ? 'text-[var(--accent)] scale-110' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Dash</span>
          </button>
          <button 
            onClick={() => handleViewChange('flashcards')}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === 'flashcards' ? 'text-[var(--accent)] scale-110' : 'text-slate-400'}`}
          >
            <WalletCards size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Cards</span>
          </button>
          <button 
            onClick={() => handleViewChange('analytics')}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === 'analytics' ? 'text-[var(--accent)] scale-110' : 'text-slate-400'}`}
          >
            <BarChart2 size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
               <img src="https://picsum.photos/seed/nurse/50" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Me</span>
          </button>
      </nav>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <ProgressProvider>
      <SettingsProvider>
        <MainContent />
      </SettingsProvider>
    </ProgressProvider>
  );
}

export default App;