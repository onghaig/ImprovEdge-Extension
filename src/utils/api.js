import axios from 'axios';

const WEATHER_API_KEY = '364f7cc3a4b4011a3cf7bf72b4540a33';

// Fallback quotes in case the API fails
const FALLBACK_QUOTES = [
  {
    content: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    content: "Make each day your masterpiece.",
    author: "John Wooden"
  },
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "Every moment is a fresh beginning.",
    author: "T.S. Eliot"
  },
  {
    content: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  }
];

export const getQuote = async () => {
  try {
    // Try the primary API first
    const response = await axios.get('https://api.quotable.io/random', {
      params: {
        maxLength: 100 // Keep quotes concise
      },
      timeout: 5000 // 5 second timeout
    });
    
    return {
      content: response.data.content,
      author: response.data.author
    };
  } catch (error) {
    console.warn('Falling back to local quotes:', error);
    // Return a random fallback quote
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};

export const getWallpaper = async () => {
  // Get a high quality image with slight blur for better text readability
  // Using 4K resolution (3840x2160) with minimal blur
  return `https://picsum.photos/3840/2160?blur=1&random=${Date.now()}`;
};

export const getWeather = async (lat, lon) => {
  try {
    // Get current weather
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    // Get location details using reverse geocoding
    const geoResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
    );

    const locationData = geoResponse.data[0];
    
    return {
      ...weatherResponse.data,
      location: {
        city: locationData.name,
        state: locationData.state,
        country: locationData.country
      }
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

export const getGoogleCalendarEvents = async (accessToken) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        params: {
          maxResults: 5,
          timeMin: new Date().toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return null;
  }
}; 