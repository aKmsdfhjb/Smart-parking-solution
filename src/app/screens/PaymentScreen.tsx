// Payment Screen
// Handles payment processing with eSewa and Khalti integration

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Booking } from '../types';
import { getBookingById } from '../services/firestore.service';
import { confirmBookingPayment } from '../services/booking.service';
import { processPayment } from '../services/payment.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

export function PaymentScreen() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'esewa' | 'khalti' | null>(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      const bookingData = await getBookingById(bookingId);
      if (bookingData) {
        if (bookingData.paymentStatus === 'paid') {
          toast.success('Payment already completed');
          navigate('/history');
          return;
        }
        setBooking(bookingData);
      } else {
        toast.error('Booking not found');
        navigate('/map');
      }
    } catch (error) {
      toast.error('Failed to load booking');
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: 'esewa' | 'khalti') => {
    if (!booking) return;

    setProcessing(true);
    setSelectedMethod(method);

    try {
      processPayment(method, {
        amount: booking.totalAmount,
        transactionId: booking.bookingId,
        productName: `Parking at ${booking.parkingName}`,
        onSuccess: async (response) => {
          try {
            // Confirm payment in Firestore
            await confirmBookingPayment(
              booking.id,
              response.transactionId || response.token,
              method
            );

            toast.success('Payment successful!', {
              description: 'Your booking is confirmed',
            });

            navigate('/payment/success', {
              state: { bookingId: booking.id },
            });
          } catch (error) {
            toast.error('Failed to confirm payment');
            setProcessing(false);
          }
        },
        onError: (error) => {
          toast.error('Payment failed', {
            description: error.message || 'Please try again',
          });
          setProcessing(false);
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/booking/${booking.parkingId}`)}
            disabled={processing}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Payment</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Booking Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Parking Location</p>
              <p className="font-semibold">{booking.parkingName}</p>
              <p className="text-sm text-gray-600">{booking.parkingAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Time
                </p>
                <p className="font-medium">
                  {format(booking.startTime.toDate(), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(booking.startTime.toDate(), 'hh:mm a')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time
                </p>
                <p className="font-medium">
                  {format(booking.endTime.toDate(), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(booking.endTime.toDate(), 'hh:mm a')}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="font-medium">{booking.hours} hours</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-blue-600 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {booking.totalAmount}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Booking ID: {booking.bookingId}
            </p>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* eSewa */}
            <button
              onClick={() => handlePayment('esewa')}
              disabled={processing}
              className="w-full p-4 border-2 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">eSewa</p>
                    <p className="text-sm text-gray-600">
                      Pay with eSewa digital wallet
                    </p>
                  </div>
                </div>
                {processing && selectedMethod === 'esewa' && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
            </button>

            {/* Khalti */}
            <button
              onClick={() => handlePayment('khalti')}
              disabled={processing}
              className="w-full p-4 border-2 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Khalti</p>
                    <p className="text-sm text-gray-600">
                      Pay with Khalti digital wallet
                    </p>
                  </div>
                </div>
                {processing && selectedMethod === 'khalti' && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
            </button>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> You have 10 minutes to complete the payment.
                After that, your booking will be automatically cancelled.
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/map')}
                disabled={processing}
              >
                Cancel Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Payment Success Screen
export function PaymentSuccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your parking spot has been booked successfully
          </p>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/history')}
            >
              View Booking
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/map')}
            >
              Back to Map
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
