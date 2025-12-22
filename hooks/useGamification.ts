import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Flashcard } from '../types';

export interface GamificationStats {
    streakDays: number;
    masteryPercentage: number;
    totalLearned: number;
    matureCount: number;
    learningCount: number;
    newCount: number;
    reviewsToday: number;
}

const DEFAULT_STATS: GamificationStats = {
    streakDays: 0,
    masteryPercentage: 0,
    totalLearned: 0,
    matureCount: 0,
    learningCount: 0,
    newCount: 0,
    reviewsToday: 0
};

export const useGamification = (uid: string | null | undefined) => {
    const [stats, setStats] = useState<GamificationStats>(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setStats(DEFAULT_STATS);
            setLoading(false);
            return;
        }

        // 1. STREAK LISTENER
        const reviewsRef = collection(db, `users/${uid}/reviews`);
        const qReviews = query(reviewsRef, orderBy('reviewedAt', 'desc'), limit(500));

        const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
            const reviewDates = new Set<string>();
            let todayCount = 0;
            
            // Safe Date converter handles Firestore Timestamps, Strings, Numbers, or Date objects
            const toLocalDateStr = (ts: any) => {
                if (!ts) return '';
                let d: Date;
                if (typeof ts.toDate === 'function') {
                    d = ts.toDate();
                } else if (ts instanceof Date) {
                    d = ts;
                } else if (typeof ts === 'string' || typeof ts === 'number') {
                    d = new Date(ts);
                } else {
                    return '';
                }
                if (isNaN(d.getTime())) return '';
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.reviewedAt) {
                    const dateStr = toLocalDateStr(data.reviewedAt);
                    if (dateStr) {
                        reviewDates.add(dateStr);
                        if (dateStr === todayStr) {
                            todayCount++;
                        }
                    }
                }
            });

            // Calculate Streak
            let currentStreak = 0;
            let checkDate = new Date();
            let dateStr = todayStr;
            
            // If no review today, check yesterday to start the streak count
            if (!reviewDates.has(dateStr)) {
                checkDate.setDate(checkDate.getDate() - 1);
                dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            }

            while (reviewDates.has(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
                dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            }

            setStats(prev => ({
                ...prev,
                streakDays: currentStreak,
                reviewsToday: todayCount
            }));
        }, (error) => {
            console.warn("Analytics: Error in Streak Listener (likely permissions or offline):", error);
            // Don't crash, just stop loading
            setLoading(false);
        });

        // 2. MASTERY LISTENER
        const cardsRef = collection(db, `users/${uid}/cards`);
        const unsubscribeCards = onSnapshot(cardsRef, (snapshot) => {
            let total = 0;
            let learned = 0;
            let mature = 0;
            let learning = 0;
            let isNew = 0;

            snapshot.forEach(doc => {
                const c = doc.data();
                total++;
                
                const status = c.status || 'new';
                const interval = c.interval || 0;

                if (status === 'new') {
                    isNew++;
                } else {
                    learned++;
                    if (interval >= 21) {
                        mature++;
                    } else {
                        learning++;
                    }
                }
            });

            const mastery = learned > 0 ? Math.round((mature / learned) * 100) : 0;

            setStats(prev => ({
                ...prev,
                masteryPercentage: mastery,
                totalLearned: learned,
                matureCount: mature,
                learningCount: learning,
                newCount: isNew
            }));
            setLoading(false);
        }, (error) => {
            console.warn("Analytics: Error in Cards Listener:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeReviews();
            unsubscribeCards();
        };
    }, [uid]);

    return { ...stats, loading };
};