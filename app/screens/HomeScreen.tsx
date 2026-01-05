import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsModal } from '../components/SettingsModal';
import { useSettings } from '../hooks/useSettings';

type Props = {
  navigation: StackNavigationProp<any>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, saveSettings } = useSettings();

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

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
      />
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
