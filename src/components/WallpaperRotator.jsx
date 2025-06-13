import { useState, useEffect } from 'react';
import { getWallpaper } from '../utils/api';

function WallpaperRotator({ onWallpaperChange }) {
  useEffect(() => {
    loadWallpaper();
    const interval = setInterval(loadWallpaper, 30 * 60 * 1000); // Change every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const loadWallpaper = async () => {
    try {
      const newWallpaper = await getWallpaper();
      if (newWallpaper) {
        onWallpaperChange(newWallpaper);
      }
    } catch (error) {
      console.error('Error loading wallpaper:', error);
    }
  };

  return null; // This component doesn't render anything visible
}

export default WallpaperRotator; 