import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import TodayQueue from './pages/TodayQueue';
import Decks from './pages/Decks';
import CardEditor from './pages/CardEditor';
import TestMode from './pages/TestMode';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Page, UserSettings, Card } from './types';
import { mockQuestions } from './lib/mockData'; 
import { useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCards, useDecks } from './hooks/useData';

const AppContent: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  
  const { cards, loading: cardsLoading, updateCardSRS } = useCards();
  const { decks, loading: decksLoading, refreshDecks } = useDecks();

  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  
  const [localUser, setLocalUser] = useState<UserSettings>({
      name: 'Loading...',
      theme: 'dark',
      learningStyle: 'visual',
      cardsPerDay: 20,
      accessibility: { fontScale: 1, reduceMotion: false }
  });

  useEffect(() => {
      if(profile) {
          setLocalUser(prev => ({...prev, ...profile}));
      }
  }, [profile]);

  // Refresh decks when entering deck page or editor to ensure lists are up to date
  useEffect(() => {
      if (activePage === 'decks' || activePage === 'create-card') {
          refreshDecks();
      }
  }, [activePage]);

  if (authLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!user) {
    return <Login onLogin={() => {}} />; 
  }

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard';
      case 'today': return 'Today Queue';
      case 'decks': return 'My Decks';
      case 'create-card': return 'Card Editor';
      case 'test': return 'Practice Exam';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'PNLE SmartCards';
    }
  };

  const renderContent = () => {
    if (cardsLoading || decksLoading) {
        return <div className="flex h-full items-center justify-center text-text-muted">Loading your library...</div>;
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard cards={cards} decks={decks} onNavigate={setActivePage} />;
      case 'today':
        return <TodayQueue cards={cards} onUpdateCard={(c) => updateCardSRS(c.id, c)} />;
      case 'decks':
        return <Decks decks={decks} />;
      case 'create-card':
        return <CardEditor decks={decks} />;
      case 'test':
        return <TestMode questions={mockQuestions} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings user={localUser} onUpdateUser={setLocalUser} onLogout={signOut} />;
      default:
        return <Dashboard cards={cards} decks={decks} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative transition-colors duration-500">
      {/* 
         MODERN BACKGROUND SYSTEM 
         Removed "Blobs" for a more sophisticated Mesh Gradient feel 
      */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-accent/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <Sidebar 
        activePage={activePage} 
        onNavigate={(p) => { setActivePage(p); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMinimized={isSidebarMinimized}
        onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
      />

      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)}
          user={localUser} 
          onToggleTheme={toggleTheme}
          onLogout={signOut}
          title={getPageTitle()}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;