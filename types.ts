
export interface Flashcard {
  id: string;
  deckId: string;
  np: "NP1" | "NP2" | "NP3" | "NP4" | "NP5" | "PHARM_LABS" | "PRIO_DEL" | "MEDSURG_SIGNS" | "MNEMONICS" | "TRIADS_SYNDROMES";
  setId: string;
  setName?: string;
  setDescription?: string;
  setTags?: string[];
  front: string;
  back: string;
  tags: string[];
  hint?: string;
  status: string;
  // Deprecated SRS fields (kept for data compatibility, not used in logic)
  interval?: number;
  easeFactor?: number;
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
  isFlagged: boolean;
  lastGrade: GradeStatus | null;
}

export interface CardEdit {
  id: string;
  question: string;
  answer: string;
  rationale: string;
  updatedAt: number;
}

export type ViewState = 'dashboard' | 'flashcards' | 'analytics' | 'quiz';
export type FlashcardsViewMode = 'decks' | 'sets' | 'details' | 'study' | 'browser';
export type AccentPreset = 'pink' | 'rose' | 'violet' | 'cyan'; // Kept for reference

export interface UserSettings {
  accent: string; // Updated to string for Hex support
  softMode: boolean;
  sortByLowest: boolean;
  autoAdvance: boolean;
  showKeyboardHints: boolean;
  showCardNumbers: boolean;
  autoResume: boolean;
  // Speech Settings
  voiceURI?: string;
  speechRate: number;
  speechPitch: number;
  // Data Settings
  lastBackupDate?: number;
  // Exam Settings
  targetExamDate?: number; // Timestamp
  dailyGoal: number; // New: Target cards per day
}

export type SessionGoal = 10 | 25 | 50 | 'unlimited';

export interface MasteryRecord {
  seen: boolean;
  goodCount: number;
  criticalCount: number;
  lastGrade: GradeStatus | null;
  isFlagged?: boolean;
  updatedAt: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  count: number; // Cards reviewed today
  streak: number; // Consecutive days
}

export interface DeckIdStats {
  total: number;
  unseen: number;
  learning: number;
  mastered: number;
  progress: number;
}

export type DeckId = "NP1" | "NP2" | "NP3" | "NP4" | "NP5" | "PHARM_LABS" | "PRIO_DEL" | "MEDSURG_SIGNS" | "MNEMONICS" | "TRIADS_SYNDROMES";

export interface DeckConfig {
  id: DeckId;
  title: string;
  subtitle: string;
  description: string;
  isSupplemental?: boolean;
  visibility: ('dashboard' | 'quiz')[];
}

export interface SetMetadata {
  setId: string;
  setName: string;
  setDescription: string;
  setTags: string[];
  np: DeckId;
  totalCards: number;
}

export interface LastSessionState {
  deckId: DeckId | null;
  setId: string | null;
  currentIndex: number;
  masteryFilters: MasteryStatus[];
  timestamp: number;
}

export interface SessionFilters {
  mastery?: MasteryStatus[];
  deckId?: DeckId;
  setId?: string;
  cardIds?: string[];
  onlyFlagged?: boolean;
  startIndex?: number;
  shuffle?: boolean;
}

export interface ExamRecord {
  id: string;
  date: number;
  deckId: string;
  totalItems: number;
  correctCount: number;
  score: number;
  incorrectCardIds: string[];
  durationSeconds: number;
}

export interface QuizSessionRecord {
  id: string;
  date: number;
  deckId: string;
  totalItems: number;
  correctCount: number;
  score: number;
}
