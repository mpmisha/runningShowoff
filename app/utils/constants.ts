import { UserSettings } from '../types';

// Default user settings
export const DEFAULT_SETTINGS: UserSettings = {
  distanceUnit: 'km',
  paceUnit: 'min/km',
  speedUnit: 'kmh',
  theme: 'light',
  lockRotation: true,
  gpsAccuracy: 'high',
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: '@runningShowoff:userSettings',
};

// GPS accuracy settings
export const GPS_ACCURACY = {
  high: 1, // Expo Location.Accuracy.BestForNavigation
  balanced: 4, // Expo Location.Accuracy.High
};
