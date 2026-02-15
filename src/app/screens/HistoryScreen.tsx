// Booking History Screen
// Displays user's booking history with filtering and actions

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types';
import { getUserBookings, cancelBooking } from '../services/firestore.service';
import { BookingCard } from '../components/BookingCard';
import { QRCodeDialog } from '../components/QRCodeDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, History, RefreshCw } from 'lucide-react';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const data = await getUserBookings(user.uid);
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowQR(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setCancelBookingId(booking.id);
  };

  const handleCancelConfirm = async () => {
    if (!cancelBookingId) return;

    const booking = bookings.find((b) => b.id === cancelBookingId);
    if (!booking) return;

    setCancelling(true);

    try {
      await cancelBooking(booking.id, booking.parkingId);
      toast.success('Booking cancelled successfully');
      await loadBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
      setCancelBookingId(null);
    }
  };

  const filterBookings = (status: 'all' | 'active' | 'completed' | 'cancelled') => {
    if (status === 'all') return bookings;
    return bookings.filter((b) => b.bookingStatus === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/map')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">Booking History</h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadBookings}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">
              Start by booking a parking spot
            </p>
            <Button onClick={() => navigate('/map')}>
              Find Parking
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({filterBookings('active').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterBookings('completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({filterBookings('cancelled').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewQR={() => handleViewQR(booking)}
                  onCancel={() => handleCancelClick(booking)}
                />
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {filterBookings('active').map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewQR={() => handleViewQR(booking)}
                  onCancel={() => handleCancelClick(booking)}
                />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filterBookings('completed').map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewQR={() => handleViewQR(booking)}
                />
              ))}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {filterBookings('cancelled').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={showQR}
        onOpenChange={setShowQR}
        booking={selectedBooking}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancelBookingId}
        onOpenChange={(open) => !open && setCancelBookingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone. Your payment may be refunded according to our cancellation
              policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Cancelling...' : 'Yes, cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}