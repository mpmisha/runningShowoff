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

  const isLight = localSettings.theme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#000000' : '#FFFFFF';

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
      <View style={[styles.radio, { borderColor: textColor }]}>
        {selected && <View style={[styles.radioSelected, { backgroundColor: textColor }]} />}
      </View>
      <Text style={[styles.radioLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Distance Units */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>Distance Units</Text>
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>Pace Format</Text>
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>Speed Format</Text>
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>Display Theme</Text>
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>Lock Rotation</Text>
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>GPS Accuracy</Text>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
