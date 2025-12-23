
import { Flashcard, FlashcardUI } from '../types';
import { SEEDED_CARDS } from '../data/nursing_db';

/**
 * authoritative mapping: ensures raw dataset matches the authoritative UI model.
 * Now processes the full dataset (1250+ cards).
 */
export const adaptCards = (): FlashcardUI[] => {
  // Use full SEEDED_CARDS array
  const data = SEEDED_CARDS; 
  const uniqueCards: FlashcardUI[] = [];

  data.forEach((card, index) => {
    // Robust content parsing for answer vs rationale
    // Splits by double newline as per standard data format
    const parts = card.back.split('\n\n');
    let rawAnswer = parts[0] || card.back;
    let rawRationale = parts.slice(1).join('\n\n') || '';

    // PNLE-relevant fallback rationale if missing in dataset
    if (!rawRationale) {
      rawRationale = "**Clinical Rationale:** Essential board-standard intervention focusing on patient safety, ABC prioritization, and evidence-based practice protocols.";
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
      lastGrade: null,
    });
  });

  return uniqueCards;
};
