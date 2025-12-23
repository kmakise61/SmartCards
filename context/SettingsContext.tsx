
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, AccentPreset } from '../types';
import { db } from '../utils/db';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  accent: 'pink',
  softMode: false,
  sortByLowest: false,
  autoAdvance: true,
  showKeyboardHints: true,
  showCardNumbers: true,
  autoResume: true,
};

const ACCENT_COLORS: Record<AccentPreset, { main: string; soft: string; glow: string }> = {
  pink: { main: '#F472B6', soft: 'rgba(244, 114, 182, 0.1)', glow: 'rgba(244, 114, 182, 0.3)' },
  rose: { main: '#FB7185', soft: 'rgba(251, 113, 133, 0.1)', glow: 'rgba(251, 113, 133, 0.3)' },
  violet: { main: '#A78BFA', soft: 'rgba(167, 139, 250, 0.1)', glow: 'rgba(167, 139, 250, 0.3)' },
  cyan: { main: '#22D3EE', soft: 'rgba(34, 211, 238, 0.1)', glow: 'rgba(34, 211, 238, 0.3)' },
};

const SOFT_MODE_ACCENT = { main: '#0D9488', soft: 'rgba(13, 148, 136, 0.1)', glow: 'rgba(13, 148, 136, 0.3)' }; // Teal-600

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to convert Hex to RGB string (e.g. "255, 0, 0")
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
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
    const colors = settings.softMode ? SOFT_MODE_ACCENT : ACCENT_COLORS[settings.accent];
    const root = document.documentElement;
    
    root.style.setProperty('--accent', colors.main);
    root.style.setProperty('--accent-soft', colors.soft);
    root.style.setProperty('--accent-glow', colors.glow);
    
    // Set RGB components for rgba() usage in CSS
    const rgb = hexToRgb(colors.main);
    root.style.setProperty('--accent-rgb', rgb);
    
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      // Fire and forget save
      db.saveSettings(newSettings).catch(e => console.error("Failed to save settings", e));
      return newSettings;
    });
  };

  if (!loaded) return null; // Or a loading spinner if preferred

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
