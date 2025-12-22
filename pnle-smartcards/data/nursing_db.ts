import { Flashcard } from '../types';
import { NP1_SET1 } from './np1_flashcards/np1_set1';
import { NP1_SET2 } from './np1_flashcards/np1_set2';
import { NP1_SET3 } from './np1_flashcards/np1_set3';
import { NP1_SET4 } from './np1_flashcards/np1_set4';
import { NP2_SET1 } from './np2_flashcards/np2_set1';
import { NP2_SET2 } from './np2_flashcards/np2_set2';
import { NP2_SET3 } from './np2_flashcards/np2_set3';
import { NP2_SET4 } from './np2_flashcards/np2_set4';
import { NP2_SET5 } from './np2_flashcards/np2_set5';
import { NP3_SET1 } from './np3_flashcards/np3_set1';
import { NP3_SET2 } from './np3_flashcards/np3_set2';
import { NP3_SET3 } from './np3_flashcards/np3_set3';
import { NP3_SET4 } from './np3_flashcards/np3_set4';
import { NP4_SET1 } from './np4_flashcards/np4_set1';
import { NP4_SET2 } from './np4_flashcards/np4_set2';
import { NP4_SET3 } from './np4_flashcards/np4_set3';
import { NP4_SET4 } from './np4_flashcards/np4_set4';
import { NP5_SET1 } from './np5_flashcards/np5_set1';
import { NP5_SET2 } from './np5_flashcards/np5_set2';
import { NP5_SET3 } from './np5_flashcards/np5_set3';
import { NP5_SET4 } from './np5_flashcards/np5_set4';

// Exporting the High Yield NP Sets as the default seeded cards
// Safe spreading: If an import is undefined due to path errors, it won't crash the app.
export const SEEDED_CARDS: Flashcard[] = [
    ...(NP1_SET1 || []),
    ...(NP1_SET2 || []),
    ...(NP1_SET3 || []),
    ...(NP1_SET4 || []),
    ...(NP2_SET1 || []),
    ...(NP2_SET2 || []),
    ...(NP2_SET3 || []),
    ...(NP2_SET4 || []),
    ...(NP2_SET5 || []),
    ...(NP3_SET1 || []),
    ...(NP3_SET2 || []),
    ...(NP3_SET3 || []),
    ...(NP3_SET4 || []),
    ...(NP4_SET1 || []),
    ...(NP4_SET2 || []),
    ...(NP4_SET3 || []),
    ...(NP4_SET4 || []),
    ...(NP5_SET1 || []),
    ...(NP5_SET2 || []),
    ...(NP5_SET3 || []),
    ...(NP5_SET4 || [])
];