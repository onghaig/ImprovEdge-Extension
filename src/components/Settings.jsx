import { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from './Notification';
import { clearStorage } from '../utils/storage';
import LayoutAdjuster from './LayoutAdjuster';

export default function Settings({ isOpen, onClose }) {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const { theme, themes, updateTheme } = useTheme();
  const showNotification = useNotification();
  const [activeTab, setActiveTab] = useState('global');
  const fileInputRef = useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const success = await importSettings(e.target.result);
        if (success) {
          showNotification('Settings imported successfully!', 'success');
          onClose();
        } else {
          showNotification('Failed to import settings', 'error');
        }
      } catch (error) {
        showNotification('Invalid settings file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This will clear all your preferences.')) {
      await clearStorage();
      window.location.reload();
    }
  };

  const tabs = [
    {
      id: 'global',
      label: 'Global',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${themes.secondary} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-64 border-r ${themes.border} p-4`}>
            <div className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? `${themes.accent} text-white`
                      : `hover:${themes.accentHover} ${themes.text}`
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={exportSettings}
                className={`w-full px-4 py-2 rounded-lg ${themes.accent} text-white hover:${themes.accentHover}`}
              >
                Export Settings
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-2 rounded-lg ${themes.accent} text-white hover:${themes.accentHover}`}
              >
                Import Settings
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              
              <button
                onClick={resetToDefaults}
                className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Reset to Default
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Save & Apply Changes
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${themes.text}`}>{
                tabs.find(t => t.id === activeTab)?.label
              } Settings</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:${themes.accentHover} ${themes.text}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {activeTab === 'global' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.global.username}
                      onChange={(e) => updateSettings('global', { username: e.target.value })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Time Format
                    </label>
                    <select
                      value={settings.global.timeFormat}
                      onChange={(e) => updateSettings('global', { timeFormat: e.target.value })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => updateTheme(e.target.value)}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'pomodoro' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Focus Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.pomodoro.focusDuration}
                      onChange={(e) => updateSettings('pomodoro', { focusDuration: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Short Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.pomodoro.shortBreakDuration}
                      onChange={(e) => updateSettings('pomodoro', { shortBreakDuration: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Long Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.pomodoro.longBreakDuration}
                      onChange={(e) => updateSettings('pomodoro', { longBreakDuration: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Sessions Until Long Break
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.pomodoro.sessionsUntilLongBreak}
                      onChange={(e) => updateSettings('pomodoro', { sessionsUntilLongBreak: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoStartBreaks"
                      checked={settings.pomodoro.autoStartBreaks}
                      onChange={(e) => updateSettings('pomodoro', { autoStartBreaks: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="autoStartBreaks" className={`text-sm ${themes.text}`}>
                      Auto-start breaks
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoStartPomodoros"
                      checked={settings.pomodoro.autoStartPomodoros}
                      onChange={(e) => updateSettings('pomodoro', { autoStartPomodoros: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="autoStartPomodoros" className={`text-sm ${themes.text}`}>
                      Auto-start pomodoros
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'weather' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themes.text} mb-2`}>
                      Units
                    </label>
                    <select
                      value={settings.weather.units}
                      onChange={(e) => updateSettings('weather', { units: e.target.value })}
                      className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
                    >
                      <option value="imperial">Imperial (°F)</option>
                      <option value="metric">Metric (°C)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoLocation"
                      checked={settings.weather.autoLocation}
                      onChange={(e) => updateSettings('weather', { autoLocation: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="autoLocation" className={`text-sm ${themes.text}`}>
                      Use automatic location
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'layout' && (
                <LayoutAdjuster
                  settings={settings}
                  onLayoutChange={(newGridLayout) => updateSettings('layout', { gridLayout: newGridLayout })}
                  themes={themes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 