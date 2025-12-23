import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MasteryRecord, GradeStatus, MasteryStatus, LastSessionState, DeckId } from '../types';
import { db } from '../utils/db';

interface ProgressContextType {
  progress: Record<string, MasteryRecord>;
  lastSession: LastSessionState | null;
  applyGrade: (cardId: string, grade: GradeStatus) => void;
  setLastActive: (deckId: DeckId | null, setId: string | null, currentIndex?: number, masteryFilters?: MasteryStatus[]) => void;
  getStats: (cardIds: string[]) => { total: number; unseen: number; learning: number; mastered: number };
  getCardMastery: (seen: boolean, goodCount: number) => MasteryStatus;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, MasteryRecord>>({});
  const [lastSession, setLastSession] = useState<LastSessionState | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Initialize from IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        const [loadedProgress, loadedSession] = await Promise.all([
          db.loadAllProgress(),
          db.loadSession()
        ]);
        
        setProgress(loadedProgress);
        setLastSession(loadedSession);
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
      } finally {
        setLoaded(true);
      }
    };
    init();
  }, []);

  const getCardMastery = useCallback((seen: boolean, goodCount: number): MasteryStatus => {
    if (!seen) return 'unseen';
    return goodCount >= 1 ? 'mastered' : 'learning';
  }, []);

  const applyGrade = useCallback((cardId: string, grade: GradeStatus) => {
    setProgress(prev => {
      const current = prev[cardId] || { seen: false, goodCount: 0, criticalCount: 0, lastGrade: null, updatedAt: 0 };
      let newGoodCount = current.goodCount;
      let newCriticalCount = current.criticalCount || 0;

      if (grade === 'again') {
        newGoodCount = 0; // Reset progress on Again
        newCriticalCount += 1;
      } else if (grade === 'good') {
        newGoodCount += 1; // Increment immediately
      }
      // 'hard' keeps current goodCount but marks as seen/learning

      const newRecord: MasteryRecord = {
        seen: true,
        goodCount: newGoodCount,
        criticalCount: newCriticalCount,
        lastGrade: grade,
        updatedAt: Date.now()
      };

      // Save individually to DB (Fire and forget)
      db.saveCardProgress(cardId, newRecord).catch(e => console.error("Failed to save card progress", e));

      return {
        ...prev,
        [cardId]: newRecord
      };
    });
  }, []);

  const setLastActive = useCallback((deckId: DeckId | null, setId: string | null, currentIndex: number = 0, masteryFilters: MasteryStatus[] = []) => {
    const newSession: LastSessionState = { deckId, setId, currentIndex, masteryFilters, timestamp: Date.now() };
    setLastSession(newSession);
    db.saveSession(newSession).catch(e => console.error("Failed to save session", e));
  }, []);

  const getStats = useCallback((cardIds: string[]) => {
    const stats = { total: cardIds.length, unseen: 0, learning: 0, mastered: 0 };
    cardIds.forEach(id => {
      const record = progress[id];
      const mastery = getCardMastery(!!record?.seen, record?.goodCount || 0);
      stats[mastery]++;
    });
    return stats;
  }, [progress, getCardMastery]);

  if (!loaded) return null; // Or a loading spinner

  return (
    <ProgressContext.Provider value={{ progress, lastSession, applyGrade, setLastActive, getStats, getCardMastery }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
};