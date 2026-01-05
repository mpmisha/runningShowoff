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

  // Mock data for now - will be replaced with real tracking data
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

      {/* TODO: Add swipe gesture handler in Phase 4 */}
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
});
