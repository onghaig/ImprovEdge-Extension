import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer({ notifications }) {
  return createPortal(
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {notifications.map(({ id, message, type }) => (
        <div
          key={id}
          className={`px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'error' ? 'bg-red-600' :
            type === 'success' ? 'bg-green-600' :
            'bg-blue-600'
          }`}
        >
          <p className="text-white">{message}</p>
        </div>
      ))}
    </div>,
    document.body
  );
} 