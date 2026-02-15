// Location Context Provider
// Manages user location state across the application

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Location } from '../types';
import {
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  DEFAULT_LOCATION,
} from '../services/location.service';
import { toast } from 'sonner';

interface LocationContextType {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
    } catch (err: any) {
      console.error('Location error:', err);
      setError(err.message);
      // Use default location (Kathmandu) if geolocation fails
      setLocation(DEFAULT_LOCATION);
      toast.error('Using default location (Kathmandu)', {
        description: 'Enable location services for accurate results',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();

    // Watch location for continuous updates
    const watchId = watchLocation(
      (newLocation) => {
        setLocation(newLocation);
      },
      (err) => {
        console.error('Location watch error:', err);
      }
    );

    return () => {
      if (watchId !== -1) {
        clearLocationWatch(watchId);
      }
    };
  }, []);

  const refreshLocation = async () => {
    await fetchLocation();
  };

  const value: LocationContextType = {
    location,
    loading,
    error,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
