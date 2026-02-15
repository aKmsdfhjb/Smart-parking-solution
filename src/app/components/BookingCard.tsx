// Booking Card Component
// Displays booking information with status and actions

import React from 'react';
import { Calendar, Clock, MapPin, IndianRupee, QrCode } from 'lucide-react';
import { Booking } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onViewQR?: () => void;
  onCancel?: () => void;
  onRate?: () => void;
}

export function BookingCard({
  booking,
  onViewQR,
  onCancel,
  onRate,
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'outline';
      case 'failed':
      case 'refunded':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const startDate = booking.startTime.toDate();
  const endDate = booking.endTime.toDate();
  const canCancel =
    booking.bookingStatus === 'active' && booking.paymentStatus === 'paid';
  const canRate = booking.bookingStatus === 'completed';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.parkingName}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              ID: {booking.bookingId}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={getStatusColor(booking.bookingStatus)}>
              {booking.bookingStatus}
            </Badge>
            <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start text-sm">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
          <span className="text-gray-700">{booking.parkingAddress}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <p className="text-gray-500 text-xs">Start</p>
              <p className="font-medium">{format(startDate, 'MMM dd, yyyy')}</p>
              <p className="text-xs text-gray-600">
                {format(startDate, 'hh:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <p className="text-gray-500 text-xs">End</p>
              <p className="font-medium">{format(endDate, 'MMM dd, yyyy')}</p>
              <p className="text-xs text-gray-600">
                {format(endDate, 'hh:mm a')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span>{booking.hours} hours</span>
          </div>
          <div className="flex items-center font-semibold text-lg">
            <IndianRupee className="w-5 h-5" />
            <span>{booking.totalAmount}</span>
          </div>
        </div>

        {booking.paymentMethod && (
          <div className="text-sm text-gray-600">
            Payment: <span className="font-medium">{booking.paymentMethod}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {booking.paymentStatus === 'paid' && onViewQR && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onViewQR}
            >
              <QrCode className="w-4 h-4 mr-1" />
              View QR
            </Button>
          )}

          {canCancel && onCancel && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}

          {canRate && onRate && (
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={onRate}
            >
              Rate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
