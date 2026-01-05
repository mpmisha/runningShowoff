import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { DisplayStat } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useGPSTracking } from '../hooks/useGPSTracking';
import {
  formatDistance,
  formatPace,
  formatSpeed,
  formatTime,
  getUnitLabel,
} from '../utils/formatters';

type Props = {
  navigation: StackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export const ShowoffScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStat, setCurrentStat] = useState<DisplayStat>('distance');
  const { settings } = useSettings();
  const tracking = useGPSTracking(settings.gpsAccuracy);

  // Start tracking when component mounts
  useEffect(() => {
    tracking.startTracking();
    activateKeepAwakeAsync(); // Keep screen awake during run

    return () => {
      tracking.stopTracking();
      deactivateKeepAwake();
    };
  }, []);

  // Format real tracking data
  const displayData = {
    distance: formatDistance(tracking.distance, settings.distanceUnit),
    pace: formatPace(tracking.averageSpeed, settings.paceUnit),
    speed: formatSpeed(tracking.currentSpeed, settings.speedUnit),
    time: formatTime(tracking.elapsedTime),
    steps: '0', // TODO: Will add in Phase 7
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

      {/* TODO: Add swipe gesture handler in Phase 8 */}
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
});
