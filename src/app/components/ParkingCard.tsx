// Parking Card Component
// Displays parking spot information in a card format

import React from 'react';
import { MapPin, Star, IndianRupee, Car } from 'lucide-react';
import { ParkingSpot } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ParkingCardProps {
  parking: ParkingSpot & { distance?: number };
  onClick?: () => void;
}

export function ParkingCard({ parking, onClick }: ParkingCardProps) {
  const isAvailable = parking.availableSpots > 0;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{parking.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{parking.address}</span>
            </div>
          </div>
          {parking.distance !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {parking.distance.toFixed(1)} km
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center text-sm">
            <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
            <span className="font-semibold">Rs {parking.pricePerHour}/hr</span>
          </div>

          {parking.rating && (
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
              <span>{parking.rating.toFixed(1)}</span>
              {parking.totalRatings && (
                <span className="text-gray-500 ml-1">
                  ({parking.totalRatings})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Car className="w-4 h-4 mr-1 text-blue-600" />
            <span>
              {parking.availableSpots}/{parking.totalSpots} available
            </span>
          </div>

          <Badge variant={isAvailable ? 'default' : 'destructive'}>
            {isAvailable ? 'Available' : 'Full'}
          </Badge>
        </div>

        {parking.amenities && parking.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {parking.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
