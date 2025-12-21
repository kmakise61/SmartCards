export type Theme = 'light' | 'dark' | 'crescere';

export interface UserSettings {
  name: string;
  email?: string; // Added for Profile Dropdown
  avatar?: string; // Added for Profile Dropdown
  rank?: string; // Added for Gamification Badge
  theme: Theme;
  learningStyle: 'visual' | 'auditory' | 'read-write' | 'kinesthetic';
  cardsPerDay: number;
  accessibility: {
    fontScale: number; // 1 = 100%
    reduceMotion: boolean;
  };
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: 'Fundamentals' | 'Med-Surg' | 'OB' | 'Pedia' | 'Psych' | 'Community' | 'Weak Areas' | 'Custom';
  cardCount: number;
  masteryLevel: number; // 0-100
  color: string;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  type: 'standard' | 'vignette' | 'input';
  image?: string;
  notes?: string; // Clinical pearl
  tags: string[];
  
  // SM-2 Data
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  dueDate: string; // ISO Date string
  state: 'new' | 'learning' | 'review' | 'relearning';
}

export interface ReviewLog {
  id: string;
  cardId: string;
  rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
  reviewedAt: string;
  timeSpent: number; // seconds
}

export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  options: string[];
  correctIndices: number[]; // Array for SATA support
  rationale: string;
  type: 'mcq' | 'sata';
}

// Navigation types
export type Page = 'dashboard' | 'today' | 'decks' | 'create-card' | 'test' | 'analytics' | 'settings';
