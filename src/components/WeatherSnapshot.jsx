import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from './Notification';
import { getStorage, setStorage } from '../utils/storage';

const WEATHER_API_KEY = '364f7cc3a4b4011a3cf7bf72b4540a33'; // Replace with your API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

export default function WeatherSnapshot() {
  const { settings } = useSettings();
  const showNotification = useNotification();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeather();
  }, [settings.weather.units, settings.weather.autoLocation, settings.weather.manualLocation]);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedWeather = await getStorage('weatherCache');
      const now = Date.now();

      // Clear cache if manual location changed
      if (!settings.weather.autoLocation && 
          cachedWeather?.data?.name !== settings.weather.manualLocation.city) {
        await setStorage('weatherCache', null);
      }

      if (cachedWeather && (now - cachedWeather.timestamp) < settings.weather.updateFrequency) {
        setWeather(cachedWeather.data);
        setLoading(false);
        return;
      }

      let coords;
      if (settings.weather.autoLocation) {
        coords = await getCurrentPosition();
      } else if (settings.weather.manualLocation.city) {
        coords = await getCoordsByCity(settings.weather.manualLocation.city);
      } else {
        throw new Error('No location specified');
      }

      const weatherData = await fetchWeather(coords);
      await setStorage('weatherCache', {
        data: weatherData,
        timestamp: now
      });

      setWeather(weatherData);
    } catch (err) {
      console.error('Error loading weather:', err);
      setError(err.message);
      showNotification('Failed to load weather data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        error => {
          reject(new Error('Failed to get location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000
        }
      );
    });
  };

  const getCoordsByCity = async (city) => {
    const response = await fetch(
      `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('City not found');
    }

    const data = await response.json();
    return {
      lat: data.coord.lat,
      lon: data.coord.lon
    };
  };

  const fetchWeather = async ({ lat, lon }) => {
    const response = await fetch(
      `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&units=${settings.weather.units}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return response.json();
  };

  const formatTemp = (temp) => {
    return Math.round(temp) + '°' + (settings.weather.units === 'imperial' ? 'F' : 'C');
  };

  const formatWindSpeed = (speed) => {
    if (settings.weather.units === 'imperial') {
      return `${Math.round(speed)} mph`;
    }
    return `${Math.round(speed * 3.6)} km/h`; // Convert m/s to km/h
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/90 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/90">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadWeather}
          className="mt-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="p-4 rounded-lg bg-gray-800/90">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{weather.name}</h2>
        <button
          onClick={loadWeather}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          title="Refresh weather"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
          className="w-16 h-16"
        />
        <div>
          <div className="text-3xl font-bold">
            {formatTemp(weather.main.temp)}
          </div>
          <div className="text-sm text-gray-300">
            Feels like {formatTemp(weather.main.feels_like)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400">High/Low</div>
          <div>{formatTemp(weather.main.temp_max)} / {formatTemp(weather.main.temp_min)}</div>
        </div>
        <div>
          <div className="text-gray-400">Wind</div>
          <div>{formatWindSpeed(weather.wind.speed)}</div>
        </div>
        <div>
          <div className="text-gray-400">Humidity</div>
          <div>{weather.main.humidity}%</div>
        </div>
        <div>
          <div className="text-gray-400">Pressure</div>
          <div>{weather.main.pressure} hPa</div>
        </div>
      </div>
    </div>
  );
} 