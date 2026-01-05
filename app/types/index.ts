// User Settings
export interface UserSettings {
  distanceUnit: 'km' | 'miles';
  paceUnit: 'min/km' | 'min/mile';
  speedUnit: 'kmh' | 'mph';
  theme: 'light' | 'dark';
  lockRotation: boolean;
  gpsAccuracy: 'high' | 'balanced';
}

// Run State (live tracking data)
export interface RunState {
  isRunning: boolean;
  startTime: number;
  distance: number;        // in meters
  currentSpeed: number;    // in m/s
  averageSpeed: number;    // in m/s
  steps: number;
}

// Display Stat Types
export type DisplayStat = 'distance' | 'pace' | 'speed' | 'time' | 'steps';

// Location Data
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// Run History
export interface RunSession {
  id: string;
  timestamp: number; // Unix timestamp when run started
  duration: number; // in seconds
  distance: number; // in meters
  averageSpeed: number; // in m/s
  steps: number;
  settingsSnapshot: {
    distanceUnit: 'km' | 'miles';
    paceUnit: 'min/km' | 'min/mile';
    speedUnit: 'kmh' | 'mph';
  };
}
