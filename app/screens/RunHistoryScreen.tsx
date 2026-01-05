import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRunHistory } from '../hooks/useRunHistory';
import { useSettings } from '../hooks/useSettings';
import { RunSession } from '../types';
import {
  formatDistance,
  formatPace,
  formatTime,
} from '../utils/formatters';

type Props = {
  navigation: StackNavigationProp<any>;
};

export const RunHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { runs, isLoading, deleteRun, clearAllRuns } = useRunHistory();
  const { settings } = useSettings();

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTimeOfDay = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDeleteRun = (run: RunSession) => {
    Alert.alert(
      'Delete Run',
      `Delete run from ${formatDate(run.timestamp)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRun(run.id),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Runs',
      'Are you sure you want to delete all run history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllRuns,
        },
      ]
    );
  };

  const calculateTotalDistance = (): number => {
    return runs.reduce((sum, run) => sum + run.distance, 0);
  };

  const calculateAveragePace = (): number => {
    if (runs.length === 0) return 0;
    const totalSpeed = runs.reduce((sum, run) => sum + run.averageSpeed, 0);
    return totalSpeed / runs.length;
  };

  const isLight = settings.theme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#000000' : '#FFFFFF';
  const cardBgColor = isLight ? '#F5F5F5' : '#1C1C1E';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Run History</Text>
        {runs.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Stats */}
      {runs.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: cardBgColor }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {runs.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: textColor, opacity: 0.6 }]}>
                Total Runs
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {formatDistance(calculateTotalDistance(), settings.distanceUnit)}
              </Text>
              <Text style={[styles.summaryLabel, { color: textColor, opacity: 0.6 }]}>
                Total Distance
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {formatPace(calculateAveragePace(), settings.paceUnit)}
              </Text>
              <Text style={[styles.summaryLabel, { color: textColor, opacity: 0.6 }]}>
                Avg Pace
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Run List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {runs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor, opacity: 0.6 }]}>
              No runs yet
            </Text>
            <Text style={[styles.emptySubtext, { color: textColor, opacity: 0.4 }]}>
              Complete a run to see it here
            </Text>
          </View>
        ) : (
          runs.map((run) => (
            <TouchableOpacity
              key={run.id}
              style={[styles.runCard, { backgroundColor: cardBgColor }]}
              onLongPress={() => handleDeleteRun(run)}
            >
              <View style={styles.runHeader}>
                <Text style={[styles.runDate, { color: textColor }]}>
                  {formatDate(run.timestamp)}
                </Text>
                <Text style={[styles.runTime, { color: textColor, opacity: 0.6 }]}>
                  {formatTimeOfDay(run.timestamp)}
                </Text>
              </View>
              
              <View style={styles.runStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {formatDistance(run.distance, run.settingsSnapshot.distanceUnit)}
                  </Text>
                  <Text style={[styles.statLabel, { color: textColor, opacity: 0.6 }]}>
                    Distance
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {formatTime(run.duration)}
                  </Text>
                  <Text style={[styles.statLabel, { color: textColor, opacity: 0.6 }]}>
                    Duration
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {formatPace(run.averageSpeed, run.settingsSnapshot.paceUnit)}
                  </Text>
                  <Text style={[styles.statLabel, { color: textColor, opacity: 0.6 }]}>
                    Pace
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {run.steps.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: textColor, opacity: 0.6 }]}>
                    Steps
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.longPressHint, { color: textColor, opacity: 0.3 }]}>
                Long press to delete
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 32,
    fontWeight: '300',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance the back button
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
  },
  runCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  runDate: {
    fontSize: 18,
    fontWeight: '600',
  },
  runTime: {
    fontSize: 14,
  },
  runStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  longPressHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
