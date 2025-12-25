
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { db } from '../utils/db';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  accent: '#F472B6', // Default Pink-400
  softMode: false,
  sortByLowest: false,
  autoAdvance: true,
  showKeyboardHints: true,
  showCardNumbers: true,
  autoResume: true,
  voiceURI: undefined,
  speechRate: 1.1,
  speechPitch: 1.0,
  targetExamDate: undefined,
  dailyGoal: 50, // Default 50 cards
};

const SOFT_MODE_ACCENT = '#0D9488'; // Teal-600

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to convert Hex to RGB string (e.g. "255, 0, 0")
const hexToRgb = (hex: string) => {
  let c: any;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length === 3){
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return [(c>>16)&255, (c>>8)&255, c&255].join(',');
  }
  return '0, 0, 0';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Initial Load from IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await db.loadSettings();
        if (saved) {
          // Merge saved settings with defaults to ensure all fields exist
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        }
      } catch (e) {
        console.error("Failed to load settings from DB", e);
      } finally {
        setLoaded(true);
      }
    };
    init();
  }, []);

  // Effect to update CSS variables whenever settings change
  useEffect(() => {
    let mainColor = settings.accent;
    
    // Override if soft mode is active
    if (settings.softMode) {
        mainColor = SOFT_MODE_ACCENT;
    }

    // Fallback if invalid color
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(mainColor)) {
        mainColor = DEFAULT_SETTINGS.accent;
    }

    const rgb = hexToRgb(mainColor);
    const root = document.documentElement;
    
    root.style.setProperty('--accent', mainColor);
    root.style.setProperty('--accent-rgb', rgb);
    root.style.setProperty('--accent-soft', `rgba(${rgb}, 0.1)`);
    root.style.setProperty('--accent-glow', `rgba(${rgb}, 0.3)`);
    
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      // Fire and forget save
      db.saveSettings(newSettings).catch(e => console.error("Failed to save settings", e));
      return newSettings;
    });
  };

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};