// Location Service
// Handles geolocation and location-based features

import { Location } from '../types';

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch user's location for continuous updates
 */
export function watchLocation(
  callback: (location: Location) => void,
  errorCallback: (error: Error) => void
): number {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      errorCallback(new Error(error.message));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch (error) {
    console.error('Permission query error:', error);
    return false;
  }
}

/**
 * Default location for Nepal (Kathmandu)
 */
export const DEFAULT_LOCATION: Location = {
  latitude: 27.7172,
  longitude: 85.324,
};
