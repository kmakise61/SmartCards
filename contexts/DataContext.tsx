import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    writeBatch, 
    onSnapshot,
    Timestamp,
    query
} from 'firebase/firestore';
import { db } from '../firebase';
import { Deck, Flashcard, StudyStats, Quiz, CardRating, ReviewLog, StudyPreferences, DashboardConfig } from '../types';
import { INITIAL_DECKS, INITIAL_STATS, INITIAL_QUIZZES, DEFAULT_PREFERENCES, TARGET_DATE } from '../constants';
import { SEEDED_CARDS } from '../data/nursing_db'; 
import { calculateNextSchedule } from '../utils/scheduler';
import { useGamification } from '../hooks/useGamification';

interface DataContextType {
  decks: Deck[];
  cards: Flashcard[];
  quizzes: Quiz[];
  stats: StudyStats;
  preferences: StudyPreferences;
  dashboardConfig: DashboardConfig;
  addDeck: (deck: Deck) => void;
  addCard: (card: Flashcard) => void;
  updateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  getCardsForDeck: (deckId: string) => Flashcard[];
  updateStats: (newStats: Partial<StudyStats>, incrementActivity?: boolean) => void;
  updatePreferences: (newPrefs: Partial<StudyPreferences>) => void;
  updateDashboardConfig: (config: Partial<DashboardConfig>) => void;
  resetData: () => void;
  deleteCard: (cardId: string) => void; 
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  deleteDeck: (deckId: string) => void;
  copyDeck: (deckId: string) => void;
  logReview: (cardId: string, rating: CardRating) => void;
  seedDatabase: () => Promise<void>; 
  isSeeding: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Config Generator
const getDefaultDashboardConfig = (): DashboardConfig => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const nextExamYear = TARGET_DATE.getFullYear();
    
    return {
        title: "Precision Board Review.",
        subtitle: `Locked in for ${month} ${year} — Ready for ${nextExamYear}.`,
        lastUpdated: Date.now()
    };
};

export const DataProvider: React.FC<{ children: ReactNode; uid: string }> = ({ children, uid }) => {
  const analytics = useGamification(uid);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [stats, setStats] = useState<StudyStats>(INITIAL_STATS);
  const [preferences, setPreferences] = useState<StudyPreferences>(DEFAULT_PREFERENCES);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(getDefaultDashboardConfig());
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasAttemptedAutoSeed, setHasAttemptedAutoSeed] = useState(false);

  // --- ACTIONS ---

  const seedDatabase = async () => {
      if (isSeeding) return;
      setIsSeeding(true);
      console.log("Starting Auto-Seeding...");
      try {
          const batch = writeBatch(db);
          
          // 1. Seed Decks
          INITIAL_DECKS.forEach(deck => {
              const ref = doc(db, `users/${uid}/decks/${deck.id}`);
              batch.set(ref, deck);
          });

          // 2. Seed Preferences
          const prefRef = doc(db, `users/${uid}/settings/preferences`);
          batch.set(prefRef, DEFAULT_PREFERENCES);
          
          // 3. Seed Dashboard Config
          const dashRef = doc(db, `users/${uid}/settings/dashboard`);
          batch.set(dashRef, getDefaultDashboardConfig());

          await batch.commit();

          // 4. Seed Cards (Chunked)
          const CHUNK_SIZE = 300; 
          for (let i = 0; i < SEEDED_CARDS.length; i += CHUNK_SIZE) {
              const chunk = SEEDED_CARDS.slice(i, i + CHUNK_SIZE);
              const cardBatch = writeBatch(db);
              chunk.forEach(card => {
                  const ref = doc(db, `users/${uid}/cards/${card.id}`);
                  cardBatch.set(ref, card);
              });
              await cardBatch.commit();
              console.log(`Seeded chunk ${i / CHUNK_SIZE + 1}`);
          }
          console.log("Seeding complete successfully.");
      } catch (e) {
          console.error("Seeding failed", e);
      } finally {
          setIsSeeding(false);
      }
  };

  // --- FIRESTORE SUBSCRIPTIONS ---

  // 1. Decks
  useEffect(() => {
      const q = collection(db, `users/${uid}/decks`);
      const unsub = onSnapshot(q, (snapshot) => {
          const loadedDecks: Deck[] = [];
          snapshot.forEach(doc => loadedDecks.push(doc.data() as Deck));
          setDecks(loadedDecks);
          
          // Auto-seed if empty and haven't tried yet
          if (loadedDecks.length === 0 && !hasAttemptedAutoSeed && !isSeeding && snapshot.metadata.hasPendingWrites === false) {
              setHasAttemptedAutoSeed(true);
              seedDatabase();
          }
      }, (error) => {
          console.error("Error fetching decks:", error);
      });
      return () => unsub();
  }, [uid]);

  // 2. Cards
  useEffect(() => {
      const q = collection(db, `users/${uid}/cards`);
      const unsub = onSnapshot(q, (snapshot) => {
          const loadedCards: Flashcard[] = [];
          snapshot.forEach(doc => loadedCards.push(doc.data() as Flashcard));
          setCards(loadedCards);
      }, (error) => {
          console.error("Error fetching cards:", error);
      });
      return () => unsub();
  }, [uid]);

  // 3. Settings
  useEffect(() => {
      const prefsRef = doc(db, `users/${uid}/settings/preferences`);
      const dashRef = doc(db, `users/${uid}/settings/dashboard`);

      const unsubPrefs = onSnapshot(prefsRef, (doc) => {
          if (doc.exists()) setPreferences(doc.data() as StudyPreferences);
      }, (error) => console.error("Error fetching prefs:", error));
      
      const unsubDash = onSnapshot(dashRef, (doc) => {
          if (doc.exists()) setDashboardConfig(doc.data() as DashboardConfig);
      }, (error) => console.error("Error fetching dashboard config:", error));

      return () => { unsubPrefs(); unsubDash(); };
  }, [uid]);

  // 4. Sync Analytics Hook to Stats State
  useEffect(() => {
      setStats(prev => ({
          ...prev,
          streakDays: analytics.streakDays,
          retentionRate: analytics.masteryPercentage,
          cardsLearned: analytics.totalLearned,
      }));
  }, [analytics]);

  // --- ACTIONS ---

  const addDeck = async (deck: Deck) => {
      await setDoc(doc(db, `users/${uid}/decks/${deck.id}`), deck);
  };

  const updateDeck = async (deckId: string, updates: Partial<Deck>) => {
      await updateDoc(doc(db, `users/${uid}/decks/${deckId}`), updates);
  };

  const deleteDeck = async (deckId: string) => {
      await deleteDoc(doc(db, `users/${uid}/decks/${deckId}`));
      const cardsToDelete = cards.filter(c => c.deckId === deckId);
      const batch = writeBatch(db);
      cardsToDelete.forEach(c => {
          batch.delete(doc(db, `users/${uid}/cards/${c.id}`));
      });
      await batch.commit();
  };

  const copyDeck = async (deckId: string) => {
      const originalDeck = decks.find(d => d.id === deckId);
      if (!originalDeck) return;

      const newDeckId = `custom_${Date.now()}`;
      const newDeck: Deck = {
          ...originalDeck,
          id: newDeckId,
          title: `${originalDeck.title} (Copy)`,
          tags: ['Custom'],
      };

      const deckCards = cards.filter(c => c.deckId === deckId);
      
      const batch = writeBatch(db);
      batch.set(doc(db, `users/${uid}/decks/${newDeckId}`), newDeck);
      
      deckCards.forEach(card => {
          const newCardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const newCard = { ...card, id: newCardId, deckId: newDeckId, status: 'new' as const, interval: 0 };
          batch.set(doc(db, `users/${uid}/cards/${newCardId}`), newCard);
      });
      
      await batch.commit();
  };

  const addCard = async (card: Flashcard) => {
      await setDoc(doc(db, `users/${uid}/cards/${card.id}`), card);
      const deck = decks.find(d => d.id === card.deckId);
      if (deck) {
          updateDeck(deck.id, { cardCount: (deck.cardCount || 0) + 1 });
      }
  };

  const updateCard = async (cardId: string, updates: Partial<Flashcard>) => {
      await updateDoc(doc(db, `users/${uid}/cards/${cardId}`), updates);
  };

  const deleteCard = async (cardId: string) => {
      await deleteDoc(doc(db, `users/${uid}/cards/${cardId}`));
  };

  const getCardsForDeck = (deckId: string) => {
      return cards.filter(c => c.deckId === deckId);
  };

  const updatePreferences = async (newPrefs: Partial<StudyPreferences>) => {
      await setDoc(doc(db, `users/${uid}/settings/preferences`), { ...preferences, ...newPrefs }, { merge: true });
  };

  const updateDashboardConfig = async (config: Partial<DashboardConfig>) => {
      await setDoc(doc(db, `users/${uid}/settings/dashboard`), { ...dashboardConfig, ...config }, { merge: true });
  };

  const updateStats = async (newStats: Partial<StudyStats>, incrementActivity = false) => {
      setStats(prev => ({ ...prev, ...newStats }));
  };

  const calculateStruggleScore = (history: ReviewLog[]): number => {
    if (!history || history.length === 0) return 0;
    const weights: Record<CardRating, number> = { again: 3, hard: 2, good: 1, easy: 0 };
    const recent = history.slice(-10);
    let score = recent.reduce((acc, log) => acc + weights[log.rating], 0);
    const lastRating = recent[recent.length - 1].rating;
    if (lastRating === 'again') score += 5;
    if (lastRating === 'hard') score += 2;
    return Math.min(Math.round((score / 35) * 100), 100);
  };

  const logReview = async (cardId: string, rating: CardRating) => {
      const currentCard = cards.find(c => c.id === cardId);
      if (!currentCard) return;

      const nowTimestamp = Timestamp.now();
      const now = Date.now();

      const nextSchedule = calculateNextSchedule(currentCard, rating, preferences);

      const reviewData = {
          cardId,
          rating,
          reviewedAt: nowTimestamp,
          previousInterval: currentCard.interval,
          newInterval: nextSchedule.interval
      };
      await addDoc(collection(db, `users/${uid}/reviews`), reviewData);

      const newLog: ReviewLog = { timestamp: now, rating };
      const history = [...(currentCard.reviewHistory || []), newLog].slice(-20);
      const newScore = calculateStruggleScore(history);

      const cardUpdates = {
          lastReviewed: new Date().toISOString(),
          reviewHistory: history,
          struggleScore: newScore,
          interval: nextSchedule.interval,
          status: nextSchedule.status,
          nextReview: nextSchedule.nextReview,
          easeFactor: nextSchedule.easeFactor,
          learningStepIndex: nextSchedule.learningStepIndex,
          previousIntervalDays: nextSchedule.previousIntervalDays,
          fsrs: nextSchedule.fsrs,
          leitnerBox: nextSchedule.leitnerBox
      };

      await updateDoc(doc(db, `users/${uid}/cards/${cardId}`), cardUpdates);
  };

  const resetData = async () => {
      if(confirm("Are you sure? This will wipe all data permanently.")) {
          alert("Resetting data... Page will reload.");
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <DataContext.Provider value={{ 
        decks, cards, quizzes, stats, preferences, dashboardConfig,
        addDeck, addCard, updateCard, deleteCard, getCardsForDeck, 
        updateStats, updatePreferences, updateDashboardConfig, resetData, updateDeck, deleteDeck, copyDeck,
        logReview, isSeeding, seedDatabase
    }}>
      {children}
    </DataContext.Provider>
  );
};