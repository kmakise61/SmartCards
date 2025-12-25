
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MasteryRecord, GradeStatus, MasteryStatus, LastSessionState, DeckId, CardEdit, FlashcardUI, DailyStats } from '../types';
import { db } from '../utils/db';
import { adaptCards } from '../utils/adaptCards';

interface ProgressContextType {
  allCards: FlashcardUI[]; // Merged source of truth
  progress: Record<string, MasteryRecord>;
  lastSession: LastSessionState | null;
  cardEdits: Record<string, CardEdit>;
  dailyStats: DailyStats;
  applyGrade: (cardId: string, grade: GradeStatus) => void;
  toggleFlag: (cardId: string) => void;
  saveCardEdit: (edit: CardEdit) => void;
  deleteCardEdit: (cardId: string) => void;
  setLastActive: (deckId: DeckId | null, setId: string | null, currentIndex?: number, masteryFilters?: MasteryStatus[]) => void;
  getStats: (cardIds: string[]) => { total: number; unseen: number; learning: number; mastered: number };
  getCardMastery: (seen: boolean, goodCount: number) => MasteryStatus;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, MasteryRecord>>({});
  const [cardEdits, setCardEdits] = useState<Record<string, CardEdit>>({});
  const [lastSession, setLastSession] = useState<LastSessionState | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats>({ date: '', count: 0, streak: 0 });
  const [loaded, setLoaded] = useState(false);

  // Initialize from IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        const [loadedProgress, loadedSession, loadedEdits, loadedStats] = await Promise.all([
          db.loadAllProgress(),
          db.loadSession(),
          db.loadCardEdits(),
          db.loadDailyStats()
        ]);
        
        setProgress(loadedProgress);
        setLastSession(loadedSession);
        setCardEdits(loadedEdits);
        if (loadedStats) {
          setDailyStats(loadedStats);
        }
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
      } finally {
        setLoaded(true);
      }
    };
    init();
  }, []);

  // Compute merged cards whenever edits or static data changes
  const allCards = useMemo(() => {
    const staticCards = adaptCards();
    return staticCards.map(card => {
      const edit = cardEdits[card.id];
      if (edit) {
        return {
          ...card,
          question: edit.question,
          answer: edit.answer,
          rationale: edit.rationale
        };
      }
      return card;
    });
  }, [cardEdits]);

  const getCardMastery = useCallback((seen: boolean, goodCount: number): MasteryStatus => {
    if (!seen) return 'unseen';
    return goodCount >= 1 ? 'mastered' : 'learning';
  }, []);

  const updateDailyStats = useCallback(() => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    setDailyStats(prev => {
      const newStats = { ...prev };
      
      // If first time or new day
      if (newStats.date !== today) {
        if (newStats.date) {
          const lastDate = new Date(newStats.date);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
             newStats.streak += 1; // Consecutive day
          } else if (diffDays > 1) {
             newStats.streak = 1; // Missed a day or more
          }
        } else {
          newStats.streak = 1; // First usage ever
        }
        
        newStats.date = today;
        newStats.count = 1; // Start count for today
      } else {
        newStats.count += 1; // Same day increment
      }
      
      db.saveDailyStats(newStats).catch(e => console.error("Failed to save daily stats", e));
      return newStats;
    });
  }, []);

  const applyGrade = useCallback((cardId: string, grade: GradeStatus) => {
    updateDailyStats(); // Trigger streak/count logic

    setProgress(prev => {
      const current = prev[cardId] || { seen: false, goodCount: 0, criticalCount: 0, lastGrade: null, updatedAt: 0, isFlagged: false };
      let newGoodCount = current.goodCount;
      let newCriticalCount = current.criticalCount || 0;

      if (grade === 'again') {
        newGoodCount = 0; // Reset progress on Again
        newCriticalCount += 1;
      } else if (grade === 'good') {
        newGoodCount += 1; // Increment immediately
      }

      const newRecord: MasteryRecord = {
        ...current, // Keep isFlagged and other existing data
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
  }, [updateDailyStats]);

  const toggleFlag = useCallback((cardId: string) => {
    setProgress(prev => {
      const current = prev[cardId] || { seen: false, goodCount: 0, criticalCount: 0, lastGrade: null, updatedAt: 0, isFlagged: false };
      const newRecord = { ...current, isFlagged: !current.isFlagged, updatedAt: Date.now() };
      
      db.saveCardProgress(cardId, newRecord).catch(e => console.error("Failed to save flag", e));
      
      return {
        ...prev,
        [cardId]: newRecord
      };
    });
  }, []);

  const saveCardEdit = useCallback((edit: CardEdit) => {
    setCardEdits(prev => ({ ...prev, [edit.id]: edit }));
    db.saveCardEdit(edit).catch(e => console.error("Failed to save edit", e));
  }, []);

  const deleteCardEdit = useCallback((cardId: string) => {
    setCardEdits(prev => {
      const newState = { ...prev };
      delete newState[cardId];
      return newState;
    });
    db.deleteCardEdit(cardId).catch(e => console.error("Failed to delete edit", e));
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
    <ProgressContext.Provider value={{ 
      allCards, // Exposed for app-wide use
      progress, 
      lastSession, 
      cardEdits,
      dailyStats,
      applyGrade, 
      toggleFlag, 
      saveCardEdit,
      deleteCardEdit,
      setLastActive, 
      getStats, 
      getCardMastery 
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
};