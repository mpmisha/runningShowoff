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
import { StackNavigationProp } from '@react-navigation/stack';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { DisplayStat } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useGPSTracking } from '../hooks/useGPSTracking';
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

export const ShowoffScreen: React.FC<Props> = ({ navigation }) => {
  const stats: DisplayStat[] = ['distance', 'pace', 'speed', 'time', 'steps'];
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const currentStat = stats[currentStatIndex];
  
  const { settings } = useSettings();
  const tracking = useGPSTracking(settings.gpsAccuracy);
  const stepCounter = useStepCounter();

  // Start tracking when component mounts
  useEffect(() => {
    tracking.startTracking();
    stepCounter.startCounting();
    activateKeepAwakeAsync(); // Keep screen awake during run

    // Set screen orientation based on settings
    if (settings.lockRotation) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      ScreenOrientation.unlockAsync();
    }

    return () => {
      tracking.stopTracking();
      stepCounter.stopCounting();
      deactivateKeepAwake();
      // Reset to portrait when leaving screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, [settings.lockRotation]);

  // Format real tracking data
  const displayData = {
    distance: formatDistance(tracking.distance, settings.distanceUnit),
    pace: formatPace(tracking.averageSpeed, settings.paceUnit),
    speed: formatSpeed(tracking.currentSpeed, settings.speedUnit),
    time: formatTime(tracking.elapsedTime),
    steps: formatSteps(stepCounter.steps),
  };

  const displayUnits = {
    distance: getUnitLabel('distance', settings),
    pace: getUnitLabel('pace', settings),
    speed: getUnitLabel('speed', settings),
    time: '',
    steps: 'steps',
  };

  const handleClose = () => {
    tracking.stopTracking();
    stepCounter.stopCounting();
    navigation.goBack();
  };

  // Swipe gesture handlers
  const swipeLeft = Gesture.Fling()
    .direction(2) // Left
    .onEnd(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    });

  const swipeRight = Gesture.Fling()
    .direction(1) // Right
    .onEnd(() => {
      setCurrentStatIndex((prev) => (prev - 1 + stats.length) % stats.length);
    });

  const gesture = Gesture.Race(swipeLeft, swipeRight);

  const isLight = settings.theme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#000000' : '#FFFFFF';

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={[styles.closeText, { color: textColor }]}>×</Text>
      </TouchableOpacity>

      {/* Stat Display */}
      <View style={styles.statContainer}>
        <Text style={[styles.statValue, { color: textColor }]}>
          {displayData[currentStat]}
        </Text>
        <Text style={[styles.statUnit, { color: textColor }]}>
          {displayUnits[currentStat]}
        </Text>
      </View>

      {/* Permission Error */}
      {tracking.permissionError && (
        <Text style={[styles.errorText, { color: textColor }]}>
          Location permission required
        </Text>
      )}

      {/* Swipe Indicator */}
      <View style={styles.indicatorContainer}>
        {stats.map((stat, index) => (
          <View
            key={stat}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentStatIndex ? textColor : 'transparent',
                borderColor: textColor,
                opacity: index === currentStatIndex ? 1 : 0.3,
              },
            ]}
          />
        ))}
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
    fontSize: Math.min(width, height) * 0.35, // Massive font for maximum visibility
    fontWeight: '400',
    fontFamily: 'System',
  },
  statUnit: {
    fontSize: 40,
    fontWeight: '400',
    marginTop: 10,
  },
  errorText: {
    position: 'absolute',
    bottom: 100,
    fontSize: 16,
    opacity: 0.6,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
});
