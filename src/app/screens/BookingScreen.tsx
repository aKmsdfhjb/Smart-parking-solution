// Booking Screen
// Handles booking creation with date/time selection and price calculation

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ParkingSpot } from '../types';
import { getParkingSpotById } from '../services/firestore.service';
import {
  createNewBooking,
  calculateTotalAmount,
  calculateBookingHours,
  validateTimeSlot,
} from '../services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';

export function BookingScreen() {
  const navigate = useNavigate();
  const { parkingId } = useParams<{ parkingId: string }>();
  const { user } = useAuth();
  const [parking, setParking] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadParkingSpot();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
  }, [parkingId]);

  useEffect(() => {
    calculatePrice();
  }, [bookingDate, startTime, endTime, parking]);

  const loadParkingSpot = async () => {
    if (!parkingId) return;

    try {
      const spot = await getParkingSpotById(parkingId);
      if (spot) {
        setParking(spot);
      } else {
        toast.error('Parking spot not found');
        navigate('/map');
      }
    } catch (error) {
      toast.error('Failed to load parking spot');
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!bookingDate || !startTime || !endTime || !parking) {
      setHours(0);
      setTotalAmount(0);
      return;
    }

    try {
      const start = new Date(`${bookingDate}T${startTime}`);
      const end = new Date(`${bookingDate}T${endTime}`);

      if (end > start) {
        const bookingHours = calculateBookingHours(start, end);
        const amount = calculateTotalAmount(parking.pricePerHour, start, end);
        setHours(bookingHours);
        setTotalAmount(amount);
      } else {
        setHours(0);
        setTotalAmount(0);
      }
    } catch (error) {
      setHours(0);
      setTotalAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parking || !user) return;

    setSubmitting(true);

    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}`);
      const endDateTime = new Date(`${bookingDate}T${endTime}`);

      // Validate time slot
      const validation = validateTimeSlot(startDateTime, endDateTime);
      if (!validation.valid) {
        toast.error(validation.error);
        setSubmitting(false);
        return;
      }

      // Create booking
      const bookingId = await createNewBooking(
        user.uid,
        user.name,
        user.email,
        parking.id,
        parking.name,
        parking.address,
        parking.pricePerHour,
        startDateTime,
        endDateTime
      );

      toast.success('Booking created! Proceed to payment');
      navigate(`/payment/${bookingId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading parking details..." />
      </div>
    );
  }

  if (!parking) {
    return null;
  }

  const isFormValid =
    bookingDate && startTime && endTime && hours > 0 && totalAmount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/map')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Book Parking</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Parking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl">{parking.name}</h2>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{parking.address}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Price per hour</p>
                  <p className="font-semibold text-lg">
                    Rs {parking.pricePerHour}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Available spots</p>
                  <p className="font-semibold text-lg">
                    {parking.availableSpots}/{parking.totalSpots}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Price Calculation */}
              {hours > 0 && totalAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{hours} hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">
                      Rs {parking.pricePerHour}/hour
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-xl text-blue-600">
                      Rs {totalAmount}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!isFormValid || submitting || parking.availableSpots === 0}
              >
                {submitting
                  ? 'Creating booking...'
                  : parking.availableSpots === 0
                  ? 'No spots available'
                  : `Proceed to Payment (Rs ${totalAmount})`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
