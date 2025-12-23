
export interface Flashcard {
  id: string;
  deckId: string;
  np: "NP1" | "NP2" | "NP3" | "NP4" | "NP5" | "PHARM_LABS" | "PRIO_DEL";
  setId: string;
  setName: string;
  setDescription: string;
  setTags?: string[];
  front: string;
  back: string;
  tags: string[];
  hint?: string;
  status: string;
  interval: number;
  easeFactor: number;
}

export type MasteryStatus = 'unseen' | 'learning' | 'mastered';
export type GradeStatus = 'again' | 'hard' | 'good';

export interface FlashcardUI extends Flashcard {
  displayId: string;
  category: string;
  question: string;
  answer: string;
  rationale: string;
  // Progress Data
  masteryStatus: MasteryStatus;
  goodCount: number;
  stableCount: number;
  criticalCount: number;
  seen: boolean;
  lastGrade: GradeStatus | null;
}

export type ViewState = 'dashboard' | 'flashcards' | 'analytics';
export type FlashcardsViewMode = 'decks' | 'sets' | 'details' | 'study';
export type AccentPreset = 'pink' | 'rose' | 'violet' | 'cyan';

export interface UserSettings {
  accent: AccentPreset;
  softMode: boolean;
  sortByLowest: boolean;
  autoAdvance: boolean;
  showKeyboardHints: boolean;
  showCardNumbers: boolean;
  autoResume: boolean;
}

export type SessionGoal = 10 | 25 | 50 | 'unlimited';

export interface MasteryRecord {
  seen: boolean;
  goodCount: number;
  criticalCount: number;
  lastGrade: GradeStatus | null;
  updatedAt: number;
}

export interface DeckIdStats {
  total: number;
  unseen: number;
  learning: number;
  mastered: number;
  progress: number;
}

export type DeckId = "NP1" | "NP2" | "NP3" | "NP4" | "NP5" | "PHARM_LABS" | "PRIO_DEL";

export interface DeckConfig {
  id: DeckId;
  title: string;
  subtitle: string;
  description: string;
  isSupplemental?: boolean;
}

export interface SetMetadata {
  setId: string;
  setName: string;
  setDescription: string;
  setTags: string[];
  np: "NP1" | "NP2" | "NP3" | "NP4" | "NP5" | "PHARM_LABS" | "PRIO_DEL";
  totalCards: number;
}

export interface LastSessionState {
  deckId: DeckId | null;
  setId: string | null;
  currentIndex: number;
  masteryFilters: MasteryStatus[];
  timestamp: number;
}