
import { Flashcard, FlashcardUI } from '../types';
import { SEEDED_CARDS } from '../data/nursing_db';

/**
 * authoritative mapping: ensures raw dataset matches the authoritative UI model.
 * Now processes the full dataset (1250+ cards).
 * Logic specifically detects Cloze/Protocol cards to properly map high-yield notes.
 */
export const adaptCards = (): FlashcardUI[] => {
  const data = SEEDED_CARDS; 
  const uniqueCards: FlashcardUI[] = [];

  data.forEach((card, index) => {
    // Detect if this is a Cloze/Protocol card (Gizmo style)
    const isCloze = card.front.includes('{{');
    const isProtocolDeck = ['MEDSURG_SIGNS', 'MNEMONICS', 'TRIADS_SYNDROMES'].includes(card.np);
    
    // Split back field by double newline for standard cards
    const parts = card.back.split('\n\n');
    let rawAnswer = parts[0] || card.back;
    let rawRationale = parts.slice(1).join('\n\n') || '';

    // LOGIC FIX FOR ACTIVE RECALL:
    // In Cloze cards, the 'back' field in the dataset IS the specific analysis/note.
    // We map it to rationale and use a clean version for the answer field.
    if (isCloze || isProtocolDeck) {
      // Use the entire back as rationale if it doesn't already contain double-newlines
      if (!rawRationale) {
        rawRationale = card.back;
      }
      
      // Extract the answer from brackets for the answer field (redundancy for other views)
      const clozeMatch = card.front.match(/{{(.*?)}}/);
      if (clozeMatch) {
        rawAnswer = clozeMatch[1];
      }
    }

    // High-yield fallback only if the dataset field is literally empty
    if (!rawRationale || rawRationale.trim() === '') {
      if (isCloze) {
        rawRationale = "**Clinical Note:** Hallmark diagnostic indicator used in differential nursing assessment and board-standard protocols.";
      } else {
        rawRationale = "**Clinical Rationale:** Essential intervention focusing on patient safety, ABC prioritization, and evidence-based practice protocols.";
      }
    }

    const stableId = card.id || `${card.np}_${card.setId}_${index}`;

    uniqueCards.push({
      ...card,
      id: stableId,
      displayId: (uniqueCards.length + 1).toString().padStart(4, '0'),
      category: card.np, 
      question: card.front,
      answer: rawAnswer,
      rationale: rawRationale,
      masteryStatus: 'unseen', 
      goodCount: 0,
      stableCount: 0,         
      criticalCount: 0,
      seen: false,
      isFlagged: false,
      lastGrade: null,
    });
  });

  return uniqueCards;
};
