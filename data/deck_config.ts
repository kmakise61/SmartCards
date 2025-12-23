
import { DeckConfig, DeckId } from '../types';

export const DECKS: Record<DeckId, DeckConfig> = {
  NP1: {
    id: "NP1",
    title: "Community Health Nursing",
    subtitle: "Public Health & Epidemiology",
    description: "Foundations of CHN, DOH Programs, Epidemiology, Health Statistics, and Community Organizing (COPAR)."
  },
  NP2: {
    id: "NP2",
    title: "Maternal & Child Nursing",
    subtitle: "Reproductive & Pediatric Health",
    description: "Comprehensive care for the mother and child across the lifespan, from conception through adolescent growth."
  },
  NP3: {
    id: "NP3",
    title: "Med-Surg Nursing I",
    subtitle: "Oxygenation & Foundations",
    description: "Surgery protocols, Respiratory care, Cardiovascular health, and Fluid & Electrolyte balance."
  },
  NP4: {
    id: "NP4",
    title: "Med-Surg Nursing II",
    subtitle: "Metabolic & Systemic Health",
    description: "Gastrointestinal, Endocrine, Metabolic disorders, MSK, and Sensory-Neurological clinical management."
  },
  NP5: {
    id: "NP5",
    title: "Psychiatric & Critical Care",
    subtitle: "Mental Health & Management",
    description: "Maladaptive behaviors, Psychiatric nursing, Acute/Critical Care, and Leadership & Management principles."
  },
  PHARM_LABS: {
    id: "PHARM_LABS",
    title: "Pharmacology & Labs",
    subtitle: "High-Yield Fundamentals",
    description: "Strategic drug classifications, therapeutic ranges, critical laboratory values, and clinical antidotes.",
    isSupplemental: true
  },
  PRIO_DEL: {
    id: "PRIO_DEL",
    title: "Prioritization & Delegation",
    subtitle: "Strategic Nursing Logic",
    description: "Clinical prioritization frameworks (ABC, Maslow), delegation protocols, and staff assignment logic.",
    isSupplemental: true
  }
};

export const DECK_LIST = Object.values(DECKS);
export const CORE_DECKS = DECK_LIST.filter(d => !d.isSupplemental);
export const SUPPLEMENTAL_DECKS = DECK_LIST.filter(d => d.isSupplemental);
