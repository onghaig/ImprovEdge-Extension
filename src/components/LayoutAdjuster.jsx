import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import '../styles/grid-layout.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetLabels = {
  greeting: 'Greeting & Time',
  search: 'Search',
  todo: 'Todo List',
  calendar: 'Calendar',
  weather: 'Weather',
  quote: 'Quote',
  pomodoro: 'Pomodoro Timer'
};

export default function LayoutAdjuster({ settings, onLayoutChange, themes }) {
  const layouts = {
    lg: Object.entries(settings.layout.gridLayout).map(([key, value]) => ({
      i: key,
      x: value.x,
      y: value.y,
      w: value.w,
      h: value.h,
      minW: 1,
      minH: 1,
      maxW: 3,
      maxH: 2
    }))
  };

  const handleLayoutChange = (layout, layouts) => {
    const newGridLayout = {};
    layout.forEach(item => {
      newGridLayout[item.i] = {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      };
    });
    onLayoutChange(newGridLayout);
  };

  return (
    <div className={`p-4 ${themes.secondary} rounded-lg`}>
      <div className="mb-4">
        <h3 className={`text-lg font-medium ${themes.text}`}>Adjust Widget Layout</h3>
        <p className={`text-sm ${themes.textSecondary}`}>
          Drag and resize widgets to customize your layout. Changes will be applied immediately.
        </p>
      </div>
      
      <div className="relative" style={{ height: '400px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 3, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={100}
          width={800}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
          containerPadding={[16, 16]}
        >
          {Object.entries(widgetLabels).map(([key, label]) => (
            <div
              key={key}
              className={`${themes.widget} flex items-center justify-center p-4 rounded-lg`}
            >
              <span className={`${themes.text} text-center`}>{label}</span>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
} 