import { useState, useEffect } from 'react';
import { getStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import QuickAccessManager from './QuickAccessManager';

function SearchAndCalendar() {
  const { themes } = useTheme();
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState([]);
  const [isManagingLinks, setIsManagingLinks] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const savedLinks = await getStorage('quickAccessLinks') || [];
    setLinks(savedLinks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="widget">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className={`input flex-1 ${themes.text}`}
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        {/* Quick Access Links */}
        <div className="flex items-center justify-between">
          <span className={`text-sm ${themes.textSecondary}`}>Quick Access</span>
          <div className="flex items-center gap-3">
            {links.map(link => (
              <a 
                key={link.id}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-sm hover:opacity-80 flex items-center gap-1 transition-colors`}
                style={{ color: link.color }}
              >
                {link.icon && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                )}
                {link.name}
              </a>
            ))}
            <button
              onClick={() => setIsManagingLinks(true)}
              className={`text-sm ${themes.textSecondary} hover:${themes.accentHover} flex items-center gap-1 transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Manager Modal */}
      {isManagingLinks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            <QuickAccessManager onClose={() => {
              setIsManagingLinks(false);
              loadLinks();
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAndCalendar; 