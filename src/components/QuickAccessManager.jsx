import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function QuickAccessManager({ onClose }) {
  const { themes } = useTheme();
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
    color: '#3B82F6' // Default blue color
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const savedLinks = await getStorage('quickAccessLinks') || [];
    setLinks(savedLinks);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newLink = {
      id: editingLink?.id || Date.now(),
      ...formData
    };

    let updatedLinks;
    if (editingLink) {
      updatedLinks = links.map(link => 
        link.id === editingLink.id ? newLink : link
      );
    } else {
      updatedLinks = [...links, newLink];
    }

    await setStorage('quickAccessLinks', updatedLinks);
    setLinks(updatedLinks);
    setEditingLink(null);
    setFormData({ name: '', url: '', icon: '', color: '#3B82F6' });
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      icon: link.icon,
      color: link.color
    });
  };

  const handleDelete = async (id) => {
    const updatedLinks = links.filter(link => link.id !== id);
    await setStorage('quickAccessLinks', updatedLinks);
    setLinks(updatedLinks);
  };

  return (
    <div className={`p-4 ${themes.secondary} rounded-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${themes.text}`}>
          {editingLink ? 'Edit Quick Access Link' : 'Add Quick Access Link'}
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-full hover:${themes.accentHover} transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${themes.text} mb-2`}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
            placeholder="e.g., Calendar"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themes.text} mb-2`}>
            URL
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
            placeholder="e.g., https://calendar.google.com"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themes.text} mb-2`}>
            Icon (SVG path)
          </label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-md ${themes.input} ${themes.text}`}
            placeholder="e.g., M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themes.text} mb-2`}>
            Color
          </label>
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full h-10 rounded-md cursor-pointer"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${themes.input} ${themes.text} hover:${themes.accentHover}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md ${themes.accent} text-white hover:${themes.accentHover}`}
          >
            {editingLink ? 'Save Changes' : 'Add Link'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h4 className={`text-sm font-medium ${themes.text} mb-2`}>Your Quick Access Links</h4>
        <div className="space-y-2">
          {links.map(link => (
            <div
              key={link.id}
              className={`flex items-center justify-between p-2 rounded-md ${themes.input}`}
            >
              <div className="flex items-center space-x-2">
                {link.icon && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: link.color }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                )}
                <span className={themes.text}>{link.name}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(link)}
                  className={`p-1 rounded-md hover:${themes.accentHover}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className={`p-1 rounded-md hover:${themes.accentHover}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 