
import { DeckConfig, DeckId } from '../types';

export const DECKS: Record<DeckId, DeckConfig> = {
  NP1: {
    id: "NP1",
    title: "Community Health Nursing",
    subtitle: "Public Health & Epidemiology",
    description: "Foundations of CHN, DOH Programs, Epidemiology, Health Statistics, and Community Organizing (COPAR).",
    visibility: ['dashboard']
  },
  NP2: {
    id: "NP2",
    title: "Maternal & Child Nursing",
    subtitle: "Reproductive & Pediatric Health",
    description: "Comprehensive care for the mother and child across the lifespan, from conception through adolescent growth.",
    visibility: ['dashboard']
  },
  NP3: {
    id: "NP3",
    title: "Med-Surg Nursing I",
    subtitle: "Oxygenation & Foundations",
    description: "Surgery protocols, Respiratory care, Cardiovascular health, and Fluid & Electrolyte balance.",
    visibility: ['dashboard']
  },
  NP4: {
    id: "NP4",
    title: "Med-Surg Nursing II",
    subtitle: "Metabolic & Systemic Health",
    description: "Gastrointestinal, Endocrine, Metabolic disorders, MSK, and Sensory-Neurological clinical management.",
    visibility: ['dashboard']
  },
  NP5: {
    id: "NP5",
    title: "Psychiatric & Critical Care",
    subtitle: "Mental Health & Management",
    description: "Maladaptive behaviors, Psychiatric nursing, Acute/Critical Care, and Leadership & Management principles.",
    visibility: ['dashboard']
  },
  PHARM_LABS: {
    id: "PHARM_LABS",
    title: "Pharmacology & Labs",
    subtitle: "High-Yield Fundamentals",
    description: "Strategic drug classifications, therapeutic ranges, critical laboratory values, and clinical antidotes.",
    isSupplemental: true,
    visibility: ['dashboard']
  },
  PRIO_DEL: {
    id: "PRIO_DEL",
    title: "Prioritization & Delegation",
    subtitle: "Strategic Nursing Logic",
    description: "Clinical prioritization frameworks (ABC, Maslow), delegation protocols, and staff assignment logic.",
    isSupplemental: true,
    visibility: ['dashboard']
  },
  MEDSURG_SIGNS: {
    id: "MEDSURG_SIGNS",
    title: "Pathognomonic Signs",
    subtitle: "Hallmark Indicators",
    description: "Master high-yield pathognomonic signs and clinical hallmarks using active recall cloze deletion strategy.",
    isSupplemental: true,
    visibility: ['quiz']
  },
  MNEMONICS: {
    id: "MNEMONICS",
    title: "High-Yield Mnemonics",
    subtitle: "Board Exam Shortcuts",
    description: "Master critical clinical acronyms like CAUTION, MONA, and REEDA through active recall.",
    isSupplemental: true,
    visibility: ['quiz']
  },
  TRIADS_SYNDROMES: {
    id: "TRIADS_SYNDROMES",
    title: "Triads & Syndromes",
    subtitle: "Clinical Patterns",
    description: "Master classic medical triads and syndromes (e.g., Cushing's, Beck's, Virchow's) to sharpen diagnostic speed.",
    isSupplemental: true,
    visibility: ['quiz']
  }
};

export const DECK_LIST = Object.values(DECKS);
export const CORE_DECKS = DECK_LIST.filter(d => !d.isSupplemental);
export const SUPPLEMENTAL_DECKS = DECK_LIST.filter(d => d.isSupplemental);
