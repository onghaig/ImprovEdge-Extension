import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from './Notification';
import { getStorage, setStorage } from '../utils/storage';

export default function WelcomeDialog() {
  const { settings, updateSettings } = useSettings();
  const showNotification = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: settings.global.username || '',
    dailyTask: '',
    focusTime: settings.pomodoro.focusDuration,
    breakTime: settings.pomodoro.shortBreakDuration,
    weatherLocation: settings.weather.manualLocation.city,
  });

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    const lastWelcome = await getStorage('lastWelcome');
    
    if (!lastWelcome) {
      setIsOpen(true);
      // Prompt for location during initial setup
      promptForLocation();
    }
  };

  const promptForLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Location granted, you can use position.coords.latitude and position.coords.longitude
          console.log('Location granted:', position.coords);
        },
        (error) => {
          // Location denied, ask for manual city input
          console.log('Location denied:', error);
          setStep(3); // Move to the weather step
        }
      );
    } else {
      // Geolocation not supported, ask for manual city input
      setStep(3); // Move to the weather step
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    if (step === steps.length - 1) {
      await finishWelcome();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const finishWelcome = async () => {
    // Save all settings
    await updateSettings('global', {
      username: formData.name
    });

    await updateSettings('pomodoro', {
      focusDuration: parseInt(formData.focusTime),
      shortBreakDuration: parseInt(formData.breakTime)
    });

    if (formData.weatherLocation) {
      await updateSettings('weather', {
        autoLocation: false,
        manualLocation: {
          city: formData.weatherLocation,
          country: ''
        }
      });
    }

    // Save daily goal (not added to todo list)
    if (formData.dailyTask) {
      await setStorage('dailyGoal', {
        text: formData.dailyTask,
        date: new Date().toDateString()
      });
    }

    // Save welcome completion
    await setStorage('lastWelcome', {
      date: new Date().toDateString()
    });

    showNotification('Welcome setup completed!', 'success');
    setIsOpen(false);
  };

  const steps = [
    {
      title: 'Welcome!',
      description: "Let's set up your personalized dashboard.",
      fields: [
        {
          name: 'name',
          label: 'What should we call you?',
          type: 'text',
          placeholder: 'Enter your name',
          required: true
        }
      ]
    },
    {
      title: 'Daily Focus',
      description: 'What is your main goal for today?',
      fields: [
        {
          name: 'dailyTask',
          label: 'Your main goal for today',
          type: 'text',
          placeholder: 'e.g., Complete project presentation'
        }
      ]
    },
    {
      title: 'Pomodoro Settings',
      description: 'Configure your focus sessions',
      fields: [
        {
          name: 'focusTime',
          label: 'Focus duration (minutes)',
          type: 'number',
          min: 1,
          max: 60
        },
        {
          name: 'breakTime',
          label: 'Break duration (minutes)',
          type: 'number',
          min: 1,
          max: 30
        }
      ]
    },
    {
      title: 'Weather',
      description: 'Set your weather preferences',
      fields: [
        {
          name: 'weatherLocation',
          label: 'City (optional, leave empty for auto-location)',
          type: 'text',
          placeholder: 'e.g., London'
        }
      ]
    }
  ];

  if (!isOpen) return null;

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
        <p className="text-gray-400 mb-4">{currentStep.description}</p>
        <div className="space-y-4">
          {currentStep.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                min={field.min}
                max={field.max}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-gray-400"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 