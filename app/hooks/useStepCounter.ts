import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

interface StepCounterState {
  steps: number;
  isAvailable: boolean;
  isTracking: boolean;
}

export const useStepCounter = () => {
  const [state, setState] = useState<StepCounterState>({
    steps: 0,
    isAvailable: false,
    isTracking: false,
  });

  const [subscription, setSubscription] = useState<any>(null);

  // Check if step counter is available
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await Pedometer.isAvailableAsync();
    setState((prev) => ({ ...prev, isAvailable: available }));
  };

  const startCounting = () => {
    if (!state.isAvailable) {
      return;
    }

    // Reset step count
    setState((prev) => ({ ...prev, steps: 0, isTracking: true }));

    // Subscribe to pedometer updates
    const sub = Pedometer.watchStepCount((result) => {
      setState((prev) => ({
        ...prev,
        steps: prev.steps + result.steps,
      }));
    });

    setSubscription(sub);
  };

  const stopCounting = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setState((prev) => ({ ...prev, isTracking: false }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  return {
    ...state,
    startCounting,
    stopCounting,
  };
};
