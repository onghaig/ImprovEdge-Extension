import React from 'react';

function CalendarPreview() {
  return (
    <div className="widget">
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold mb-4">Google Calendar</h2>
        <p className="mb-4">View your calendar events</p>
        <a 
          href="https://calendar.google.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn inline-flex items-center"
        >
          Open Google Calendar
        </a>
      </div>
    </div>
  );
}

export default CalendarPreview; 