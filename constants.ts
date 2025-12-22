import { 
  LayoutDashboard, 
  Library, 
  ClipboardCheck, 
  BarChart2, 
  Settings 
} from "lucide-react";
import { NavigationItem, StudyStats, UserProfile, Flashcard, Deck, Quiz, StudyPreferences } from "./types";

export const APP_NAME = "PNLE SmartCards";
// PNLE usually happens in May/Nov, targeting August 2026 as per user request.
export const TARGET_DATE = new Date("2026-08-20"); 

export const NAV_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'My Decks', icon: Library, path: '/decks' },
  { name: 'Quizzes', icon: ClipboardCheck, path: '/quizzes' },
  { name: 'Analytics', icon: BarChart2, path: '/analytics' },
];

export const MOCK_USER: UserProfile = {
  name: "Future RN",
  title: "Nursing Student",
  email: "student@pnle.com",
  avatarUrl: "",
};

export const INITIAL_STATS: StudyStats = {
  cardsDue: 50,
  retentionRate: 0,
  streakDays: 1,
  cardsLearned: 0,
  totalStudyTimemins: 0,
  lastStudyDate: new Date().toISOString(),
  activityHistory: [],
  dailyProgress: {
    date: new Date().toISOString().split('T')[0],
    newStudied: 0,
    reviewStudied: 0
  }
};

export const DEFAULT_PREFERENCES: StudyPreferences = {
  schedulingEngine: 'fsrs',
  questionsPerDay: 200,
  newCardsPerDay: 20,
  reviewCardsPerDay: 50,
  sessionSize: 25,
  targetRetention: 0.90,
  enableFuzz: true,
  highYieldMode: true,
  examCountdownIntensity: 50, // Medium (0-100)
  easyBonusDays: 2
};

// --- UPDATED DECKS STRUCTURE ---
export const INITIAL_DECKS: Deck[] = [
  {
    id: 'np1_set1',
    title: 'NP1 Set 1: Foundations & CD',
    description: 'Community Health Nursing, Communicable Diseases, and Fundamentals.',
    cardCount: 50,
    tags: ['NP1', 'Foundations'],
    color: 'bg-emerald-500' 
  },
  {
    id: 'np1_set2',
    title: 'NP1 Set 2: Bioethics & Laws',
    description: 'Jurisprudence, Ethico-Moral Responsibility, and Research.',
    cardCount: 50,
    tags: ['NP1', 'Laws', 'Ethics'],
    color: 'bg-teal-500' 
  },
  {
    id: 'np1_set3',
    title: 'NP1 Set 3: COPAR & Family',
    description: 'Community Organizing, Family Health Nursing, IMCI, and Disaster Management.',
    cardCount: 50,
    tags: ['NP1', 'COPAR', 'Family'],
    color: 'bg-cyan-500' 
  },
  {
    id: 'np1_set4',
    title: 'NP1 Set 4: Leadership & Mgt',
    description: 'Nursing Leadership, Management, Delegation, and Prioritization.',
    cardCount: 50,
    tags: ['NP1', 'Leadership', 'Management'],
    color: 'bg-indigo-500' 
  },
  {
    id: 'np2_set1',
    title: 'NP2 Set 1: Comprehensive',
    description: 'Maternal & Child Nursing Comprehensive Review (Set 1).',
    cardCount: 100,
    tags: ['NP2', 'Maternal', 'Pediatrics'],
    color: 'bg-pink-500' 
  },
  {
    id: 'np2_set2',
    title: 'NP2 Set 2: Maternal',
    description: 'Reproductive Health, Antepartum, Intrapartum, and Fetal Development.',
    cardCount: 50,
    tags: ['NP2', 'Maternal'],
    color: 'bg-rose-500' 
  },
  {
    id: 'np2_set3',
    title: 'NP2 Set 3: Maternal (High Risk)',
    description: 'High-risk Pregnancy, Complications, Pharmacology, and Operative Obstetrics.',
    cardCount: 50,
    tags: ['NP2', 'Maternal', 'High Risk'],
    color: 'bg-red-500' 
  },
  {
    id: 'np2_set4',
    title: 'NP2 Set 4: Growth & Dev',
    description: 'Pediatric Milestones, Theories (Freud/Piaget), and Immunization.',
    cardCount: 50,
    tags: ['NP2', 'Pediatrics', 'Development'],
    color: 'bg-fuchsia-500' 
  },
  {
    id: 'np2_set5',
    title: 'NP2 Set 5: Pedia Conditions',
    description: 'Respiratory, Cardiovascular, Neurologic, and GI conditions in Pediatrics.',
    cardCount: 50,
    tags: ['NP2', 'Pediatrics', 'Pathology'],
    color: 'bg-violet-500' 
  },
  {
    id: 'np3_set1',
    title: 'NP3 Set 1: Periop & Fluids',
    description: 'Perioperative Care, Electrolytes, Acid-Base Balance, and IV Therapy.',
    cardCount: 50,
    tags: ['NP3', 'Perioperative', 'Fluids'],
    color: 'bg-blue-600'
  },
  {
    id: 'np3_set2',
    title: 'NP3 Set 2: Oxygenation',
    description: 'Respiratory disorders (COPD, Asthma, TB), Cardiac failure, and Oxygen therapy.',
    cardCount: 50,
    tags: ['NP3', 'Oxygenation', 'Respiratory'],
    color: 'bg-sky-600'
  },
  {
    id: 'np3_set3',
    title: 'NP3 Set 3: Immunity & GI',
    description: 'Infectious diseases, Autoimmune disorders (SLE, RA), and Gastrointestinal inflammation.',
    cardCount: 50,
    tags: ['NP3', 'Infectious', 'GI'],
    color: 'bg-cyan-600'
  },
  {
    id: 'np3_set4',
    title: 'NP3 Set 4: Oncology & Care',
    description: 'Cellular aberrations, Oncology management, End-of-life care, and Patient Safety protocols.',
    cardCount: 50,
    tags: ['NP3', 'Oncology', 'Palliative'],
    color: 'bg-emerald-600'
  },
  {
    id: 'np4_set1',
    title: 'NP4 Set 1: Nutrition & GI',
    description: 'Total Parenteral Nutrition, Gastrointestinal disorders, Liver, and Metabolism.',
    cardCount: 50,
    tags: ['NP4', 'Nutrition', 'GI'],
    color: 'bg-orange-500'
  },
  {
    id: 'np4_set2',
    title: 'NP4 Set 2: Endocrine',
    description: 'Diabetes Mellitus, Thyroid, Adrenal, and Pituitary disorders.',
    cardCount: 50,
    tags: ['NP4', 'Endocrine', 'Diabetes'],
    color: 'bg-amber-500'
  },
  {
    id: 'np4_set3',
    title: 'NP4 Set 3: Neuro & Emergency',
    description: 'Neurological assessment, Stroke, ICP, Spinal Cord Injury, and Seizure management.',
    cardCount: 50,
    tags: ['NP4', 'Neurology', 'Emergency'],
    color: 'bg-purple-600'
  },
  {
    id: 'np4_set4',
    title: 'NP4 Set 4: MSK & Sensory',
    description: 'Musculoskeletal disorders, Fractures, Traction, Vision (Eye), and Hearing (Ear) conditions.',
    cardCount: 50,
    tags: ['NP4', 'MSK', 'Sensory'],
    color: 'bg-fuchsia-600'
  },
  {
    id: 'np5_set1',
    title: 'NP5 Set 1: Psych Foundations',
    description: 'Therapeutic Communication, Defense Mechanisms, Anxiety, and Nurse-Client Relationship.',
    cardCount: 50,
    tags: ['NP5', 'Psych', 'Communication'],
    color: 'bg-teal-600'
  },
  {
    id: 'np5_set2',
    title: 'NP5 Set 2: Psych Disorders',
    description: 'Schizophrenia, Mood Disorders, Anxiety, Personality Disorders, and Psychopharmacology.',
    cardCount: 50,
    tags: ['NP5', 'Psychopathology', 'Pharmacology'],
    color: 'bg-teal-500'
  },
  {
    id: 'np5_set3',
    title: 'NP5 Set 3: Critical Care',
    description: 'Respiratory failure, Ventilators, Hemodynamics, Shock, Trauma, and Emergency Nursing.',
    cardCount: 50,
    tags: ['NP5', 'Critical Care', 'Emergency'],
    color: 'bg-rose-600'
  },
  {
    id: 'np5_set4',
    title: 'NP5 Set 4: Emergency & Trauma',
    description: 'Disaster Triage, Burns, Poisoning, Environmental Emergencies, and Trauma Nursing.',
    cardCount: 50,
    tags: ['NP5', 'Emergency', 'Trauma'],
    color: 'bg-red-700'
  },
  {
    id: 'pharm_labs_set1',
    title: 'Pharm & Lab Values',
    description: 'Essential pharmacology, drug suffixes, antidotes, and critical laboratory values.',
    cardCount: 50,
    tags: ['PHARM', 'Labs', 'Pharmacology'],
    color: 'bg-amber-500'
  },
  {
    id: 'prio_del_set1',
    title: 'Prioritization & Delegation',
    description: 'Rules for priority, scope of practice, and clinical judgment scenarios.',
    cardCount: 50,
    tags: ['PRIO', 'Prioritization', 'Management'],
    color: 'bg-red-600'
  }
];

export const INITIAL_CARDS: Flashcard[] = []; // We rely on nursing_db.ts now

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'NP1: Communicable Diseases Challenge',
    description: 'Test your knowledge on vectors, agents, and signs.',
    questions: [
      {
        id: 'qq1',
        text: 'A patient presents with a "Rice-water stool". Which causative agent is most likely responsible?',
        options: ['Salmonella typhi', 'Vibrio cholerae', 'Shigella dysenteriae', 'Entamoeba histolytica'],
        correctOptionIndex: 1,
        explanation: '**Vibrio cholerae** causes Cholera, which presents with the pathognomonic sign of profuse, watery diarrhea resembling rice water.'
      },
      {
        id: 'qq2',
        text: 'Which mosquito vector is responsible for transmitting Malaria?',
        options: ['Aedes aegypti', 'Culex', 'Anopheles', 'Mansonia'],
        correctOptionIndex: 2,
        explanation: 'The female **Anopheles** mosquito is the vector for Malaria. It is a night-biting mosquito.'
      }
    ]
  }
];