// Map Screen
// Main screen showing parking spots on Google Maps with user location

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { ParkingSpot } from '../types';
import { getAllParkingSpots } from '../services/firestore.service';
import { sortByDistance } from '../utils/distance';
import { ParkingCard } from '../components/ParkingCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Menu,
  LogOut,
  User,
  History,
  MapPin,
  RefreshCw,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
};

export function MapScreen() {
  const navigate = useNavigate();
  const { user, logout, isOwner } = useAuth();
  const { location, loading: locationLoading, refreshLocation } = useLocation();
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedParking, setSelectedParking] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortedSpots, setSortedSpots] = useState<any[]>([]);

  useEffect(() => {
    loadParkingSpots();
  }, []);

  useEffect(() => {
    if (location && parkingSpots.length > 0) {
      const sorted = sortByDistance(
        location.latitude,
        location.longitude,
        parkingSpots
      );
      setSortedSpots(sorted);
    }
  }, [location, parkingSpots]);

  const loadParkingSpots = async () => {
    try {
      const spots = await getAllParkingSpots();
      setParkingSpots(spots);
    } catch (error) {
      toast.error('Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadParkingSpots(), refreshLocation()]);
    toast.success('Refreshed successfully');
  };

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading parking spots..." />
      </div>
    );
  }

  const center = location || { lat: 27.7172, lng: 85.324 }; // Default to Kathmandu

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Smart Parking</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  {user?.name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/history')}>
                  <History className="w-4 h-4 mr-2" />
                  Booking History
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem onClick={() => navigate('/owner-dashboard')}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Owner Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="bg-white">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* User Location Marker */}
            {location && (
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3B82F6">
                      <circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/>
                    </svg>
                  `),
                }}
                title="Your Location"
              />
            )}

            {/* Parking Spot Markers */}
            {parkingSpots.map((parking) => (
              <Marker
                key={parking.id}
                position={{ lat: parking.latitude, lng: parking.longitude }}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${
                      parking.availableSpots > 0 ? '#10B981' : '#EF4444'
                    }">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="white" stroke-width="1"/>
                    </svg>
                  `),
                }}
                onClick={() => setSelectedParking(parking)}
              />
            ))}

            {/* Info Window */}
            {selectedParking && (
              <InfoWindow
                position={{
                  lat: selectedParking.latitude,
                  lng: selectedParking.longitude,
                }}
                onCloseClick={() => setSelectedParking(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-base mb-1">
                    {selectedParking.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedParking.address}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Rs {selectedParking.pricePerHour}/hr</span>
                  </p>
                  <p className="text-sm mb-3">
                    {selectedParking.availableSpots}/{selectedParking.totalSpots} spots available
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/booking/${selectedParking.id}`)}
                    disabled={selectedParking.availableSpots === 0}
                  >
                    {selectedParking.availableSpots > 0 ? 'Book Now' : 'Full'}
                  </Button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Parking List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">
          Nearby Parking Spots ({sortedSpots.length})
        </h2>

        {sortedSpots.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No parking spots available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSpots.map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                onClick={() => navigate(`/booking/${parking.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
