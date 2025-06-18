import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from './Notification';
import { getStorage, setStorage } from '../utils/storage';

const QUOTES_API_KEY = 'YOUR_API_KEY'; // Replace with your API key
const QUOTES_API_BASE = 'https://api.quotable.io';

export default function QuoteOfTheDay() {
  const { settings } = useSettings();
  const showNotification = useNotification();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuote();
  }, [settings.quotes.categories, settings.quotes.updateFrequency]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedQuote = await getStorage('quoteCache');
      const now = Date.now();

      // Check if we need to update based on frequency setting
      const shouldUpdate = !cachedQuote || (() => {
        const lastUpdate = new Date(cachedQuote.timestamp);
        const today = new Date();
        
        switch (settings.quotes.updateFrequency) {
          case 'hourly':
            return (now - cachedQuote.timestamp) > 3600000; // 1 hour
          case 'daily':
            return lastUpdate.getDate() !== today.getDate();
          case 'weekly':
            const weekDiff = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24 * 7));
            return weekDiff >= 1;
          default:
            return true;
        }
      })();

      if (!shouldUpdate && cachedQuote.data) {
        setQuote(cachedQuote.data);
        setLoading(false);
        return;
      }

      // Fetch new quote
      const categories = settings.quotes.categories.join('|');
      const response = await fetch(
        `${QUOTES_API_BASE}/random?tags=${categories}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const quoteData = await response.json();
      
      // Cache the quote
      await setStorage('quoteCache', {
        data: quoteData,
        timestamp: now
      });

      setQuote(quoteData);
    } catch (err) {
      console.error('Error loading quote:', err);
      setError(err.message);
      showNotification('Failed to load quote', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/90 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/90">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadQuote}
          className="mt-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="p-4 rounded-lg bg-gray-800/90">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Quote of the Day</h2>
        <button
          onClick={loadQuote}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          title="Get new quote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <blockquote className="mb-3">
        <p className="text-lg italic mb-2">{quote.content}</p>
        <footer className="text-sm text-gray-400">
          — {quote.author}
          {quote.tags?.length > 0 && (
            <span className="ml-2 text-xs">
              ({quote.tags.join(', ')})
            </span>
          )}
        </footer>
      </blockquote>
    </div>
  );
} 