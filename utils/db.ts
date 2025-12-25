
import { MasteryRecord, UserSettings, LastSessionState, ExamRecord, CardEdit, DailyStats, QuizSessionRecord } from '../types';

const DB_NAME = 'pnle_smartcards_db';
const DB_VERSION = 9; // Incremented for history support
const STORE_PROGRESS = 'progress';
const STORE_SETTINGS = 'settings';
const STORE_SESSION = 'session';
const STORE_EXAMS = 'exams';
const STORE_QUIZ_SESSIONS = 'quiz_sessions';
const STORE_EDITS = 'card_edits';
const STORE_STATS = 'user_stats';

// New interface for historical tracking
export interface EnhancedDailyStats extends DailyStats {
  history: Record<string, number>; // date (YYYY-MM-DD) -> count
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) db.createObjectStore(STORE_PROGRESS, { keyPath: 'cardId' });
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_SESSION)) db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_EXAMS)) db.createObjectStore(STORE_EXAMS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_QUIZ_SESSIONS)) db.createObjectStore(STORE_QUIZ_SESSIONS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_EDITS)) db.createObjectStore(STORE_EDITS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_STATS)) db.createObjectStore(STORE_STATS, { keyPath: 'id' });
    };
  });
};

export const db = {
  async loadSettings(): Promise<Partial<UserSettings> | null> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_SETTINGS, 'readonly').objectStore(STORE_SETTINGS).get('user_settings');
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
    });
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_SETTINGS, 'readwrite').objectStore(STORE_SETTINGS).put({ id: 'user_settings', value: settings });
  },

  async loadAllProgress(): Promise<Record<string, MasteryRecord>> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_PROGRESS, 'readonly').objectStore(STORE_PROGRESS).getAll();
      request.onsuccess = () => {
        const progressMap: Record<string, MasteryRecord> = {};
        (request.result || []).forEach((item: any) => {
          const { cardId, ...record } = item;
          progressMap[cardId] = record;
        });
        resolve(progressMap);
      };
    });
  },

  async saveCardProgress(cardId: string, record: MasteryRecord): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_PROGRESS, 'readwrite').objectStore(STORE_PROGRESS).put({ cardId, ...record });
  },

  async loadSession(): Promise<LastSessionState | null> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_SESSION, 'readonly').objectStore(STORE_SESSION).get('last_session');
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
    });
  },

  async saveSession(session: LastSessionState): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_SESSION, 'readwrite').objectStore(STORE_SESSION).put({ id: 'last_session', value: session });
  },

  async loadExams(): Promise<ExamRecord[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_EXAMS, 'readonly').objectStore(STORE_EXAMS).getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async saveExam(record: ExamRecord): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_EXAMS, 'readwrite').objectStore(STORE_EXAMS).put(record);
  },

  async loadQuizSessions(): Promise<QuizSessionRecord[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_QUIZ_SESSIONS, 'readonly').objectStore(STORE_QUIZ_SESSIONS).getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async saveQuizSession(record: QuizSessionRecord): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_QUIZ_SESSIONS, 'readwrite').objectStore(STORE_QUIZ_SESSIONS).put(record);
  },

  async loadCardEdits(): Promise<Record<string, CardEdit>> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_EDITS, 'readonly').objectStore(STORE_EDITS).getAll();
      request.onsuccess = () => {
        const editsMap: Record<string, CardEdit> = {};
        (request.result || []).forEach((item: CardEdit) => { editsMap[item.id] = item; });
        resolve(editsMap);
      };
    });
  },

  async saveCardEdit(edit: CardEdit): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_EDITS, 'readwrite').objectStore(STORE_EDITS).put(edit);
  },

  async deleteCardEdit(id: string): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_EDITS, 'readwrite').objectStore(STORE_EDITS).delete(id);
  },

  async loadDailyStats(): Promise<EnhancedDailyStats | null> {
    const db = await openDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_STATS, 'readonly').objectStore(STORE_STATS).get('daily_stats');
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
    });
  },

  async saveDailyStats(stats: EnhancedDailyStats): Promise<void> {
    const db = await openDB();
    db.transaction(STORE_STATS, 'readwrite').objectStore(STORE_STATS).put({ id: 'daily_stats', value: stats });
  },

  async exportBackup(): Promise<string> {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        try {
            const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_EDITS, STORE_STATS], 'readonly');
            const progress = await new Promise((res) => { tx.objectStore(STORE_PROGRESS).getAll().onsuccess = (e: any) => res(e.target.result) });
            const settings = await new Promise((res) => { tx.objectStore(STORE_SETTINGS).get('user_settings').onsuccess = (e: any) => res(e.target.result?.value) });
            const session = await new Promise((res) => { tx.objectStore(STORE_SESSION).get('last_session').onsuccess = (e: any) => res(e.target.result?.value) });
            const exams = await new Promise((res) => { tx.objectStore(STORE_EXAMS).getAll().onsuccess = (e: any) => res(e.target.result) });
            const quizzes = await new Promise((res) => { tx.objectStore(STORE_QUIZ_SESSIONS).getAll().onsuccess = (e: any) => res(e.target.result) });
            const edits = await new Promise((res) => { tx.objectStore(STORE_EDITS).getAll().onsuccess = (e: any) => res(e.target.result) });
            const stats = await new Promise((res) => { tx.objectStore(STORE_STATS).get('daily_stats').onsuccess = (e: any) => res(e.target.result?.value) });

            resolve(JSON.stringify({ timestamp: Date.now(), version: 9, data: { progress, settings, session, exams, quizzes, edits, stats } }, null, 2));
        } catch(e) { reject(e); }
    });
  },

  async importBackup(jsonString: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      try {
        const parsed = JSON.parse(jsonString);
        const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_EDITS, STORE_STATS], 'readwrite');
        tx.objectStore(STORE_PROGRESS).clear();
        tx.objectStore(STORE_SETTINGS).clear();
        tx.objectStore(STORE_SESSION).clear();
        tx.objectStore(STORE_EXAMS).clear();
        tx.objectStore(STORE_QUIZ_SESSIONS).clear();
        tx.objectStore(STORE_EDITS).clear();
        tx.objectStore(STORE_STATS).clear();
        if (Array.isArray(parsed.data.progress)) parsed.data.progress.forEach((item: any) => tx.objectStore(STORE_PROGRESS).put(item));
        if (parsed.data.settings) tx.objectStore(STORE_SETTINGS).put({ id: 'user_settings', value: parsed.data.settings });
        if (parsed.data.session) tx.objectStore(STORE_SESSION).put({ id: 'last_session', value: parsed.data.session });
        if (parsed.data.exams) parsed.data.exams.forEach((item: any) => tx.objectStore(STORE_EXAMS).put(item));
        if (parsed.data.quizzes) parsed.data.quizzes.forEach((item: any) => tx.objectStore(STORE_QUIZ_SESSIONS).put(item));
        if (parsed.data.edits) parsed.data.edits.forEach((item: any) => tx.objectStore(STORE_EDITS).put(item));
        if (parsed.data.stats) tx.objectStore(STORE_STATS).put({ id: 'daily_stats', value: parsed.data.stats });
        tx.oncomplete = () => resolve(true);
      } catch (e) { reject(e); }
    });
  },

  async clearProgress(): Promise<void> {
    const db = await openDB();
    const tx = db.transaction([STORE_PROGRESS, STORE_SESSION, STORE_EXAMS, STORE_QUIZ_SESSIONS, STORE_STATS], 'readwrite');
    tx.objectStore(STORE_PROGRESS).clear();
    tx.objectStore(STORE_SESSION).clear();
    tx.objectStore(STORE_EXAMS).clear();
    tx.objectStore(STORE_QUIZ_SESSIONS).clear();
    tx.objectStore(STORE_STATS).clear();
  }
};
