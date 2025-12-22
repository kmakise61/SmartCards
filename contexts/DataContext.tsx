import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    collection, 
    doc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    writeBatch, 
    onSnapshot,
    Timestamp
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
  seedDatabase: (specificCards?: Flashcard[], forceDecks?: boolean) => Promise<void>; 
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

// --- SEEDING HELPERS ---

// 1. Recursive cleaner to find and log undefined fields (Defensive)
const logUndefinedFields = (obj: any, path: string, docId: string) => {
    if (obj === null || typeof obj !== 'object') return;
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) {
            console.warn(`[Seed Warning] Card ${docId}: Field '${path}${key}' is undefined. Auto-fixing by removal.`);
        } else if (typeof value === 'object') {
            logUndefinedFields(value, `${path}${key}.`, docId);
        }
    });
};

// 2. Strict Enrichment: Sets defaults for optional fields to avoid undefined
const enrichCardForSeed = (card: Flashcard): Flashcard => {
    return {
        ...card,
        // Force critical optional fields to be strings/arrays, never undefined
        hint: card.hint ?? "", 
        tags: card.tags ?? [],
        // Scheduling defaults
        status: card.status || 'new',
        interval: card.interval || 0,
        easeFactor: card.easeFactor || 2.5,
        nextReview: card.nextReview || new Date().toISOString(),
        fsrs: card.fsrs || {
            stability: 0.5,
            difficulty: 5,
            elapsedDays: 0,
            scheduledDays: 0,
            retrievability: 1
        }
    };
};

// 3. Final Sanitizer: Strips any remaining undefined values
const sanitizeForFirestore = (card: Flashcard): any => {
    // Check for undefineds before stripping them (for logging requirement)
    logUndefinedFields(card, '', card.id);
    // JSON stringify removes undefined keys, making it Firestore-safe
    return JSON.parse(JSON.stringify(card));
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
  
  // Loading states
  const [decksLoaded, setDecksLoaded] = useState(false);
  const [cardsLoaded, setCardsLoaded] = useState(false);

  // --- ACTIONS ---

  const seedDatabase = async (specificCards: Flashcard[] = [], forceDecks = false) => {
      if (isSeeding) return;
      setIsSeeding(true);
      
      const cardsToProcess = specificCards.length > 0 ? specificCards : SEEDED_CARDS;
      const isFullSeed = specificCards.length === 0;

      console.log(`[Seed] Starting process for user ${uid}. Mode: ${isFullSeed ? 'Full Initialization' : 'Partial Repair'}. Cards to add: ${cardsToProcess.length}. Decks update: ${forceDecks}`);
      
      try {
          const batch = writeBatch(db);
          let operationCount = 0;
          const MAX_BATCH_SIZE = 450; 

          // 1. Seed Decks & Settings
          // We write decks if it's a full seed OR if we explicitly forced it (missing decks detected)
          if (isFullSeed || forceDecks) {
              INITIAL_DECKS.forEach(deck => {
                  const ref = doc(db, `users/${uid}/decks/${deck.id}`);
                  batch.set(ref, deck, { merge: true }); // Merge allows updating existing decks without wiping custom fields if any
                  operationCount++;
              });

              if (isFullSeed) {
                  const prefRef = doc(db, `users/${uid}/settings/preferences`);
                  batch.set(prefRef, DEFAULT_PREFERENCES, { merge: true });
                  
                  const dashRef = doc(db, `users/${uid}/settings/dashboard`);
                  batch.set(dashRef, getDefaultDashboardConfig(), { merge: true });
                  operationCount += 2;
              }
          }

          // Commit initial batch if it has ops
          if (operationCount > 0) {
              await batch.commit();
              console.log("[Seed] Decks & Settings committed.");
          }

          // 2. Seed Cards (Chunked & Sanitized)
          if (cardsToProcess.length > 0) {
              const CHUNK_SIZE = 200; 
              for (let i = 0; i < cardsToProcess.length; i += CHUNK_SIZE) {
                  const chunk = cardsToProcess.slice(i, i + CHUNK_SIZE);
                  const cardBatch = writeBatch(db);
                  
                  chunk.forEach(card => {
                      // A. Normalize & Enrich (Ensure hint is "")
                      const enriched = enrichCardForSeed(card);
                      // B. Sanitize (Strip undefined, log warnings)
                      const finalPayload = sanitizeForFirestore(enriched);
                      
                      const ref = doc(db, `users/${uid}/cards/${finalPayload.id}`);
                      cardBatch.set(ref, finalPayload);
                  });

                  await cardBatch.commit();
                  console.log(`[Seed] Committed chunk ${i / CHUNK_SIZE + 1} / ${Math.ceil(cardsToProcess.length / CHUNK_SIZE)}`);
              }
          }
          
          console.log("[Seed] Completed successfully.");
      } catch (e) {
          console.error("[Seed] Failed:", e);
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
          setDecksLoaded(true);
      }, (error) => console.error("Error decks:", error));
      return () => unsub();
  }, [uid]);

  // 2. Cards
  useEffect(() => {
      const q = collection(db, `users/${uid}/cards`);
      const unsub = onSnapshot(q, (snapshot) => {
          const loadedCards: Flashcard[] = [];
          snapshot.forEach(doc => loadedCards.push(doc.data() as Flashcard));
          setCards(loadedCards);
          setCardsLoaded(true);
      }, (error) => console.error("Error cards:", error));
      return () => unsub();
  }, [uid]);

  // 3. Settings
  useEffect(() => {
      const prefsRef = doc(db, `users/${uid}/settings/preferences`);
      const dashRef = doc(db, `users/${uid}/settings/dashboard`);

      const unsubPrefs = onSnapshot(prefsRef, (doc) => {
          if (doc.exists()) setPreferences(doc.data() as StudyPreferences);
      });
      const unsubDash = onSnapshot(dashRef, (doc) => {
          if (doc.exists()) setDashboardConfig(doc.data() as DashboardConfig);
      });
      return () => { unsubPrefs(); unsubDash(); };
  }, [uid]);

  // 4. ROBUST AUTO-REPAIR LOGIC
  useEffect(() => {
      if (!decksLoaded || !cardsLoaded || isSeeding) return;

      // Identify Missing Cards (Diffing)
      const existingIds = new Set(cards.map(c => c.id));
      const missingCards = SEEDED_CARDS.filter(c => !existingIds.has(c.id));

      // Identify Missing Decks (Diffing)
      const existingDeckIds = new Set(decks.map(d => d.id));
      const missingDecks = INITIAL_DECKS.filter(d => !existingDeckIds.has(d.id));
      const hasMissingDecks = missingDecks.length > 0;

      if (missingCards.length > 0 || hasMissingDecks) {
          console.warn(`[Auto-Repair] Integrity Check Failed. Missing ${missingCards.length} cards and ${missingDecks.length} decks.`);
          
          if (decks.length === 0 && cards.length === 0) {
              // Complete initialization
              seedDatabase(); 
          } else {
              // Partial update (cards and/or decks)
              seedDatabase(missingCards, hasMissingDecks);
          }
      }

  }, [decksLoaded, cardsLoaded, cards.length, decks.length, isSeeding]);

  // 5. DEV CONSOLE SUMMARY
  useEffect(() => {
      if (decksLoaded && cardsLoaded) {
          const dueNow = cards.filter(c => c.status === 'new' || (c.nextReview && new Date(c.nextReview) <= new Date())).length;
          console.group("PNLE SmartCards Data Integrity");
          console.log(`User ID          : ${uid}`);
          console.log(`Source Definition: ${SEEDED_CARDS.length} cards`);
          console.log(`Firestore Count  : ${cards.length} cards`);
          console.log(`Missing Count    : ${SEEDED_CARDS.length > cards.length ? SEEDED_CARDS.length - cards.length : 0}`);
          console.log(`Decks Available  : ${decks.length}`);
          console.log(`Ready for Study  : ${dueNow}`);
          console.groupEnd();
      }
  }, [decksLoaded, cardsLoaded]);

  // 6. Sync Analytics
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
          // Use sanitizer here too
          const enriched = enrichCardForSeed({ ...card, id: newCardId, deckId: newDeckId });
          const payload = sanitizeForFirestore(enriched);
          batch.set(doc(db, `users/${uid}/cards/${newCardId}`), payload);
      });
      
      await batch.commit();
  };

  const addCard = async (card: Flashcard) => {
      const enriched = enrichCardForSeed(card);
      const payload = sanitizeForFirestore(enriched);
      await setDoc(doc(db, `users/${uid}/cards/${card.id}`), payload);
      
      const deck = decks.find(d => d.id === card.deckId);
      if (deck) {
          updateDeck(deck.id, { cardCount: (deck.cardCount || 0) + 1 });
      }
  };

  const updateCard = async (cardId: string, updates: Partial<Flashcard>) => {
      // Sanitize updates as well
      const cleanUpdates = JSON.parse(JSON.stringify(updates));
      await updateDoc(doc(db, `users/${uid}/cards/${cardId}`), cleanUpdates);
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

      // Sanitize updates
      const cleanUpdates = JSON.parse(JSON.stringify(cardUpdates));
      await updateDoc(doc(db, `users/${uid}/cards/${cardId}`), cleanUpdates);
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