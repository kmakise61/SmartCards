import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'crescere';
export type FontSize = 'small' | 'normal' | 'large' | 'extra-large';
export type FontFamily = 'sans' | 'serif' | 'mono';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  accentColor: string;
  fontSize: FontSize;
  fontFamily: FontFamily;
  reduceMotion: boolean;
  
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setAccentColor: (hex: string) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setReduceMotion: (reduce: boolean) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- COLOR UTILS ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 99, g: 102, b: 241 }; // Default Indigo
};

// Linear interpolation for color mixing
const mix = (c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}, weight: number) => {
    return `${Math.round(c1.r * (1 - weight) + c2.r * weight)} ${Math.round(c1.g * (1 - weight) + c2.g * weight)} ${Math.round(c1.b * (1 - weight) + c2.b * weight)}`;
};

const updateCssVariables = (hex: string, mode: ThemeMode) => {
    const root = document.documentElement;
    const base = hexToRgb(hex);
    const white = {r: 255, g: 255, b: 255};
    const black = {r: 0, g: 0, b: 0};

    // 1. Generate Primary Palette (RGB values for Tailwind opacity support)
    root.style.setProperty('--primary', `${base.r} ${base.g} ${base.b}`); 
    
    // Generate Tints (Mixing with White)
    root.style.setProperty('--primary-50', mix(base, white, 0.95));
    root.style.setProperty('--primary-100', mix(base, white, 0.9));
    root.style.setProperty('--primary-200', mix(base, white, 0.8));
    
    // Generate Shades (Mixing with Black)
    root.style.setProperty('--primary-600', mix(base, black, 0.1));
    root.style.setProperty('--primary-700', mix(base, black, 0.2));
    root.style.setProperty('--primary-800', mix(base, black, 0.3));

    // 2. Theme Specific Harmonization
    if (mode === 'dark') {
      // Modern Dark (Zinc/Slate based)
      root.style.setProperty('--bg-app', '#09090b'); // Zinc 950
      root.style.setProperty('--bg-panel', 'rgba(24, 24, 27, 0.65)'); // Zinc 900 + Glass
      
      root.style.setProperty('--text-main', '#fafafa');
      root.style.setProperty('--text-muted', '#a1a1aa'); // Zinc 400
      
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--glass-shine', 'rgba(255, 255, 255, 0.03)');
      
      // Auto-generate accent: Slightly lighter than primary for dark mode visibility
      const accentRgb = mix(base, white, 0.15); 
      root.style.setProperty('--accent', `rgb(${accentRgb.split(' ').join(',')})`);

    } else if (mode === 'crescere') {
      // Luxury Rose/Gold (Specific Override)
      root.style.setProperty('--bg-app', '#1a0b12'); // Deep Rose Black
      root.style.setProperty('--bg-panel', 'rgba(60, 20, 35, 0.55)'); 
      
      root.style.setProperty('--text-main', '#fff1f2'); // Rose 50
      root.style.setProperty('--text-muted', '#fecdd3'); // Rose 200
      
      root.style.setProperty('--border-color', 'rgba(255, 228, 230, 0.12)');
      root.style.setProperty('--glass-shine', 'rgba(255, 200, 210, 0.08)');
      
      root.style.setProperty('--accent', '#d946ef'); // Fuchsia

    } else {
      // Modern Light (Cool Gray/Blue based)
      root.style.setProperty('--bg-app', '#f0f2f5'); // Clean Gray
      root.style.setProperty('--bg-panel', 'rgba(255, 255, 255, 0.72)');
      
      root.style.setProperty('--text-main', '#1e293b'); // Slate 800
      root.style.setProperty('--text-muted', '#64748b'); // Slate 500
      
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--glass-shine', 'rgba(255, 255, 255, 0.5)');
      
      // Auto-generate accent: Slightly darker for light mode contrast
      const accentRgb = mix(base, black, 0.1);
      root.style.setProperty('--accent', `rgb(${accentRgb.split(' ').join(',')})`);
    }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pnle_theme_mode');
      if (saved === 'crescere' || saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [userAccentColor, setUserAccentColor] = useState(() => {
      return localStorage.getItem('pnle_accent_color') || '#6366f1'; // Default Indigo-500
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
      return (localStorage.getItem('pnle_font_size') as FontSize) || 'normal';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
      return (localStorage.getItem('pnle_font_family') as FontFamily) || 'sans';
  });

  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
      return localStorage.getItem('pnle_reduce_motion') === 'true';
  });

  // COMPUTED
  const isDark = themeMode === 'dark';
  // If Crescere, force Rose. Else use user preference.
  const activeAccentColor = themeMode === 'crescere' ? '#f43f5e' : userAccentColor;

  // --- EFFECTS ---
  
  // 1. Theme Mode Classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-crescere', 'theme-light');
    
    if (themeMode === 'crescere') {
      root.classList.add('dark', 'theme-crescere');
    } else if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('theme-light');
    }
    
    localStorage.setItem('pnle_theme_mode', themeMode);
  }, [themeMode]);

  // 2. CSS Variables (The Engine)
  useEffect(() => {
      updateCssVariables(activeAccentColor, themeMode);
      localStorage.setItem('pnle_accent_color', userAccentColor);
  }, [activeAccentColor, userAccentColor, themeMode]);

  // 3. Accessibility & Typography
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    root.setAttribute('data-font-family', fontFamily);
    
    if (reduceMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');

    localStorage.setItem('pnle_font_size', fontSize);
    localStorage.setItem('pnle_font_family', fontFamily);
    localStorage.setItem('pnle_reduce_motion', String(reduceMotion));
  }, [fontSize, fontFamily, reduceMotion]);

  // --- ACTIONS ---

  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);

  const toggleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('crescere');
    else setThemeMode('light');
  };
  
  const setAccentColor = (hex: string) => setUserAccentColor(hex);
  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setFontFamily = (family: FontFamily) => setFontFamilyState(family);
  const setReduceMotion = (reduce: boolean) => setReduceMotionState(reduce);

  const resetTheme = () => {
      setUserAccentColor('#6366f1'); 
      setThemeMode('dark');
      setFontSizeState('normal');
      setFontFamilyState('sans');
      setReduceMotionState(false);
  }

  return (
    <ThemeContext.Provider value={{ 
        themeMode, isDark, 
        accentColor: activeAccentColor,
        fontSize, fontFamily, reduceMotion,
        setThemeMode, toggleTheme, 
        setAccentColor,
        setFontSize, setFontFamily, setReduceMotion,
        resetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};