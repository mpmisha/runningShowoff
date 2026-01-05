import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationCoords } from '../types';
import { GPS_ACCURACY } from '../utils/constants';

interface GPSTrackingState {
  isTracking: boolean;
  distance: number; // in meters
  currentSpeed: number; // in m/s
  averageSpeed: number; // in m/s
  elapsedTime: number; // in seconds
  hasPermission: boolean;
  permissionError: boolean;
}

export const useGPSTracking = (gpsAccuracy: 'high' | 'balanced') => {
  const [state, setState] = useState<GPSTrackingState>({
    isTracking: false,
    distance: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    elapsedTime: 0,
    hasPermission: false,
    permissionError: false,
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastLocation = useRef<LocationCoords | null>(null);
  const startTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Request location permissions
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setState((prev) => ({ ...prev, hasPermission: true }));
      } else {
        setState((prev) => ({ ...prev, permissionError: true }));
      }
    } catch (error) {
      console.error('Permission error:', error);
      setState((prev) => ({ ...prev, permissionError: true }));
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const startTracking = async () => {
    if (!state.hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      // Reset state
      setState((prev) => ({
        ...prev,
        isTracking: true,
        distance: 0,
        currentSpeed: 0,
        averageSpeed: 0,
        elapsedTime: 0,
      }));

      lastLocation.current = null;
      startTime.current = Date.now();

      // Start elapsed time counter
      timerInterval.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - startTime.current) / 1000),
        }));
      }, 1000);

      // Start location tracking
      const accuracy = GPS_ACCURACY[gpsAccuracy];
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const newLocation: LocationCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          };

          if (lastLocation.current) {
            // Calculate distance from last point
            const distanceDelta = calculateDistance(
              lastLocation.current.latitude,
              lastLocation.current.longitude,
              newLocation.latitude,
              newLocation.longitude
            );

            // Only add distance if movement is significant (reduces GPS drift)
            if (distanceDelta > 2 && distanceDelta < 100) {
              setState((prev) => {
                const newDistance = prev.distance + distanceDelta;
                const elapsed = Math.max(
                  (Date.now() - startTime.current) / 1000,
                  1
                );
                const avgSpeed = newDistance / elapsed;

                return {
                  ...prev,
                  distance: newDistance,
                  currentSpeed: location.coords.speed || 0,
                  averageSpeed: avgSpeed,
                };
              });
            }
          }

          lastLocation.current = newLocation;
        }
      );
    } catch (error) {
      console.error('GPS tracking error:', error);
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    setState((prev) => ({ ...prev, isTracking: false }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
};
