import { Flashcard, CardRating, StudyPreferences } from '../types';

interface ScheduleResult {
  interval: number;
  status: 'new' | 'learning' | 'review' | 'relearning';
  nextReview: string;
  learningStepIndex?: number;
  previousIntervalDays?: number;
  easeFactor: number;
  fsrs?: Flashcard['fsrs'];
  leitnerBox?: number;
}

const addTime = (base: number, seconds: number) => {
    const date = new Date(base + seconds * 1000);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const addDays = (base: number, days: number) => {
    const date = new Date(base + days * 24 * 60 * 60 * 1000);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

// Helper: Apply Fuzz
const applyFuzz = (interval: number, enableFuzz: boolean): number => {
  if (!enableFuzz || interval < 1) return interval;

  let fuzzRange = 0;
  if (interval <= 2) fuzzRange = 0; // Don't fuzz very short intervals
  else if (interval <= 7) fuzzRange = 0.10;
  else fuzzRange = 0.05;

  if (fuzzRange === 0) return interval;

  const fuzzFactor = 1 + (Math.random() * (fuzzRange * 2) - fuzzRange);
  let fuzzed = interval * fuzzFactor;

  // Constraint: For intervals <= 7 days, do not shift more than 1 day
  if (interval <= 7) {
      if (Math.abs(fuzzed - interval) > 1) {
          fuzzed = interval + (fuzzed > interval ? 1 : -1);
      }
  }
  
  return Math.max(0.01, fuzzed);
};

// Helper: Apply Exam Intensity
const applyIntensity = (interval: number, intensity: number): number => {
  // Intensity 0-100. Max reduction 20% (factor 0.8)
  const factor = 1 - (intensity / 100 * 0.2);
  return interval * factor;
};

export const calculateNextSchedule = (
  card: Flashcard,
  rating: CardRating,
  prefs: StudyPreferences
): ScheduleResult => {
  const now = Date.now();
  const engine = prefs.schedulingEngine;

  // -- FSRS ENGINE (Primary) --
  if (engine === 'fsrs') {
    // Current State
    let s = card.fsrs?.stability || 0.5; // Default stability small
    let d = card.fsrs?.difficulty || 5;
    
    // Rating mapping: Again=1, Hard=2, Good=3, Easy=4
    let g = 1;
    if (rating === 'hard') g = 2;
    if (rating === 'good') g = 3;
    if (rating === 'easy') g = 4;

    // 1. Update Difficulty
    let nextD = d - 0.32 * (g - 3);
    nextD = Math.max(1, Math.min(10, nextD));

    // 2. Update Stability
    let nextS = s;
    if (g === 1) {
        nextS = 0.5; 
    } else {
        const growthBase = (5 - (nextD * 0.3)); 
        const ratingMult = (g === 4 ? 2.5 : g === 3 ? 1.5 : 0.8);
        nextS = s * (1 + (growthBase * ratingMult * 0.2)); 
    }
    nextS = Math.max(0.5, nextS);

    // 3. Calculate Interval based on Retention Target
    const r = Math.max(0.70, Math.min(0.99, prefs.targetRetention || 0.9));
    let nextIv = nextS * 9 * (1/r - 1);

    // 4. Apply Modifiers (Intensity & Fuzz)
    if (g > 1) { 
        nextIv = applyIntensity(nextIv, prefs.examCountdownIntensity);
        nextIv = applyFuzz(nextIv, prefs.enableFuzz);
    } else {
        // If Again, small step (relearning)
        nextIv = 0.0035; // ~5 mins
    }

    return {
        ...card,
        status: g === 1 ? 'learning' : 'review',
        interval: nextIv,
        nextReview: nextIv < 1 
            ? addTime(now, nextIv * 24 * 3600) 
            : addDays(now, nextIv),
        fsrs: {
            stability: parseFloat(nextS.toFixed(2)),
            difficulty: parseFloat(nextD.toFixed(2)),
            elapsedDays: 0,
            scheduledDays: nextIv,
            retrievability: 1
        }
    };
  }

  // -- SM-2 ENGINE --
  if (engine === 'sm2') {
    let next: ScheduleResult = { ...card, interval: 0, status: 'new', nextReview: '', fsrs: undefined, leitnerBox: undefined, easeFactor: card.easeFactor };
    
    let quality = 0;
    if (rating === 'again') quality = 1;
    if (rating === 'hard') quality = 3;
    if (rating === 'good') quality = 4;
    if (rating === 'easy') quality = 5;

    if (quality < 3) {
      next.status = 'learning';
      next.interval = 0.04; // 1 hr
      next.nextReview = addTime(now, 3600);
    } else {
      next.status = 'review';
      if (card.status === 'new' || card.interval === 0) {
        next.interval = 1;
      } else if (card.interval === 1) {
        next.interval = 6;
      } else {
        next.interval = Math.round(card.interval * card.easeFactor);
      }
      next.nextReview = addDays(now, next.interval);
    }

    let newEF = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3) newEF = 1.3;
    next.easeFactor = newEF;

    return next;
  }

  // -- LEITNER SYSTEM --
  if (engine === 'leitner') {
    let box = card.leitnerBox || 1;
    const intervals = [1, 3, 7, 14, 30]; 

    if (rating === 'again' || rating === 'hard') {
      box = 1; 
    } else {
      box = Math.min(box + 1, 5); 
    }

    const days = intervals[box - 1];
    return {
      ...card,
      leitnerBox: box,
      interval: days,
      status: 'review',
      nextReview: addDays(now, days),
      easeFactor: 2.5
    };
  }

  // -- FALLBACK --
  return {
      ...card,
      status: 'review',
      interval: 1,
      nextReview: addDays(now, 1),
      easeFactor: 2.5
  };
};