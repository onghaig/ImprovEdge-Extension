import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from './Notification';

const PomodoroTimer = forwardRef((props, ref) => {
  const { settings } = useSettings();
  const showNotification = useNotification();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [currentTask, setCurrentTask] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));

  useEffect(() => {
    // Reset timer when mode changes
    switch (mode) {
      case 'focus':
        setTimeLeft(settings.pomodoro.focusDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.pomodoro.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.pomodoro.longBreakDuration * 60);
        break;
    }
  }, [mode, settings.pomodoro]);

  // Reset sessions when settings change
  useEffect(() => {
    setCompletedSessions(0);
  }, [settings.pomodoro.sessionsUntilLongBreak]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    startTimer: (task) => {
      setCurrentTask(task);
      setMode('focus');
      setIsRunning(true);
      startCountdown();
    },
    resetSessions: () => {
      setCompletedSessions(0);
      setMode('focus');
      setIsRunning(false);
      setTimeLeft(settings.pomodoro.focusDuration * 60);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }));

  const startCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          handleTimerComplete();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  };

  const handleTimerComplete = () => {
    clearInterval(intervalRef.current);
    // Play notification sound or fallback beep
    if (audioRef.current && audioRef.current.src && !audioRef.current.error) {
      audioRef.current.play().catch(() => playBeep());
    } else {
      playBeep();
    }

    if (mode === 'focus') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      showNotification(
        `Focus session complete! Time for a ${
          newCompletedSessions % settings.pomodoro.sessionsUntilLongBreak === 0
            ? 'long'
            : 'short'
        } break.`,
        'success'
      );

      if (newCompletedSessions % settings.pomodoro.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        if (settings.pomodoro.autoStartBreaks) {
          startCountdown();
        } else {
          setIsRunning(false);
        }
      } else {
        setMode('shortBreak');
        if (settings.pomodoro.autoStartBreaks) {
          startCountdown();
        } else {
          setIsRunning(false);
        }
      }
    } else {
      showNotification('Break complete! Ready to focus?', 'success');
      setMode('focus');
      if (settings.pomodoro.autoStartPomodoros) {
        startCountdown();
      } else {
        setIsRunning(false);
      }
    }
  };

  // Fallback beep function
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
    } else {
      startCountdown();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    switch (mode) {
      case 'focus':
        setTimeLeft(settings.pomodoro.focusDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.pomodoro.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.pomodoro.longBreakDuration * 60);
        break;
    }
  };

  const skipTimer = () => {
    setTimeLeft(0);
    handleTimerComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    let total;
    switch (mode) {
      case 'focus':
        total = settings.pomodoro.focusDuration * 60;
        break;
      case 'shortBreak':
        total = settings.pomodoro.shortBreakDuration * 60;
        break;
      case 'longBreak':
        total = settings.pomodoro.longBreakDuration * 60;
        break;
    }
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="p-4 rounded-lg bg-gray-800/90">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {mode === 'focus' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </h2>
        <div className="text-sm text-gray-400">
          Session {completedSessions + 1}/{settings.pomodoro.sessionsUntilLongBreak}
        </div>
      </div>

      {currentTask && (
        <div className="mb-4 text-sm">
          <span className="text-gray-400">Current task:</span>
          <span className="ml-2">{currentTask}</span>
        </div>
      )}

      <div className="relative mb-4">
        <div className="text-4xl font-bold text-center mb-2">
          {formatTime(timeLeft)}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${getProgressPercent()}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className={`px-4 py-2 rounded-lg ${
            isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={skipTimer}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {['focus', 'shortBreak', 'longBreak'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setIsRunning(false);
              clearInterval(intervalRef.current);
            }}
            className={`px-3 py-1 rounded-lg text-sm ${
              mode === m
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } transition-colors`}
          >
            {m === 'focus'
              ? 'Focus'
              : m === 'shortBreak'
              ? 'Short Break'
              : 'Long Break'}
          </button>
        ))}
      </div>
    </div>
  );
});

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer; 