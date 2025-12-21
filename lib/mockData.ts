import { Card, Deck, Question, UserSettings } from '../types';

export const initialSettings: UserSettings = {
  name: 'Student Nurse',
  theme: 'dark',
  learningStyle: 'visual',
  cardsPerDay: 20,
  accessibility: {
    fontScale: 1,
    reduceMotion: false,
  },
};

export const mockDecks: Deck[] = [
  {
    id: 'd1',
    title: 'Fundamentals of Nursing',
    description: 'Core concepts, vital signs, and basic procedures.',
    category: 'Fundamentals',
    cardCount: 12,
    masteryLevel: 45,
    color: '#3b82f6',
  },
  {
    id: 'd2',
    title: 'Med-Surg: Cardiac',
    description: 'Heart failure, hypertension, and EKG interpretation.',
    category: 'Med-Surg',
    cardCount: 8,
    masteryLevel: 70,
    color: '#ef4444',
  },
  {
    id: 'd3',
    title: 'Pharmacology Drill',
    description: 'Drug classes, side effects, and antidotes.',
    category: 'Custom',
    cardCount: 15,
    masteryLevel: 20,
    color: '#10b981',
  },
  {
    id: 'd4',
    title: 'Maternal & Child',
    description: 'Labor stages, fetal monitoring, and newborn care.',
    category: 'OB',
    cardCount: 5,
    masteryLevel: 10,
    color: '#f472b6',
  }
];

export const mockCards: Card[] = [
  // Fundamentals
  {
    id: 'c1',
    deckId: 'd1',
    front: 'What is the normal range for adult heart rate?',
    back: '60 - 100 beats per minute',
    type: 'standard',
    notes: 'Bradycardia is <60, Tachycardia is >100.',
    tags: ['vitals', 'fundamentals'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0], // Due today
    state: 'new',
  },
  {
    id: 'c2',
    deckId: 'd1',
    front: 'Define: Orthopnea',
    back: 'Shortness of breath (dyspnea) that occurs when lying flat.',
    type: 'standard',
    tags: ['respiratory', 'terminology'],
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0],
    state: 'review',
  },
  // Vignette
  {
    id: 'c3',
    deckId: 'd2',
    front: 'A patient presents with crushing chest pain radiating to the left arm, diaphoresis, and nausea. ECG shows ST elevation in leads II, III, and aVF. What is the suspected diagnosis?',
    back: 'Inferior Wall Myocardial Infarction (STEMI)',
    type: 'vignette',
    notes: 'Remember: MONA (Morphine, Oxygen, Nitroglycerin, Aspirin) protocol, though order varies.',
    tags: ['cardiac', 'emergency'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0],
    state: 'new',
  },
  // Pharm
  {
    id: 'c4',
    deckId: 'd3',
    front: 'Antidote for Heparin?',
    back: 'Protamine Sulfate',
    type: 'input',
    tags: ['pharm', 'antidotes'],
    interval: 5,
    repetitions: 2,
    easeFactor: 2.6,
    dueDate: '2025-01-01', // Future
    state: 'review',
  },
  {
    id: 'c5',
    deckId: 'd3',
    front: 'Antidote for Warfarin (Coumadin)?',
    back: 'Vitamin K (Phytonadione)',
    type: 'standard',
    tags: ['pharm', 'antidotes'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0],
    state: 'new',
  },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    category: 'Fundamentals',
    difficulty: 'medium',
    text: 'A nurse is caring for a client with a nasogastric tube. Which intervention is most important to prevent aspiration?',
    options: [
      'Flush the tube with 30mL of water every 4 hours',
      'Check residual volume every 8 hours',
      'Elevate the head of the bed to 30-45 degrees',
      'Administer feedings at room temperature'
    ],
    correctIndices: [2],
    rationale: 'Elevating the HOB uses gravity to prevent reflux of gastric contents, the primary cause of aspiration in NG tube patients.',
    type: 'mcq',
  },
  {
    id: 'q2',
    category: 'Med-Surg',
    difficulty: 'hard',
    text: 'Which of the following are signs of hypoglycemia? Select All That Apply.',
    options: [
      'Polyuria',
      'Diaphoresis',
      'Tachycardia',
      'Confusion',
      'Fruity breath odor'
    ],
    correctIndices: [1, 2, 3],
    rationale: 'Hypoglycemia ("Cold and clammy"): Diaphoresis, Tachycardia, Confusion, Tremors. Polyuria and Fruity breath are signs of Hyperglycemia (DKA).',
    type: 'sata',
  }
];
