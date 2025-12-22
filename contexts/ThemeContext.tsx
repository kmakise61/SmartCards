import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, AccentColor } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
  isDark: boolean;
  isCrescere: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pnle_theme') as ThemeMode) || 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('pnle_accent') as AccentColor) || 'rose';
  });

  const isDark = theme === 'dark' || theme === 'midnight';
  const isCrescere = theme === 'midnight';

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('pnle_theme', mode);
  };

  const setAccent = (color: AccentColor) => {
    setAccentState(color);
    localStorage.setItem('pnle_accent', color);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    root.classList.add(theme);
    
    if (theme === 'midnight') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else if (theme === 'dark') {
      document.body.style.backgroundColor = '#0a0f1c';
    } else {
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors: Record<AccentColor, string> = {
        rose: '236 72 153',
        blue: '59 130 246',
        gold: '245 158 11',
        emerald: '16 185 129',
        violet: '139 92 246',
    };
    root.style.setProperty('--accent-rgb', colors[accent]);
    root.style.setProperty('--on-accent-rgb', '255 255 255');
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      accent,
      setAccent,
      isDark,
      isCrescere
    }}>
      {children}
    </ThemeContext.Provider>
  );
};