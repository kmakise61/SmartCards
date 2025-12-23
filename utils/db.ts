import { MasteryRecord, UserSettings, LastSessionState } from '../types';

const DB_NAME = 'pnle_smartcards_db';
const DB_VERSION = 1;
const STORE_PROGRESS = 'progress';
const STORE_SETTINGS = 'settings';
const STORE_SESSION = 'session';

interface DBSchema {
  progress: MasteryRecord & { cardId: string };
  settings: UserSettings;
  session: LastSessionState;
}

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
      
      // Store for Card Mastery Progress
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: 'cardId' });
      }

      // Store for User Settings
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }

      // Store for Last Session
      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
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
        // Transform array back to Record<string, MasteryRecord>
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

  // --- BACKUP & RESTORE ---
  async exportBackup(): Promise<string> {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        try {
            const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION], 'readonly');
            
            const progressReq = tx.objectStore(STORE_PROGRESS).getAll();
            const settingsReq = tx.objectStore(STORE_SETTINGS).get('user_settings');
            const sessionReq = tx.objectStore(STORE_SESSION).get('last_session');

            const progress = await new Promise((res) => { progressReq.onsuccess = () => res(progressReq.result) });
            const settings = await new Promise((res) => { settingsReq.onsuccess = () => res(settingsReq.result?.value) });
            const session = await new Promise((res) => { sessionReq.onsuccess = () => res(sessionReq.result?.value) });

            const backup = {
                timestamp: Date.now(),
                version: 1,
                data: { progress, settings, session }
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
        if (!parsed.data || !parsed.data.progress) {
          throw new Error("Invalid backup file format");
        }

        const tx = db.transaction([STORE_PROGRESS, STORE_SETTINGS, STORE_SESSION], 'readwrite');
        
        // Clear existing data
        tx.objectStore(STORE_PROGRESS).clear();
        tx.objectStore(STORE_SETTINGS).clear();
        tx.objectStore(STORE_SESSION).clear();

        // Restore Progress
        const pStore = tx.objectStore(STORE_PROGRESS);
        if (Array.isArray(parsed.data.progress)) {
           parsed.data.progress.forEach((item: any) => pStore.put(item));
        }

        // Restore Settings
        if (parsed.data.settings) {
           tx.objectStore(STORE_SETTINGS).put({ id: 'user_settings', value: parsed.data.settings });
        }

        // Restore Session
        if (parsed.data.session) {
           tx.objectStore(STORE_SESSION).put({ id: 'last_session', value: parsed.data.session });
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);

      } catch (e) {
        reject(e);
      }
    });
  }
};