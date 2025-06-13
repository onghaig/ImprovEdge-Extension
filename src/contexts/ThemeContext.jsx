import { createContext, useContext, useEffect, useState } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const ThemeContext = createContext();

const themes = {
  dark: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    widget: 'bg-gray-800/90',
    input: 'bg-gray-700',
    border: 'border-gray-700',
  },
  light: {
    primary: 'bg-gray-100',
    secondary: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    widget: 'bg-white/90',
    input: 'bg-gray-100',
    border: 'border-gray-200',
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const settings = await getStorage('appSettings');
    if (settings?.global?.theme) {
      setTheme(settings.global.theme);
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    const settings = await getStorage('appSettings') || {};
    await setStorage('appSettings', {
      ...settings,
      global: {
        ...settings.global,
        theme: newTheme
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, themes: themes[theme], updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 