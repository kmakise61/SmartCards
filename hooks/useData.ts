import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Deck } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockDecks, mockCards } from '../lib/mockData';

// Helper: Map DB Card (snake_case) to App Card (camelCase)
const mapCardFromDB = (dbCard: any): Card => ({
  id: dbCard.id,
  deckId: dbCard.deck_id,
  front: dbCard.front,
  back: dbCard.back,
  type: dbCard.type || 'standard',
  notes: dbCard.notes,
  tags: [], 
  interval: dbCard.interval || 0,
  repetitions: dbCard.repetitions || 0,
  easeFactor: dbCard.ease_factor || 2.5,
  dueDate: dbCard.due_date ? new Date(dbCard.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  state: dbCard.state || 'new',
});

// Helper: Map App Card to DB Card (for updates)
const mapCardToDB = (card: Partial<Card>) => {
  const dbObj: any = {};
  if (card.interval !== undefined) dbObj.interval = card.interval;
  if (card.repetitions !== undefined) dbObj.repetitions = card.repetitions;
  if (card.easeFactor !== undefined) dbObj.ease_factor = card.easeFactor;
  if (card.dueDate !== undefined) dbObj.due_date = card.dueDate;
  if (card.state !== undefined) dbObj.state = card.state;
  return dbObj;
};

// Helper: Map DB Deck to App Deck
const mapDeckFromDB = (dbDeck: any): Deck => ({
    id: dbDeck.id,
    title: dbDeck.title,
    description: dbDeck.description,
    category: dbDeck.category || 'Custom',
    color: dbDeck.color || '#6366f1',
    cardCount: 0, 
    masteryLevel: dbDeck.mastery_level || 0 
});

export const useDecks = () => {
  const { user, isGuest } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    if (!user) return;
    
    // GUEST MODE
    if (isGuest) {
        if (decks.length === 0) setDecks(mockDecks);
        setLoading(false);
        return;
    }

    // SUPABASE MODE
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setDecks(data.map(mapDeckFromDB));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDecks();
  }, [user, isGuest]);

  const createDeck = async (deck: Partial<Deck>) => {
      if (!user) return { error: 'No user' };
      
      // GUEST MODE
      if (isGuest) {
          const newDeck: Deck = {
              id: `guest-deck-${Date.now()}`,
              title: deck.title || 'Untitled',
              description: deck.description || '',
              category: deck.category || 'Custom',
              color: deck.color || '#6366f1',
              cardCount: 0,
              masteryLevel: 0
          };
          setDecks(prev => [newDeck, ...prev]);
          return { data: newDeck };
      }

      // SUPABASE MODE
      const { data, error } = await supabase.from('decks').insert([
          {
              user_id: user.id,
              title: deck.title,
              description: deck.description,
              category: deck.category,
              color: deck.color
          }
      ]).select();

      if (data) {
          const newDeck = mapDeckFromDB(data[0]);
          setDecks(prev => [newDeck, ...prev]);
          return { data: newDeck };
      }
      return { error };
  };

  return { decks, loading, createDeck, refreshDecks: fetchDecks };
};

export const useCards = () => {
  const { user, isGuest } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    if (!user) return;

    // GUEST MODE
    if (isGuest) {
        if (cards.length === 0) setCards(mockCards);
        setLoading(false);
        return;
    }

    // SUPABASE MODE
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setCards(data.map(mapCardFromDB));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, [user, isGuest]);

  const updateCardSRS = async (cardId: string, updates: Partial<Card>) => {
      // 1. Optimistic UI Update (Works for both Guest and Real)
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));

      // 2. DB Update (Skip if Guest)
      if (isGuest) return;

      const dbUpdates = mapCardToDB(updates);
      const { error } = await supabase
        .from('cards')
        .update(dbUpdates)
        .eq('id', cardId);
      
      if(error) {
          console.error("Failed to update card", error);
      }
  };

  const createCard = async (newCard: Partial<Card>) => {
      if (!user) return { error: 'No user' };

      // GUEST MODE
      if (isGuest) {
          const created: Card = {
              id: `guest-card-${Date.now()}`,
              deckId: newCard.deckId!,
              front: newCard.front || '',
              back: newCard.back || '',
              type: newCard.type || 'standard',
              notes: newCard.notes,
              tags: [],
              interval: 0,
              repetitions: 0,
              easeFactor: 2.5,
              dueDate: new Date().toISOString().split('T')[0],
              state: 'new'
          };
          setCards(prev => [...prev, created]);
          return { data: created };
      }

      // SUPABASE MODE
      const { data, error } = await supabase.from('cards').insert([
          {
              user_id: user.id,
              deck_id: newCard.deckId,
              front: newCard.front,
              back: newCard.back,
              type: newCard.type,
              notes: newCard.notes
          }
      ]).select();

      if (data) {
          const created = mapCardFromDB(data[0]);
          setCards(prev => [...prev, created]);
          return { data: created };
      }
      return { error };
  };

  return { cards, loading, updateCardSRS, createCard, refreshCards: fetchCards };
};