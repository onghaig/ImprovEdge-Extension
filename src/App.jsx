import React, { useState, useEffect, useRef } from 'react';
import SearchAndCalendar from './components/SearchAndCalendar';
import TodoWidget from './components/TodoWidget';
import WeatherSnapshot from './components/WeatherSnapshot';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import WallpaperRotator from './components/WallpaperRotator';
import GreetingTime from './components/GreetingTime';
import PomodoroTimer from './components/PomodoroTimer';
import FocusButton from './components/FocusButton';
import Settings from './components/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './components/Notification';
import { useTheme } from './contexts/ThemeContext';
import { useSettings } from './contexts/SettingsContext';
import { getStorage, setStorage } from './utils/storage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log errorInfo here
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding:'2rem',color:'red'}}>Something went wrong: {this.state.error?.message || 'Unknown error'}</div>;
    }
    return this.props.children;
  }
}

function AppContent() {
  const { themes } = useTheme();
  const { settings } = useSettings();
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [wallpaper, setWallpaper] = useState('');
  const [dailyTaskAdded, setDailyTaskAdded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pomodoroRef = useRef(null);
  const todoRef = useRef(null);

  useEffect(() => {
    if (!dailyTaskAdded) {
      loadDailyTask();
    }
    // Check for daily focus popup
    checkDailyFocusPopup();
  }, [dailyTaskAdded]);

  const loadDailyTask = async () => {
    const dailyGoal = await getStorage('dailyGoal');
    const today = new Date().toDateString();
    
    if (dailyGoal?.date === today) {
      // Display the daily goal somewhere in the UI if needed
      console.log('Today\'s goal:', dailyGoal.text);
    }
  };

  const checkDailyFocusPopup = async () => {
    const lastFocus = await getStorage('lastFocusPrompt');
    const today = new Date().toDateString();
    if (!lastFocus || lastFocus.date !== today) {
      const newFocus = prompt('What is your main focus for today?');
      if (newFocus) {
        await setStorage('dailyGoal', {
          text: newFocus,
          date: today
        });
        await setStorage('lastFocusPrompt', {
          date: today
        });
      }
    }
  };

  const handleWidgetVisibility = (widgetsToHide) => {
    setHiddenWidgets(widgetsToHide || []);
  };

  const handleWallpaperChange = (newWallpaper) => {
    setWallpaper(newWallpaper);
  };

  const handleStartPomodoro = (task) => {
    if (pomodoroRef.current) {
      setHiddenWidgets(widgets => {
        const newWidgets = widgets.filter(w => w !== 'pomodoro');
        return newWidgets;
      });
      pomodoroRef.current.startTimer(task);
    }
  };

  const isWidgetVisible = (widgetId) => !hiddenWidgets?.includes(widgetId);

  // Get layout for each widget from settings
  const getWidgetStyle = (widgetId) => {
    const layout = settings.layout.gridLayout[widgetId];
    return layout ? {
      gridColumn: `span ${layout.w}`,
      gridRow: `span ${layout.h}`,
      order: layout.y * 3 + layout.x // Convert 2D position to 1D order
    } : {};
  };

  return (
    <div 
      className={`min-h-screen relative bg-cover bg-center bg-no-repeat transition-all duration-1000 ${themes.primary}`}
      style={{ 
        backgroundImage: wallpaper ? `url(${wallpaper})` : 'none',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className={`relative z-10 container mx-auto px-4 py-8 ${themes.text}`}>
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`fixed top-4 right-4 p-2 rounded-full ${themes.secondary} ${themes.accentHover} transition-colors`}
          title="Open Settings"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`${isWidgetVisible('greeting') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('greeting')}>
            <GreetingTime onStartPomodoro={handleStartPomodoro} />
          </div>
          
          <div className={`${isWidgetVisible('search') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('search')}>
            <SearchAndCalendar />
          </div>
          
          <div className={`${isWidgetVisible('todo') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('todo')}>
            <TodoWidget ref={todoRef} pomodoroRef={pomodoroRef} />
          </div>
          
          <div className={`${isWidgetVisible('weather') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('weather')}>
            <WeatherSnapshot />
          </div>
          
          <div className={`${isWidgetVisible('quote') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('quote')}>
            <QuoteOfTheDay />
          </div>
          
          <div className={`${isWidgetVisible('pomodoro') ? '' : 'hidden'} ${themes.widget}`} style={getWidgetStyle('pomodoro')}>
            <PomodoroTimer ref={pomodoroRef} />
          </div>
        </div>
        
        <FocusButton onToggleFocus={handleWidgetVisibility} focusedWidget={hiddenWidgets} />
        <WallpaperRotator onWallpaperChange={handleWallpaperChange} />
        
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SettingsProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 