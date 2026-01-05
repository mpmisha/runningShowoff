import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunSession } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

const MAX_RUNS_STORED = 100;

export const useRunHistory = () => {
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load run history on mount
  useEffect(() => {
    loadRunHistory();
  }, []);

  const loadRunHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.RUN_HISTORY);
      if (stored) {
        const parsedRuns: RunSession[] = JSON.parse(stored);
        // Sort by timestamp descending (newest first)
        parsedRuns.sort((a, b) => b.timestamp - a.timestamp);
        setRuns(parsedRuns);
      }
    } catch (error) {
      console.error('Failed to load run history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRun = async (run: RunSession) => {
    try {
      const updatedRuns = [run, ...runs];
      
      // Keep only the most recent MAX_RUNS_STORED runs
      const trimmedRuns = updatedRuns.slice(0, MAX_RUNS_STORED);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.RUN_HISTORY,
        JSON.stringify(trimmedRuns)
      );
      
      setRuns(trimmedRuns);
    } catch (error) {
      console.error('Failed to save run:', error);
    }
  };

  const deleteRun = async (runId: string) => {
    try {
      const updatedRuns = runs.filter((run) => run.id !== runId);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.RUN_HISTORY,
        JSON.stringify(updatedRuns)
      );
      
      setRuns(updatedRuns);
    } catch (error) {
      console.error('Failed to delete run:', error);
    }
  };

  const clearAllRuns = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RUN_HISTORY);
      setRuns([]);
    } catch (error) {
      console.error('Failed to clear run history:', error);
    }
  };

  // Helper to generate unique ID
  const generateRunId = (): string => {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    runs,
    isLoading,
    saveRun,
    deleteRun,
    clearAllRuns,
    generateRunId,
  };
};
