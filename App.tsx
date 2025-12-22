// App.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import DeckGrid from './components/library/DeckGrid';
import DeckBuilder from './components/library/DeckBuilder';
import StudySession from './components/study/StudySession';
import Browser from './components/library/Browser';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import QuizModule from './components/quiz/QuizModule';
import { RouteName, Deck, Flashcard } from './types';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import { BookOpen, X, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isDark, isCrescere } = useTheme();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [currentRoute, setCurrentRoute] = useState<RouteName>('Dashboard');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState<'standard' | 'quick-fire' | 'drill'>('standard');
  const [isBuildingDeck, setIsBuildingDeck] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | undefined>(undefined);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(undefined);
  const [drillCards, setDrillCards] = useState<Flashcard[]>([]); 
  const [focusMode, setFocusMode] = useState(false);

  const [showManuals, setShowManuals] = useState(false);
  const [isTabletOrBelow, setIsTabletOrBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsTabletOrBelow(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const sidebarOffsetClass = useMemo(() => {
    if (focusMode) return '';
    if (isTabletOrBelow) return 'lg:ml-0';
    return isSidebarMinimized ? 'lg:ml-20' : 'lg:ml-64';
  }, [focusMode, isTabletOrBelow, isSidebarMinimized]);

  const getBackgroundClass = () => {
    if (isCrescere) return 'bg-[#000000]';
    if (isDark) return 'bg-[#0A0F1C]';
    return 'bg-[#F8FAFC]';
  };

  const handleDeckSelection = (deck: Deck) => {
    setActiveDeckId(deck.id);
    setStudyMode('standard');
    setDrillCards([]);
    setIsStudying(true);
  };

  const handleCreateDeck = () => {
    setEditingDeckId(undefined);
    setIsBuildingDeck(true);
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeckId(deck.id);
    setIsBuildingDeck(true);
  };

  const handleStartSession = () => {
    setActiveDeckId(undefined);
    setStudyMode('standard');
    setDrillCards([]);
    setIsStudying(true);
  };

  const handleQuickFire = () => {
    setActiveDeckId(undefined);
    setStudyMode('quick-fire');
    setDrillCards([]);
    setIsStudying(true);
  };

  const handleStartDrill = (cards: Flashcard[]) => {
      setDrillCards(cards);
      setStudyMode('drill');
      setActiveDeckId(undefined);
      setIsStudying(true);
  };

  const renderContent = () => {
    if (isStudying) {
      return (
        <StudySession
          deckId={activeDeckId}
          mode={studyMode}
          drillCards={drillCards}
          onExit={() => setIsStudying(false)}
          toggleFocusMode={setFocusMode}
        />
      );
    }

    if (isBuildingDeck) {
      return <DeckBuilder deckId={editingDeckId} onClose={() => setIsBuildingDeck(false)} />;
    }

    switch (currentRoute) {
      case 'Dashboard':
        return (
          <Dashboard
            onStartSession={handleStartSession}
            onQuickFire={handleQuickFire}
            onBrowse={() => setCurrentRoute('My Decks')}
            onOpenManuals={() => setShowManuals(true)}
            onViewAnalytics={() => setCurrentRoute('Analytics')}
          />
        );
      case 'My Decks':
        return (
          <div className="space-y-6">
            <DeckGrid onSelectDeck={handleDeckSelection} onCreateDeck={handleCreateDeck} onEditDeck={handleEditDeck} />
            <div className="border-t border-slate-500/10 pt-6">
              <Browser />
            </div>
          </div>
        );
      case 'Quizzes':
        return <QuizModule />;
      case 'Analytics':
        return <AnalyticsPage onStartDrill={handleStartDrill} />;
      default:
        return null;
    }
  };

  // Auth Loading State
  if (authLoading) {
      return (
          <div className={`h-screen w-full flex items-center justify-center ${getBackgroundClass()}`}>
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
      );
  }

  // Not Logged In
  if (!currentUser) {
      return <AuthPage />;
  }

  // Authenticated App
  return (
    <DataProvider uid={currentUser.uid}>
        <div className={`h-screen w-full overflow-hidden transition-colors duration-500 ease-in-out font-sans ${getBackgroundClass()}`}>
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
            className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${
                isCrescere ? 'from-zinc-900/20 to-black' : isDark ? 'from-indigo-900/10 to-transparent' : 'from-rose-50/50 to-transparent'
            }`}
            />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-10 bg-accent animate-blob" />
        </div>

        <div className="flex">
            {!focusMode && (
            <Sidebar
                currentRoute={currentRoute}
                onNavigate={(route) => {
                setCurrentRoute(route);
                setIsStudying(false);
                setIsBuildingDeck(false);
                }}
                isMinimized={isSidebarMinimized}
                toggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
                isMobileOpen={isMobileMenuOpen}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
            />
            )}

            <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${sidebarOffsetClass}`}>
            <div className={`transition-all duration-300 flex-none ${focusMode ? '-translate-y-16' : 'translate-y-0'}`}>
                <TopBar 
                    currentRoute={currentRoute} 
                    openMobileMenu={() => setIsMobileMenuOpen(true)}
                    user={{
                        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Nurse',
                        email: currentUser.email || '',
                        title: 'RN Candidate',
                        avatarUrl: currentUser.photoURL || ''
                    }}
                />
            </div>

            <main className={`flex-1 overflow-y-auto custom-scrollbar ${isStudying ? '' : 'p-4 md:p-6 lg:p-8'}`}>
                <div className="w-full">{renderContent()}</div>
            </main>
            </div>
        </div>

        {showManuals && (
            <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-lg p-8 rounded-xl shadow-2xl relative ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}>
                <button onClick={() => setShowManuals(false)} className="absolute top-4 right-4 p-2 opacity-40 hover:opacity-100 transition-opacity">
                <X size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
                </button>
                <div className="flex flex-col items-center text-center gap-5">
                <div className="p-4 rounded-xl bg-accent/10 text-accent">
                    <BookOpen size={40} />
                </div>
                <div className="space-y-1">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Study Manuals</h2>
                    <p className={`text-sm opacity-60 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Digitized PDF reviewers for PNLE modules are currently in development. A download link will appear here soon.
                    </p>
                </div>
                <button
                    onClick={() => setShowManuals(false)}
                    className="w-full py-3 rounded-lg bg-accent text-white font-bold text-sm uppercase tracking-widest mt-2 hover:brightness-110 active:scale-95 transition-all"
                >
                    Understood
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ThemeProvider>
  );
};

export default App;