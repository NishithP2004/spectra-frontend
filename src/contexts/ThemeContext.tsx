import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const LIGHT_THEME_COLOR = '#4f46e5'; // Indigo-600
const DARK_THEME_COLOR = '#4f46e5';  // Indigo-600

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    return storedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const currentMetaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      if (currentMetaThemeColor) {
        currentMetaThemeColor.setAttribute('content', DARK_THEME_COLOR);
      }
    } else {
      root.classList.remove('dark');
      if (currentMetaThemeColor) {
        currentMetaThemeColor.setAttribute('content', LIGHT_THEME_COLOR);
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 