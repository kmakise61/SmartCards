import { LucideIcon } from "lucide-react";

export type ThemeMode = 'light' | 'dark' | 'midnight';

export type AccentColor = 'rose' | 'blue' | 'gold' | 'emerald' | 'violet';

export type RouteName = 
  | 'Dashboard' 
  | 'My Decks' 
  | 'Quizzes' 
  | 'Analytics';

export interface NavigationItem {
  name: RouteName;
  icon: LucideIcon;
  path: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  title: string;
  email: string;
}

export interface DailyActivity {
  date: string; // ISO Date String (YYYY-MM-DD)
  count: number;
}

export interface StudyStats {
  cardsDue: number;
  retentionRate: number;
  streakDays: number;
  cardsLearned: number;
  totalStudyTimemins: number;
  lastStudyDate: string | null; // ISO Date string
  activityHistory: DailyActivity[]; 
  // Tracking for daily limits
  dailyProgress?: {
    date: string;
    newStudied: number;
    reviewStudied: number;
  };
}

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewLog {
  timestamp: number;
  rating: CardRating;
}

export type SchedulingEngine = 'smartcards' | 'sm2' | 'fsrs' | 'leitner';

export interface StudyPreferences {
  schedulingEngine: SchedulingEngine;
  
  // Session Limits
  questionsPerDay: number; // Global cap (legacy support)
  newCardsPerDay: number;
  reviewCardsPerDay: number;
  sessionSize: number;

  // FSRS Specifics
  targetRetention: number; // 0.75 - 0.95
  enableFuzz: boolean;

  // PNLE Specifics
  highYieldMode: boolean; // Prioritize high-yield tags
  examCountdownIntensity: number; // 0-100 slider (Interval scaling)

  // Legacy/Other Engines
  easyBonusDays: number; 
}

export interface DashboardConfig {
  title: string;
  subtitle: string;
  lastUpdated: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  lastReviewed?: string; // ISO Date string
  nextReview?: string; // ISO Date string
  interval: number; // Days (float)
  easeFactor: number;
  status: 'new' | 'learning' | 'review' | 'relearning';
  
  // Enhanced Features
  isFavorite?: boolean;
  reviewHistory?: ReviewLog[]; // Compact history
  struggleScore?: number; // Computed score (0-100)

  // Scheduling Metadata
  learningStepIndex?: number;
  previousIntervalDays?: number; // For relearning
  leitnerBox?: number; // 1-5
  fsrs?: {
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    retrievability: number;
  };
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  tags: string[];
  color: string; // Tailwind class
  lastStudied?: string; // ISO Date string
}

// --- NEW QUIZ TYPES ---
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  bestScore?: number;
}