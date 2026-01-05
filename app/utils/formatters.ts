import { UserSettings } from '../types';

// Format distance with dynamic decimal places
export const formatDistance = (
  meters: number,
  unit: 'km' | 'miles'
): string => {
  const distance = unit === 'km' ? meters / 1000 : meters / 1609.34;
  
  if (distance < 10) {
    return distance.toFixed(2); // e.g., 5.23
  } else {
    return distance.toFixed(1); // e.g., 12.5
  }
};

// Format pace as M:SS
export const formatPace = (
  metersPerSecond: number,
  unit: 'min/km' | 'min/mile'
): string => {
  if (metersPerSecond === 0) return '--:--';
  
  const distance = unit === 'min/km' ? 1000 : 1609.34;
  const secondsPerUnit = distance / metersPerSecond;
  const minutes = Math.floor(secondsPerUnit / 60);
  const seconds = Math.floor(secondsPerUnit % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format speed
export const formatSpeed = (
  metersPerSecond: number,
  unit: 'kmh' | 'mph'
): string => {
  const speed = unit === 'kmh' 
    ? (metersPerSecond * 3.6) 
    : (metersPerSecond * 2.237);
  
  return speed.toFixed(1);
};

// Format elapsed time
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Format steps with commas
export const formatSteps = (steps: number): string => {
  return steps.toLocaleString();
};

// Get unit label
export const getUnitLabel = (
  stat: 'distance' | 'pace' | 'speed',
  settings: UserSettings
): string => {
  switch (stat) {
    case 'distance':
      return settings.distanceUnit.toUpperCase();
    case 'pace':
      return settings.paceUnit;
    case 'speed':
      return settings.speedUnit;
  }
};
