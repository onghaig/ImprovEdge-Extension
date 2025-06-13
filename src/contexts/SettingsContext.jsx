import { createContext, useContext, useEffect, useState } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const SettingsContext = createContext();

const defaultSettings = {
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  },
  weather: {
    units: 'imperial',
    autoLocation: true,
    manualLocation: {
      city: '',
      country: '',
    },
    updateFrequency: 3600000,
  },
  quotes: {
    categories: ['motivational', 'technical', 'trivia'],
    updateFrequency: 'daily',
    includeKeywords: [],
    excludeKeywords: [],
  },
  layout: {
    gridLayout: {
      greeting: { x: 0, y: 0, w: 1, h: 1 },
      search: { x: 1, y: 0, w: 2, h: 1 },
      todo: { x: 0, y: 1, w: 1, h: 1 },
      weather: { x: 1, y: 1, w: 1, h: 1 },
      quote: { x: 2, y: 1, w: 1, h: 1 },
      pomodoro: { x: 0, y: 2, w: 3, h: 1 },
    },
  },
  global: {
    username: '',
    timeFormat: '24h',
    theme: 'dark',
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getStorage('appSettings');
      if (savedSettings) {
        setSettings(mergeSettings(defaultSettings, savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeSettings = (defaults, saved) => {
    // Deep merge that ensures all default fields exist
    const merged = { ...defaults };
    for (const key in saved) {
      if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        merged[key] = mergeSettings(defaults[key], saved[key]);
      } else {
        merged[key] = saved[key];
      }
    }
    return merged;
  };

  const updateSettings = async (category, updates) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        ...updates
      }
    };
    setSettings(newSettings);
    await setStorage('appSettings', newSettings);
    return newSettings;
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    await setStorage('appSettings', defaultSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'improvedge-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = async (jsonString) => {
    try {
      const importedSettings = JSON.parse(jsonString);
      const mergedSettings = mergeSettings(defaultSettings, importedSettings);
      setSettings(mergedSettings);
      await setStorage('appSettings', mergedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  const value = {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {isLoading ? <div style={{padding:'2rem',textAlign:'center'}}>Loading settings...</div> : children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 