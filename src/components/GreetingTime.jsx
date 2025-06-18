import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { getStorage, setStorage } from '../utils/storage';
import WelcomeDialog from './WelcomeDialog';

export default function GreetingTime({ onStartPomodoro }) {
  const { settings } = useSettings();
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [dailyTask, setDailyTask] = useState(null);
  const [dailyGoal, setDailyGoal] = useState('');

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Load daily task
    loadDailyTask();

    // Load daily goal
    loadDailyGoal();

    return () => clearInterval(timer);
  }, []);

  const loadDailyTask = async () => {
    const task = await getStorage('dailyTask');
    if (task?.date === new Date().toDateString()) {
      setDailyTask(task);
    }
  };

  const loadDailyGoal = async () => {
    const goal = await getStorage('dailyGoal');
    const today = new Date().toDateString();
    if (goal?.date === today) {
      setDailyGoal(goal.text);
    }
  };

  useEffect(() => {
    const hour = time.getHours();
    let newGreeting;

    if (hour < 12) {
      newGreeting = 'morning';
    } else if (hour < 18) {
      newGreeting = 'afternoon';
    } else {
      newGreeting = 'evening';
    }

    setGreeting(newGreeting);
  }, [time]);

  const formatTime = () => {
    if (settings.global.timeFormat === '12h') {
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeOfDayEmoji = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) return '🌅'; // Morning
    if (hour >= 12 && hour < 17) return '☀️'; // Afternoon
    if (hour >= 17 && hour < 20) return '🌇'; // Evening
    return '🌙'; // Night
  };

  const getMotivationalMessage = () => {
    const hour = time.getHours();
    if (hour < 10) {
      return "Start your day with purpose!";
    } else if (hour < 12) {
      return "Make the most of your morning!";
    } else if (hour < 15) {
      return "Keep up the great work!";
    } else if (hour < 18) {
      return "You're doing great today!";
    } else if (hour < 21) {
      return "Finish strong!";
    } else {
      return "Time to wind down and reflect.";
    }
  };

  const handleWelcomeComplete = ({ name, task, startPomodoro }) => {
    if (startPomodoro && onStartPomodoro) {
      onStartPomodoro(task);
    }
  };

  const handleChangeFocus = async () => {
    const newFocus = prompt('What is your main focus for today?');
    if (newFocus) {
      setDailyGoal(newFocus);
      await setStorage('dailyGoal', {
        text: newFocus,
        date: new Date().toDateString()
      });
      
      // Add to todo list
      const todos = await getStorage('todos') || [];
      const today = new Date().toDateString();
      
      // Remove any existing daily goal from todos
      const filteredTodos = todos.filter(todo => !todo.isDailyGoal);
      
      // Add new daily goal
      filteredTodos.unshift({
        id: Date.now(),
        text: newFocus,
        completed: false,
        isDailyGoal: true,
        date: today
      });
      
      await setStorage('todos', filteredTodos);
    }
  };

  return (
    <>
      <WelcomeDialog onComplete={handleWelcomeComplete} />
      <div className="p-4 rounded-lg bg-gray-800/90">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Good {greeting}, {settings.global.username || 'there'}!</h2>
          <span className="text-2xl">{getTimeOfDayEmoji()}</span>
        </div>
        
        <div className="text-3xl font-bold mb-2">{formatTime()}</div>
        <div className="text-sm text-gray-400 mb-4">{formatDate(time)}</div>
        
        <p className="text-gray-400 mb-4">{getMotivationalMessage()}</p>

        {dailyTask ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Today's focus:</div>
                <div className="font-medium">{dailyTask.text}</div>
              </div>
              <button
                onClick={() => onStartPomodoro(dailyTask.text)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Start Focus Timer
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            Today's Focus: {dailyGoal || 'Not set'}
          </div>
        )}

        <button
          onClick={handleChangeFocus}
          className="text-gray-400 hover:text-gray-300"
        >
          ✍️
        </button>
      </div>
    </>
  );
} 