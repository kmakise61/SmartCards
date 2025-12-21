import { Card } from '../types';

/**
 * SuperMemo 2 Algorithm implementation
 * 
 * Quality:
 * 0-2: Fail (Again)
 * 3: Hard
 * 4: Good
 * 5: Easy
 * 
 * We map UI buttons to Quality:
 * Again -> 0
 * Hard -> 3
 * Good -> 4
 * Easy -> 5
 */

export const calculateNextReview = (
  card: Card,
  quality: 0 | 3 | 4 | 5
): Partial<Card> => {
  let { interval, repetitions, easeFactor } = card;

  // If quality is failure (Again)
  if (quality < 3) {
    return {
      repetitions: 0,
      interval: 1, // Reset to 1 day
      state: 'relearning',
      dueDate: getFutureDate(1),
    };
  }

  // Update Repetitions
  const newRepetitions = repetitions + 1;

  // Update Interval
  let newInterval: number;
  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  // Update Ease Factor (standard SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    state: 'review',
    dueDate: getFutureDate(newInterval),
  };
};

const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const isDue = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr <= today;
};
