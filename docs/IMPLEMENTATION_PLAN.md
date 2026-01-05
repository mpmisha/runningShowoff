# Running Showoff - Step-by-Step Implementation Plan

**App Purpose:** Display running stats in large text on iPhone armband for "showing off" to other runners

**Last Updated:** January 5, 2026

---

## 📋 Implementation Overview

This document provides a detailed, step-by-step guide to building the Running Showoff app. Follow each phase in order, testing after each step.

---

## 🎯 App Specifications Summary

### Features
- **5 Stat Views:** Distance, Pace, Speed, Time, Steps
- **Swipe Navigation:** Left/right to cycle through stats
- **Settings:** Units, theme, rotation lock, GPS accuracy
- **Minimal UI:** Maximum readability, simple controls

### Defaults
- Distance: Kilometers (KM)
- Pace: min/km
- Speed: km/h
- Theme: Light (black on white)
- Rotation: Locked (portrait)
- GPS: High accuracy

### Display Rules
- Distance < 10: `X.XX` (e.g., `5.23 KM`)
- Distance ≥ 10: `XX.X` (e.g., `12.5 KM`)
- Pace: `M:SS` (e.g., `4:30`)
- Speed: `XX.X` (e.g., `12.5`)
- Time: `MM:SS` or `HH:MM:SS`
- Steps: `X,XXX` (comma-separated)

---

## 📦 Phase 1: Install Dependencies

### Step 1.1: Install Core Navigation & UI Libraries

```bash
# Install React Navigation
npm install @react-navigation/native @react-navigation/stack

# Install React Navigation dependencies for Expo
npx expo install react-native-screens react-native-safe-area-context

# Install gesture handler for swipe navigation
npx expo install react-native-gesture-handler

# Install async storage for settings persistence
npx expo install @react-native-async-storage/async-storage
```

### Step 1.2: Install Location & Sensor Libraries

```bash
# Install location services (GPS tracking)
npx expo install expo-location

# Install sensors (step counter)
npx expo install expo-sensors

# Install device info (screen orientation)
npx expo install expo-screen-orientation
```

### Step 1.3: Verify Installation

```bash
# Check package.json has all dependencies
cat package.json

# Run to verify no errors
npx expo start
```

**Expected Result:** App should start without errors (even if it's just the default Expo screen)

---

## 🏗️ Phase 2: Project Structure Setup

### Step 2.1: Create Type Definitions

**Create:** `app/types/index.ts`

```typescript
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
```

### Step 2.2: Create Utility Functions

**Create:** `app/utils/formatters.ts`

```typescript
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
```

**Create:** `app/utils/constants.ts`

```typescript
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
```

**Test:** Verify files compile without errors:
```bash
npx tsc --noEmit
```

---

## 🎨 Phase 3: Build Core Screens

### Step 3.1: Create Home Screen

**Create:** `app/screens/HomeScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleStartRun = () => {
    navigation.navigate('Showoff');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      {/* App Title */}
      <Text style={styles.title}>Running Showoff</Text>

      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartRun}
      >
        <Text style={styles.startButtonText}>START RUN</Text>
      </TouchableOpacity>

      {/* Settings Modal - TODO: implement in next step */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
  },
  settingsIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 60,
    color: '#000000',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
```

### Step 3.2: Create Settings Modal Component

**Create:** `app/components/SettingsModal.tsx`

```typescript
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { UserSettings } from '../types';

type Props = {
  visible: boolean;
  settings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
};

export const SettingsModal: React.FC<Props> = ({
  visible,
  settings,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const RadioOption = ({ 
    label, 
    selected, 
    onPress 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.radioRow} onPress={onPress}>
      <View style={styles.radio}>
        {selected && <View style={styles.radioSelected} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <ScrollView style={styles.scrollView}>
          {/* Distance Units */}
          <Text style={styles.sectionTitle}>Distance Units</Text>
          <RadioOption
            label="Kilometers (KM)"
            selected={localSettings.distanceUnit === 'km'}
            onPress={() => setLocalSettings({ ...localSettings, distanceUnit: 'km' })}
          />
          <RadioOption
            label="Miles"
            selected={localSettings.distanceUnit === 'miles'}
            onPress={() => setLocalSettings({ ...localSettings, distanceUnit: 'miles' })}
          />

          {/* Pace Format */}
          <Text style={styles.sectionTitle}>Pace Format</Text>
          <RadioOption
            label="min/km"
            selected={localSettings.paceUnit === 'min/km'}
            onPress={() => setLocalSettings({ ...localSettings, paceUnit: 'min/km' })}
          />
          <RadioOption
            label="min/mile"
            selected={localSettings.paceUnit === 'min/mile'}
            onPress={() => setLocalSettings({ ...localSettings, paceUnit: 'min/mile' })}
          />

          {/* Speed Format */}
          <Text style={styles.sectionTitle}>Speed Format</Text>
          <RadioOption
            label="km/h"
            selected={localSettings.speedUnit === 'kmh'}
            onPress={() => setLocalSettings({ ...localSettings, speedUnit: 'kmh' })}
          />
          <RadioOption
            label="mph"
            selected={localSettings.speedUnit === 'mph'}
            onPress={() => setLocalSettings({ ...localSettings, speedUnit: 'mph' })}
          />

          {/* Display Theme */}
          <Text style={styles.sectionTitle}>Display Theme</Text>
          <RadioOption
            label="Light (black on white)"
            selected={localSettings.theme === 'light'}
            onPress={() => setLocalSettings({ ...localSettings, theme: 'light' })}
          />
          <RadioOption
            label="Dark (white on black)"
            selected={localSettings.theme === 'dark'}
            onPress={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
          />

          {/* Lock Rotation */}
          <Text style={styles.sectionTitle}>Lock Rotation</Text>
          <RadioOption
            label="Locked (portrait only)"
            selected={localSettings.lockRotation === true}
            onPress={() => setLocalSettings({ ...localSettings, lockRotation: true })}
          />
          <RadioOption
            label="Allow rotation"
            selected={localSettings.lockRotation === false}
            onPress={() => setLocalSettings({ ...localSettings, lockRotation: false })}
          />

          {/* GPS Accuracy */}
          <Text style={styles.sectionTitle}>GPS Accuracy</Text>
          <RadioOption
            label="High (drains battery)"
            selected={localSettings.gpsAccuracy === 'high'}
            onPress={() => setLocalSettings({ ...localSettings, gpsAccuracy: 'high' })}
          />
          <RadioOption
            label="Balanced (saves battery)"
            selected={localSettings.gpsAccuracy === 'balanced'}
            onPress={() => setLocalSettings({ ...localSettings, gpsAccuracy: 'balanced' })}
          />
        </ScrollView>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleSave}>
          <Text style={styles.doneButtonText}>DONE</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### Step 3.3: Create Showoff Display Screen (Basic)

**Create:** `app/screens/ShowoffScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DisplayStat, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

type Props = {
  navigation: StackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export const ShowoffScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStat, setCurrentStat] = useState<DisplayStat>('distance');
  const [settings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Mock data for now
  const mockData = {
    distance: '5.23',
    pace: '4:30',
    speed: '12.5',
    time: '23:45',
    steps: '3,847',
  };

  const mockUnits = {
    distance: 'KM',
    pace: 'min/km',
    speed: 'km/h',
    time: '',
    steps: 'steps',
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const isLight = settings.theme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={[styles.closeText, { color: textColor }]}>×</Text>
      </TouchableOpacity>

      {/* Stat Display */}
      <View style={styles.statContainer}>
        <Text style={[styles.statValue, { color: textColor }]}>
          {mockData[currentStat]}
        </Text>
        <Text style={[styles.statUnit, { color: textColor }]}>
          {mockUnits[currentStat]}
        </Text>
      </View>

      {/* TODO: Add swipe gesture handler in next phase */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    opacity: 0.3,
  },
  closeText: {
    fontSize: 40,
    fontWeight: '300',
  },
  statContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Math.min(width, height) * 0.35, // Massive font
    fontWeight: '400',
    fontFamily: 'System',
  },
  statUnit: {
    fontSize: 40,
    fontWeight: '400',
    marginTop: 10,
  },
});
```

**Test Checkpoint:** Basic screens should render and navigate

---

## 🔄 Phase 4: Setup Navigation

### Step 4.1: Create Navigation Stack

**Update:** `App.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './app/screens/HomeScreen';
import { ShowoffScreen } from './app/screens/ShowoffScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Showoff" component={ShowoffScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

**Test:** Run the app and verify:
```bash
npx expo start
# Press 'i' for iOS simulator
```

- ✅ Home screen displays with "START RUN" button
- ✅ Tapping START RUN navigates to Showoff screen
- ✅ Showoff screen shows mock "5.23 KM"
- ✅ Tapping X returns to Home screen
- ✅ Settings icon appears (doesn't work yet - that's OK)

---

## 💾 Phase 5: Settings Persistence

### Step 5.1: Create Settings Hook

**Create:** `app/hooks/useSettings.ts`

```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(newSettings)
      );
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
  };
};
```

### Step 5.2: Integrate Settings into Home Screen

**Update:** `app/screens/HomeScreen.tsx`

Add import:
```typescript
import { SettingsModal } from '../components/SettingsModal';
import { useSettings } from '../hooks/useSettings';
```

Inside component:
```typescript
const { settings, saveSettings } = useSettings();
```

Add modal at the end before closing `</View>`:
```typescript
<SettingsModal
  visible={showSettings}
  settings={settings}
  onClose={() => setShowSettings(false)}
  onSave={saveSettings}
/>
```

**Test:**
- ✅ Open settings (gear icon)
- ✅ Change a setting (e.g., Dark theme)
- ✅ Close app completely
- ✅ Reopen app
- ✅ Open settings again - your choice should be saved

---

## 📍 Phase 6: GPS Tracking Service

### Step 6.1: Request Location Permissions

**Update:** `app.json` to add permission descriptions:

```json
{
  "expo": {
    "name": "Running Showoff",
    "slug": "running-showoff",
    "ios": {
      "bundleIdentifier": "com.runningshowoff.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track distance and speed while running",
        "NSMotionUsageDescription": "We use motion sensors to count your steps during your run"
      }
    }
  }
}
```

### Step 6.2: Create Location Tracking Hook

**Create:** `app/hooks/useLocationTracking.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationCoords } from '../types';
import { GPS_ACCURACY } from '../utils/constants';

export const useLocationTracking = (
  isRunning: boolean,
  gpsAccuracy: 'high' | 'balanced'
) => {
  const [distance, setDistance] = useState(0); // in meters
  const [currentSpeed, setCurrentSpeed] = useState(0); // in m/s
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const lastPosition = useRef<LocationCoords | null>(null);
  const totalDistance = useRef(0);
  const startTime = useRef(0);

  // Request permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Start/stop tracking
  useEffect(() => {
    if (!hasPermission || !isRunning) {
      return;
    }

    startTime.current = Date.now();
    totalDistance.current = 0;
    lastPosition.current = null;

    const watchPosition = async () => {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: GPS_ACCURACY[gpsAccuracy],
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude, speed } = location.coords;

          // Update current speed
          if (speed !== null && speed >= 0) {
            setCurrentSpeed(speed);
          }

          // Calculate distance
          if (lastPosition.current) {
            const dist = calculateDistance(
              lastPosition.current.latitude,
              lastPosition.current.longitude,
              latitude,
              longitude
            );
            totalDistance.current += dist;
            setDistance(totalDistance.current);

            // Calculate average speed
            const elapsed = (Date.now() - startTime.current) / 1000; // seconds
            if (elapsed > 0) {
              setAverageSpeed(totalDistance.current / elapsed);
            }
          }

          lastPosition.current = {
            latitude,
            longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          };
        }
      );

      return subscription;
    };

    let subscription: Location.LocationSubscription;
    watchPosition().then((sub) => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isRunning, hasPermission, gpsAccuracy]);

  return {
    distance,
    currentSpeed,
    averageSpeed,
    hasPermission,
  };
};

// Haversine formula to calculate distance between two GPS coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
```

**Test:** GPS permission dialog should appear when starting a run

---

## 👣 Phase 7: Step Counter

### Step 7.1: Create Step Counter Hook

**Create:** `app/hooks/useStepCounter.ts`

```typescript
import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

export const useStepCounter = (isRunning: boolean) => {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if pedometer is available
  useEffect(() => {
    Pedometer.isAvailableAsync().then(setIsAvailable);
  }, []);

  // Track steps while running
  useEffect(() => {
    if (!isAvailable || !isRunning) {
      return;
    }

    setSteps(0); // Reset on start

    const subscription = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning, isAvailable]);

  return { steps, isAvailable };
};
```

---

## 🎬 Phase 8: Integrate Everything into Showoff Screen

### Step 8.1: Update Showoff Screen with Real Data

**Update:** `app/screens/ShowoffScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StackNavigationProp } from '@react-navigation/stack';
import { DisplayStat, UserSettings } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useStepCounter } from '../hooks/useStepCounter';
import {
  formatDistance,
  formatPace,
  formatSpeed,
  formatTime,
  formatSteps,
  getUnitLabel,
} from '../utils/formatters';

type Props = {
  navigation: StackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

const STAT_ORDER: DisplayStat[] = ['distance', 'pace', 'speed', 'time', 'steps'];

export const ShowoffScreen: React.FC<Props> = ({ navigation }) => {
  useKeepAwake(); // Keep screen awake during run

  const { settings } = useSettings();
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  const currentStat = STAT_ORDER[currentStatIndex];

  // Tracking hooks
  const { distance, currentSpeed, averageSpeed } = useLocationTracking(
    true,
    settings.gpsAccuracy
  );
  const { steps } = useStepCounter(true);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Handle rotation lock
  useEffect(() => {
    if (settings.lockRotation) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      ScreenOrientation.unlockAsync();
    }
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [settings.lockRotation]);

  // Swipe gesture handler
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.velocityX > 500) {
        // Swipe right - previous stat
        setCurrentStatIndex((prev) => 
          prev === 0 ? STAT_ORDER.length - 1 : prev - 1
        );
      } else if (event.velocityX < -500) {
        // Swipe left - next stat
        setCurrentStatIndex((prev) => 
          (prev + 1) % STAT_ORDER.length
        );
      }
    });

  const handleClose = () => {
    navigation.goBack();
  };

  // Format current stat value
  const getStatValue = (): string => {
    switch (currentStat) {
      case 'distance':
        return formatDistance(distance, settings.distanceUnit);
      case 'pace':
        return formatPace(averageSpeed, settings.paceUnit);
      case 'speed':
        return formatSpeed(currentSpeed, settings.speedUnit);
      case 'time':
        return formatTime(elapsedTime);
      case 'steps':
        return formatSteps(steps);
    }
  };

  // Get unit label
  const getUnitText = (): string => {
    switch (currentStat) {
      case 'distance':
        return settings.distanceUnit.toUpperCase();
      case 'pace':
        return settings.paceUnit;
      case 'speed':
        return settings.speedUnit;
      case 'time':
        return '';
      case 'steps':
        return 'steps';
    }
  };

  const isLight = settings.theme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#000000' : '#FFFFFF';

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={[styles.closeText, { color: textColor }]}>×</Text>
        </TouchableOpacity>

        {/* Stat Display */}
        <View style={styles.statContainer}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {getStatValue()}
          </Text>
          <Text style={[styles.statUnit, { color: textColor }]}>
            {getUnitText()}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    opacity: 0.3,
  },
  closeText: {
    fontSize: 40,
    fontWeight: '300',
  },
  statContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Math.min(width, height) * 0.35,
    fontWeight: '400',
    fontFamily: 'System',
  },
  statUnit: {
    fontSize: 40,
    fontWeight: '400',
    marginTop: 10,
  },
});
```

**Test Full App:**
```bash
npx expo start
```

✅ Start a run
✅ See distance increase (walk around)
✅ Swipe left/right to change stats
✅ Change theme in settings (dark/light)
✅ Change units in settings
✅ Close and restart - settings persist

---

## ✅ Phase 9: Final Polish & Testing

### Step 9.1: Add Permission Error Handling

**Create:** `app/components/PermissionError.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

type Props = {
  onClose: () => void;
};

export const PermissionError: React.FC<Props> = ({ onClose }) => {
  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Permission Required</Text>
      <Text style={styles.message}>
        Running Showoff needs access to your location to track distance and speed.
      </Text>
      <TouchableOpacity style={styles.button} onPress={openSettings}>
        <Text style={styles.buttonText}>Open Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
```

### Step 9.2: Testing Checklist

**Simulator Testing:**
- [ ] App launches without crashes
- [ ] Settings open and close
- [ ] All settings options work
- [ ] Settings persist after app restart
- [ ] Navigation works (Home → Showoff → Home)
- [ ] Theme switches work
- [ ] Swipe gestures work

**Device Testing:**
- [ ] Location permission requested
- [ ] GPS tracking works (walk around)
- [ ] Distance increases accurately
- [ ] Pace/speed updates in real-time
- [ ] Step counter works
- [ ] All 5 stats display correctly
- [ ] Theme is readable outdoors
- [ ] Screen stays awake during run
- [ ] Rotation lock works
- [ ] Battery usage is acceptable

### Step 9.3: Performance Optimization

Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "supportsTablet": false,
      "requireFullScreen": true,
      "userInterfaceStyle": "automatic"
    }
  }
}
```

---

## 🚀 Phase 10: Build & Deploy Preparation

### Step 10.1: Update App Metadata

**Update:** `app.json`

```json
{
  "expo": {
    "name": "Running Showoff",
    "slug": "running-showoff",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.runningshowoff.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track distance and speed while running",
        "NSMotionUsageDescription": "We use motion sensors to count your steps during your run",
        "UIRequiresFullScreen": true
      }
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "We need your location to track distance and speed while running"
        }
      ]
    ]
  }
}
```

### Step 10.2: Create App Icons

You'll need to create app icons in various sizes. Use a tool like:
- https://www.appicon.co
- https://makeappicon.com

Required: 1024x1024 PNG for the App Store

### Step 10.3: Test Production Build

```bash
# Build for iOS
eas build --platform ios --profile preview

# Or local build
eas build --platform ios --local
```

---

## 📝 Implementation Checklist

### Phase 1: Dependencies ✅
- [ ] Install navigation libraries
- [ ] Install location & sensor libraries
- [ ] Verify installation

### Phase 2: Project Structure ✅
- [ ] Create type definitions
- [ ] Create utility functions
- [ ] Create constants

### Phase 3: Core Screens ✅
- [ ] Build Home screen
- [ ] Build Settings modal
- [ ] Build Showoff screen (basic)

### Phase 4: Navigation ✅
- [ ] Setup navigation stack
- [ ] Test screen transitions

### Phase 5: Settings ✅
- [ ] Create settings hook
- [ ] Integrate settings persistence
- [ ] Test settings save/load

### Phase 6: GPS Tracking ✅
- [ ] Request permissions
- [ ] Create location tracking hook
- [ ] Test GPS accuracy modes

### Phase 7: Step Counter ✅
- [ ] Create step counter hook
- [ ] Test step counting

### Phase 8: Integration ✅
- [ ] Integrate all hooks into Showoff screen
- [ ] Add swipe gestures
- [ ] Add screen wake lock
- [ ] Add rotation handling
- [ ] Test all features together

### Phase 9: Polish ✅
- [ ] Add permission error handling
- [ ] Test on simulator
- [ ] Test on real device
- [ ] Optimize performance

### Phase 10: Deploy Prep ✅
- [ ] Update app metadata
- [ ] Create app icons
- [ ] Build production version
- [ ] Submit to App Store

---

## 🐛 Common Issues & Solutions

### Issue: GPS not updating in simulator
**Solution:** Simulator doesn't have real GPS. Test on a physical device.

### Issue: Step counter not working
**Solution:** Step counter requires physical device with motion sensors.

### Issue: App crashes on location access
**Solution:** Check Info.plist has location permission description.

### Issue: Settings not persisting
**Solution:** Check AsyncStorage is installed: `npx expo install @react-native-async-storage/async-storage`

### Issue: Swipe gestures not working
**Solution:** Ensure GestureHandlerRootView wraps NavigationContainer in App.tsx

### Issue: Screen dims during run
**Solution:** `useKeepAwake()` hook is installed from `expo-keep-awake`

---

## 📚 Next Steps After Implementation

1. **Beta Testing:** Use TestFlight to test with real runners
2. **Feedback:** Gather user feedback on readability and features
3. **Iterate:** Add requested features (maybe route tracking, social sharing)
4. **Marketing:** Create App Store screenshots showing the "showoff" concept
5. **Launch:** Submit to App Store!

---

**Good luck building Running Showoff! 🏃‍♂️💨**

*Last updated: January 5, 2026*
