import { useState } from 'react';

function FocusButton({ onToggleFocus, focusedWidget }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(new Set(['greeting', 'search', 'todo', 'weather', 'quote', 'pomodoro']));

  const widgets = [
    { id: 'greeting', label: 'Greeting & Time' },
    { id: 'search', label: 'Search & Calendar' },
    { id: 'todo', label: 'Todo List' },
    { id: 'weather', label: 'Weather' },
    { id: 'quote', label: 'Quote' },
    { id: 'pomodoro', label: 'Pomodoro Timer' },
  ];

  const handleWidgetToggle = (widgetId) => {
    const newSelected = new Set(selectedWidgets);
    if (newSelected.has(widgetId)) {
      newSelected.delete(widgetId);
    } else {
      newSelected.add(widgetId);
    }
    setSelectedWidgets(newSelected);
    onToggleFocus(widgets.map(w => w.id).filter(id => !newSelected.has(id)));
  };

  const handleSelectAll = () => {
    if (selectedWidgets.size === widgets.length) {
      // If all are selected, show only greeting
      const defaultSet = new Set(['greeting']);
      setSelectedWidgets(defaultSet);
      onToggleFocus(widgets.map(w => w.id).filter(id => !defaultSet.has(id)));
    } else {
      // Show all
      const allWidgets = new Set(widgets.map(w => w.id));
      setSelectedWidgets(allWidgets);
      onToggleFocus([]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn flex items-center gap-2"
        >
          <span>
            {selectedWidgets.size === widgets.length 
              ? 'Customize View' 
              : `Showing ${selectedWidgets.size} Widget${selectedWidgets.size !== 1 ? 's' : ''}`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-secondary rounded-lg shadow-lg py-2">
            <button
              onClick={handleSelectAll}
              className="w-full px-4 py-2 text-left hover:bg-accent/10 border-b border-gray-700"
            >
              {selectedWidgets.size === widgets.length ? 'Show Only Time' : 'Show All'}
            </button>
            {widgets.map(widget => (
              <label
                key={widget.id}
                className="flex items-center px-4 py-2 hover:bg-accent/10 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedWidgets.has(widget.id)}
                  onChange={() => handleWidgetToggle(widget.id)}
                  className="mr-3"
                />
                <span>Show {widget.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusButton; 