import { useState } from 'react';

function SearchAndCalendar() {
  const [query, setQuery] = useState('');

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
            className="input flex-1"
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        {/* Quick Access Links */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Quick Access</span>
          <div className="flex items-center gap-3">
            <a 
              href="https://calendar.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </a>
            <a 
              href="https://chat.openai.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.3626a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.3626zm16.5953 3.0238l-2.02-1.1638a.7759.7759 0 0 0-.7854 0l-5.8312 3.3733-2.7717-1.6018a.0757.0757 0 0 1-.071 0l-4.8303-2.7913a4.4944 4.4944 0 0 1 7.9157-4.018 4.5784 4.5784 0 0 1 8.5502 2.3732 4.505 4.505 0 0 1-.6866 4.8287zm2.0107-3.0231a4.4708 4.4708 0 0 1-3.9337 1.9773l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7913a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.6028 1.4998a4.4708 4.4708 0 0 1-2.3655 1.9773 4.504 4.504 0 0 1-1.5927-8.662 4.5784 4.5784 0 0 1 8.5502-2.3732 4.505 4.505 0 0 1 .6866 4.8287l-2.6768 1.7294zm1.0976-2.3654l2.6028-1.5053a2.2672 2.2672 0 0 0 .1238-3.72 2.2859 2.2859 0 0 0-3.3542.2821 2.2673 2.2673 0 0 0-.1238 3.7201zm-1.5883-.9187a1.1705 1.1705 0 1 1 0-2.341 1.1705 1.1705 0 0 1 0 2.341z"/>
              </svg>
              ChatGPT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchAndCalendar; 