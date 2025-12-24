
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Flashcards } from './pages/Flashcards';
import { Analytics } from './pages/Analytics';
import { ViewState, SessionFilters } from './types';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { X, Check, LayoutDashboard, WalletCards, BarChart2, Download, Upload, AlertCircle, Share2, HelpCircle, Cloud, Monitor, Smartphone, Volume2, Mic, Trash2, AlertTriangle, Palette, Plus, ChevronRight, RefreshCw, ArrowRight, PenTool } from 'lucide-react';
import { db } from './utils/db';
import { CustomSessionModal } from './components/CustomSessionModal';
import { GlobalSearch } from './components/GlobalSearch';

const ResetConfirmModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
  const [input, setInput] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-darkcard rounded-3xl p-8 shadow-2xl border border-rose-200 dark:border-rose-900 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-500 mb-2">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Reset All Progress?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This will permanently delete all your mastery data, flashcard history, and saved sessions. This action cannot be undone.
          </p>
          
          <div className="w-full pt-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Type "RESET" to confirm
            </label>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold outline-none focus:border-rose-500 transition-colors uppercase"
              placeholder="RESET"
            />
          </div>

          <div className="flex gap-3 w-full mt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={input !== 'RESET'}
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-500/30"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SyncHelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-darkcard rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud size={24} className="text-[var(--accent)]" /> Sync Guide
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">On Source Device (e.g. Phone)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tap <strong>Backup Data</strong>. On mobile, choose "Save to Files" or "Drive". On PC, it will download a <code>.json</code> file containing your stats, settings, and <strong>custom edits</strong>.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Transfer File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ensure the file is accessible on your target device (e.g., via iCloud Drive, Google Drive, or Email).
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">On Target Device (e.g. Laptop)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Open Settings and tap <strong>Restore Data</strong>. Select the file you just saved. Your entire profile will sync instantly!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-8 text-[var(--accent)] opacity-50">
           <Smartphone size={24} /> 
           <ArrowRight size={20} className="animate-pulse" />
           <Cloud size={24} />
           <ArrowRight size={20} className="animate-pulse" />
           <Monitor size={24} />
        </div>
      </div>
    </div>
  );
};

const SettingsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const { cardEdits } = useProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSyncHelpOpen, setIsSyncHelpOpen] = useState(false);

  const editCount = Object.keys(cardEdits).length;

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("This is a preview of the selected voice.");
      if (settings.voiceURI) {
        const selected = voices.find(v => v.voiceURI === settings.voiceURI);
        if (selected) utterance.voice = selected;
      }
      utterance.rate = settings.speechRate || 1.1;
      utterance.pitch = settings.speechPitch || 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResetProgress = async () => {
    await db.clearProgress();
    window.location.reload();
  };

  const presets = [
    { label: 'Pink', color: '#F472B6' },
    { label: 'Rose', color: '#FB7185' },
    { label: 'Violet', color: '#A78BFA' },
    { label: 'Cyan', color: '#22D3EE' },
    { label: 'Emerald', color: '#34D399' },
    { label: 'Orange', color: '#FB923C' },
    { label: 'Blue', color: '#60A5FA' },
    { label: 'Indigo', color: '#818CF8' },
  ];

  const handleExport = async () => {
    try {
      const json = await db.exportBackup();
      const filename = `pnle_smartcards_backup_${new Date().toISOString().split('T')[0]}.json`;
      const file = new File([json], filename, { type: 'application/json' });

      updateSettings({ lastBackupDate: Date.now() });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'PNLE SmartCards Backup',
            text: 'Save this file to iCloud Drive or Google Drive to sync with other devices.',
          });
          return;
        } catch (shareError) {
          console.log('Share cancelled or failed, falling back to download');
        }
      }

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
        window.location.reload();
      }, 1500);
    } catch (e) {
      console.error("Import failed", e);
      setImportStatus('error');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[110] flex justify-end font-sans">
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-xs md:max-w-sm bg-white dark:bg-darkcard h-full shadow-2xl flex flex-col animate-slide-in-right">
          
          {/* Minimalist Header */}
          <div className="flex items-center justify-between px-8 py-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Settings</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-10 no-scrollbar">
            
            {/* Appearance Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Appearance</h3>
              
              <div className={`grid grid-cols-5 gap-4 mb-2 ${settings.softMode ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                {presets.map((p) => (
                  <button
                    key={p.color}
                    onClick={() => updateSettings({ accent: p.color })}
                    className="aspect-square rounded-full transition-all hover:scale-110 flex items-center justify-center relative group"
                    style={{ backgroundColor: p.color }}
                    title={p.label}
                  >
                    {settings.accent.toLowerCase() === p.color.toLowerCase() && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                ))}
                
                {/* Custom Color */}
                <div className="relative aspect-square rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <input 
                    type="color" 
                    value={settings.accent}
                    onChange={(e) => updateSettings({ accent: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Plus size={16} className="text-slate-400 dark:text-slate-500" />
                  {!presets.some(p => p.color.toLowerCase() === settings.accent.toLowerCase()) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)] pointer-events-none">
                       <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                 {!presets.some(p => p.color.toLowerCase() === settings.accent.toLowerCase()) && (
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{settings.accent}</span>
                 )}
              </div>
            </section>

            {/* Preferences Section (Clean Rows) */}
            <section className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Experience</h3>
              
              <label className="flex items-center justify-between py-3 cursor-pointer group">
                <div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors block">Soft Mode</span>
                    <span className="text-[10px] text-slate-400 font-medium">Teal theme for eye comfort</span>
                </div>
                <div className="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.softMode} 
                    onChange={(e) => updateSettings({ softMode: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </div>
              </label>

              <label className="flex items-center justify-between py-3 cursor-pointer group">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Auto-advance Cards</span>
                <div className="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoAdvance} 
                    onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </div>
              </label>
            </section>

            {/* Audio Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audio</h3>
                <button onClick={handleTestSpeech} className="text-[10px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
                  Test Voice
                </button>
              </div>

              <div className="relative">
                <select 
                  className="w-full p-3 pl-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all cursor-pointer"
                  value={settings.voiceURI || ''}
                  onChange={(e) => updateSettings({ voiceURI: e.target.value })}
                >
                  <option value="">Default System Voice</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14} />
              </div>

              <div className="space-y-4 px-1">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Speed</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                  />
                  <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{settings.speechRate}x</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Pitch</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={settings.speechPitch}
                    onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                  />
                  <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{settings.speechPitch}x</span>
                </div>
              </div>
            </section>

            {/* Data Section (Minimal List) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Management</h3>
                <button 
                  onClick={() => setIsSyncHelpOpen(true)} 
                  className="text-[var(--accent)] bg-[var(--accent-soft)] p-1 rounded-md hover:bg-[var(--accent)] hover:text-white transition-colors"
                  title="How to Sync?"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              
              <div className="space-y-2">
                  <button 
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
                  >
                    <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Backup Data</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400">
                            {settings.lastBackupDate 
                              ? `Last saved: ${new Date(settings.lastBackupDate).toLocaleDateString()}` 
                              : 'Save progress to file'}
                          </span>
                          {editCount > 0 && (
                            <span className="text-[9px] font-bold text-[var(--accent)] flex items-center gap-1 mt-0.5">
                              <PenTool size={10} /> Includes {editCount} custom edits
                            </span>
                          )}
                        </div>
                    </div>
                    <Share2 size={18} className="text-slate-300 group-hover:text-[var(--accent)] transition-colors" />
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
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
                    >
                      <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Restore Data</span>
                          <span className="text-[10px] text-slate-400">Load progress & edits from file</span>
                      </div>
                      <Upload size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  </div>

                  {importStatus === 'success' && (
                    <div className="px-4 py-2 text-[10px] font-bold text-emerald-500 flex items-center gap-2">
                      <Check size={12} /> Restore successful! Reloading...
                    </div>
                  )}
                  {importStatus === 'error' && (
                    <div className="px-4 py-2 text-[10px] font-bold text-rose-500 flex items-center gap-2">
                      <AlertCircle size={12} /> Invalid file format.
                    </div>
                  )}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIsResetOpen(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} /> Reset All Progress
              </button>
            </section>

          </div>
        </div>
      </div>
      <ResetConfirmModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleResetProgress} />
      <SyncHelpModal isOpen={isSyncHelpOpen} onClose={() => setIsSyncHelpOpen(false)} />
    </>
  );
};

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCustomSessionOpen, setIsCustomSessionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [flashcardFilters, setFlashcardFilters] = useState<SessionFilters | undefined>(undefined);
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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const startSession = (filters?: SessionFilters, resume = false) => {
    setFlashcardFilters(filters);
    setIsResuming(resume);
    setCurrentView('flashcards');
    setIsSidebarCollapsed(true);
    setFlashcardsKey(prev => prev + 1);
  };

  const handleCustomSessionStart = (cardIds: string[]) => {
    startSession({ cardIds });
  };

  const handleSearchSelect = (cardId: string) => {
    startSession({ cardIds: [cardId] });
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
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-hidden relative">
          {currentView === 'dashboard' ? (
            <div className="h-full overflow-y-auto">
              <Dashboard 
                onStartSession={startSession} 
                onOpenCustomSession={() => setIsCustomSessionOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            </div>
          ) : currentView === 'analytics' ? (
            <div className="h-full overflow-y-auto">
              <Analytics onStartSession={startSession} />
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
      </nav>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <CustomSessionModal 
        isOpen={isCustomSessionOpen} 
        onClose={() => setIsCustomSessionOpen(false)} 
        onStart={handleCustomSessionStart} 
      />

      <GlobalSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCard={handleSearchSelect}
      />
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
