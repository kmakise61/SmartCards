
import { MasteryRecord, UserSettings, LastSessionState, ExamRecord, CardEdit, DailyStats, QuizSessionRecord } from '../types';

const DB_NAME = 'pnle_smartcards_db';
const DB_VERSION = 8; // Incremented for quiz_sessions
const STORE_PROGRESS = 'progress';
const STORE_SETTINGS = 'settings';
const STORE_SESSION = 'session';
const STORE_EXAMS = 'exams';
const STORE_QUIZ_SESSIONS = 'quiz_sessions'; // New store
const STORE_EDITS = 'card_edits';
const STORE_STATS = 'user_stats';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: 'cardId' });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_EXAMS)) {
        db.createObjectStore(STORE_EXAMS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_QUIZ_SESSIONS)) {
        db.createObjectStore(STORE_QUIZ_SESSIONS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_EDITS)) {
        db.createObjectStore(STORE_EDITS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_STATS)) {
        db.createObjectStore(STORE_STATS, { keyPath: 'id' });
      }
    };
  });
};

export const db = {
  // --- SETTINGS ---
  async loadSettings(): Promise<Partial<UserSettings> | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SETTINGS, 'readonly');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.get('user_settings');

      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.put({ id: 'user_settings', value: settings });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- PROGRESS ---
  async loadAllProgress(): Promise<Record<string, MasteryRecord>> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROGRESS, 'readonly');
      const store = transaction.objectStore(STORE_PROGRESS);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result || [];
        const progressMap: Record<string, MasteryRecord> = {};
        result.forEach((item: any) => {
          const { cardId, ...record } = item;
          progressMap[cardId] = record;
        });
        resolve(progressMap);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveCardProgress(cardId: string, record: MasteryRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROGRESS, 'readwrite');
      const store = transaction.objectStore(STORE_PROGRESS);
      const request = store.put({ cardId, ...record });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- SESSION ---
  async loadSession(): Promise<LastSessionState | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SESSION, 'readonly');
      const store = transaction.objectStore(STORE_SESSION);
      const request = store.get('last_session');

      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  },

  async saveSession(session: LastSessionState): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SESSION, 'readwrite');
      const store = transaction.objectStore(STORE_SESSION);
      const request = store.put({ id: 'last_session', value: session });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- EXAMS ---
  async loadExams(): Promise<ExamRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_EXAMS, 'readonly');
      const store = transaction.objectStore(STORE_EXAMS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async saveExam(record: ExamRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_EXAMS, 'readwrite');
      const store = transaction.objectStore(STORE_EXAMS);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- QUIZ SESSIONS (NEW) ---
  async loadQuizSessions(): Promise<QuizSessionRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_QUIZ_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORE_QUIZ_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async saveQuizSession(record: QuizSessionRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_QUIZ_SESSIONS, 'readwrite');
      const store = transaction.objectStore(STORE_QUIZ_SESSIONS);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- CARD EDITS ---
  async loadCardEdits(): Promise<Record<string, CardEdit>> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_EDITS, 'readonly');
      const store = transaction.objectStore(STORE_EDITS);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result || [];
        const editsMap: Record<string, CardEdit> = {};
        result.forEach((item: CardEdit) => {
          editsMap[item.id] = item;
        });
        resolve(editsMap);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveCardEdit(edit: CardEdit): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_EDITS, 'readwrite');
      const store = transaction.objectStore(STORE_EDITS);
      const request = store.put(edit);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteCardEdit(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_EDITS, 'readwrite');
      const store = transaction.objectStore(STORE_EDITS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- DAILY STATS (NEW) ---
  async loadDailyStats(): Promise<DailyStats | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_STATS, 'readonly');
      const store = transaction.objectStore(STORE_STATS);
      const request = store.get('daily_stats');

      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  },

  async saveDailyStats(stats: DailyStats): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_STATS, 'readwrite');
      const store = transaction.objectStore(STORE_STATS);
      const request = store.put({ id: 'daily_stats', value: stats });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- BACKUP & RESTORE ---
  async exportBackup(): Promise<string> {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        try {
            const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_EDITS, STORE_STATS], 'readonly');
            
            const progressReq = tx.objectStore(STORE_PROGRESS).getAll();
            const settingsReq = tx.objectStore(STORE_SETTINGS).get('user_settings');
            const sessionReq = tx.objectStore(STORE_SESSION).get('last_session');
            const examsReq = tx.objectStore(STORE_EXAMS).getAll();
            const quizReq = tx.objectStore(STORE_QUIZ_SESSIONS).getAll();
            const editsReq = tx.objectStore(STORE_EDITS).getAll();
            const statsReq = tx.objectStore(STORE_STATS).get('daily_stats');

            const progress = await new Promise((res) => { progressReq.onsuccess = () => res(progressReq.result) });
            const settings = await new Promise((res) => { settingsReq.onsuccess = () => res(settingsReq.result?.value) });
            const session = await new Promise((res) => { sessionReq.onsuccess = () => res(sessionReq.result?.value) });
            const exams = await new Promise((res) => { examsReq.onsuccess = () => res(examsReq.result) });
            const quizzes = await new Promise((res) => { quizReq.onsuccess = () => res(quizReq.result) });
            const edits = await new Promise((res) => { editsReq.onsuccess = () => res(editsReq.result) });
            const stats = await new Promise((res) => { statsReq.onsuccess = () => res(statsReq.result?.value) });

            const backup = {
                timestamp: Date.now(),
                version: 8,
                data: { progress, settings, session, exams, quizzes, edits, stats }
            };
            resolve(JSON.stringify(backup, null, 2));
        } catch(e) { reject(e); }
    });
  },

  async importBackup(jsonString: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.data) {
          throw new Error("Invalid backup file format");
        }

        const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_EDITS, STORE_STATS], 'readwrite');
        
        tx.objectStore(STORE_PROGRESS).clear();
        tx.objectStore(STORE_SETTINGS).clear();
        tx.objectStore(STORE_SESSION).clear();
        tx.objectStore(STORE_EXAMS).clear();
        tx.objectStore(STORE_QUIZ_SESSIONS).clear();
        tx.objectStore(STORE_EDITS).clear();
        tx.objectStore(STORE_STATS).clear();

        const pStore = tx.objectStore(STORE_PROGRESS);
        if (Array.isArray(parsed.data.progress)) {
           parsed.data.progress.forEach((item: any) => pStore.put(item));
        }

        if (parsed.data.settings) {
           tx.objectStore(STORE_SETTINGS).put({ id: 'user_settings', value: parsed.data.settings });
        }

        if (parsed.data.session) {
           tx.objectStore(STORE_SESSION).put({ id: 'last_session', value: parsed.data.session });
        }

        const eStore = tx.objectStore(STORE_EXAMS);
        if (parsed.data.exams && Array.isArray(parsed.data.exams)) {
           parsed.data.exams.forEach((item: any) => eStore.put(item));
        }

        const qStore = tx.objectStore(STORE_QUIZ_SESSIONS);
        if (parsed.data.quizzes && Array.isArray(parsed.data.quizzes)) {
           parsed.data.quizzes.forEach((item: any) => qStore.put(item));
        }

        const editsStore = tx.objectStore(STORE_EDITS);
        if (parsed.data.edits && Array.isArray(parsed.data.edits)) {
           parsed.data.edits.forEach((item: any) => editsStore.put(item));
        }

        if (parsed.data.stats) {
           tx.objectStore(STORE_STATS).put({ id: 'daily_stats', value: parsed.data.stats });
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);

      } catch (e) {
        reject(e);
      }
    });
  },

  // --- RESET ---
  async clearProgress(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PROGRESS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_STATS], 'readwrite');
      
      transaction.objectStore(STORE_PROGRESS).clear();
      transaction.objectStore(STORE_SESSION).clear();
      transaction.objectStore(STORE_EXAMS).clear();
      transaction.objectStore(STORE_QUIZ_SESSIONS).clear();
      transaction.objectStore(STORE_STATS).clear();
      // NOTE: We do NOT clear edits on "Clear Progress". Edits are considered content customization.

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};