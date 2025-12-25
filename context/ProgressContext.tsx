
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MasteryRecord, GradeStatus, MasteryStatus, LastSessionState, DeckId, CardEdit, FlashcardUI, DailyStats } from '../types';
import { db, EnhancedDailyStats } from '../utils/db';
import { adaptCards } from '../utils/adaptCards';

interface ProgressContextType {
  allCards: FlashcardUI[];
  progress: Record<string, MasteryRecord>;
  lastSession: LastSessionState | null;
  cardEdits: Record<string, CardEdit>;
  dailyStats: EnhancedDailyStats;
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
  const [dailyStats, setDailyStats] = useState<EnhancedDailyStats>({ date: '', count: 0, streak: 0, history: {} });
  const [loaded, setLoaded] = useState(false);

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
        if (loadedStats) setDailyStats(loadedStats);
      } catch (e) { console.error(e); } finally { setLoaded(true); }
    };
    init();
  }, []);

  const allCards = useMemo(() => {
    const staticCards = adaptCards();
    return staticCards.map(card => {
      const edit = cardEdits[card.id];
      return edit ? { ...card, question: edit.question, answer: edit.answer, rationale: edit.rationale } : card;
    });
  }, [cardEdits]);

  const getCardMastery = useCallback((seen: boolean, goodCount: number): MasteryStatus => {
    if (!seen) return 'unseen';
    return goodCount >= 1 ? 'mastered' : 'learning';
  }, []);

  const updateDailyStats = useCallback(() => {
    const today = new Date().toLocaleDateString('en-CA');
    setDailyStats(prev => {
      const newStats = { ...prev, history: { ...prev.history } };
      if (newStats.date !== today) {
        if (newStats.date) {
          const lastDate = new Date(newStats.date);
          const currentDate = new Date(today);
          const diffDays = Math.ceil(Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          newStats.streak = diffDays === 1 ? newStats.streak + 1 : 1;
        } else { newStats.streak = 1; }
        newStats.date = today;
        newStats.count = 1;
      } else { newStats.count += 1; }
      newStats.history[today] = (newStats.history[today] || 0) + 1;
      db.saveDailyStats(newStats).catch(console.error);
      return newStats;
    });
  }, []);

  const applyGrade = useCallback((cardId: string, grade: GradeStatus) => {
    updateDailyStats();
    setProgress(prev => {
      const current = prev[cardId] || { seen: false, goodCount: 0, criticalCount: 0, lastGrade: null, updatedAt: 0, isFlagged: false };
      let newGoodCount = current.goodCount;
      let newCriticalCount = current.criticalCount || 0;
      if (grade === 'again') { newGoodCount = 0; newCriticalCount += 1; } 
      else if (grade === 'good') { newGoodCount += 1; }
      const newRecord: MasteryRecord = { ...current, seen: true, goodCount: newGoodCount, criticalCount: newCriticalCount, lastGrade: grade, updatedAt: Date.now() };
      db.saveCardProgress(cardId, newRecord).catch(console.error);
      return { ...prev, [cardId]: newRecord };
    });
  }, [updateDailyStats]);

  const toggleFlag = useCallback((cardId: string) => {
    setProgress(prev => {
      const current = prev[cardId] || { seen: false, goodCount: 0, criticalCount: 0, lastGrade: null, updatedAt: 0, isFlagged: false };
      const newRecord = { ...current, isFlagged: !current.isFlagged, updatedAt: Date.now() };
      db.saveCardProgress(cardId, newRecord).catch(console.error);
      return { ...prev, [cardId]: newRecord };
    });
  }, []);

  const saveCardEdit = useCallback((edit: CardEdit) => {
    setCardEdits(prev => ({ ...prev, [edit.id]: edit }));
    db.saveCardEdit(edit).catch(console.error);
  }, []);

  const deleteCardEdit = useCallback((cardId: string) => {
    setCardEdits(prev => { const n = { ...prev }; delete n[cardId]; return n; });
    db.deleteCardEdit(cardId).catch(console.error);
  }, []);

  const setLastActive = useCallback((deckId: DeckId | null, setId: string | null, currentIndex: number = 0, masteryFilters: MasteryStatus[] = []) => {
    const ns: LastSessionState = { deckId, setId, currentIndex, masteryFilters, timestamp: Date.now() };
    setLastSession(ns);
    db.saveSession(ns).catch(console.error);
  }, []);

  const getStats = useCallback((cardIds: string[]) => {
    const s = { total: cardIds.length, unseen: 0, learning: 0, mastered: 0 };
    cardIds.forEach(id => {
      const record = progress[id];
      const m = getCardMastery(!!record?.seen, record?.goodCount || 0);
      s[m]++;
    });
    return s;
  }, [progress, getCardMastery]);

  if (!loaded) return null;

  return (
    <ProgressContext.Provider value={{ allCards, progress, lastSession, cardEdits, dailyStats, applyGrade, toggleFlag, saveCardEdit, deleteCardEdit, setLastActive, getStats, getCardMastery }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress error');
  return context;
};
