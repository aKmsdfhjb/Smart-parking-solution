// QR Code Dialog Component
// Displays booking QR code for entry validation

import React from 'react';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Booking } from '../types';
import { format } from 'date-fns';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  booking,
}: QRCodeDialogProps) {
  if (!booking) return null;

  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    parkingId: booking.parkingId,
    userId: booking.userId,
    startTime: booking.startTime.toDate().toISOString(),
    endTime: booking.endTime.toDate().toISOString(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking QR Code</DialogTitle>
          <DialogDescription>
            Show this QR code at the parking entrance
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCode value={qrData} size={200} />
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-lg">{booking.parkingName}</p>
            <p className="text-sm text-gray-600">ID: {booking.bookingId}</p>
            <div className="text-sm text-gray-600 mt-2">
              <p>
                {format(booking.startTime.toDate(), 'MMM dd, yyyy hh:mm a')}
              </p>
              <p className="text-xs">to</p>
              <p>{format(booking.endTime.toDate(), 'MMM dd, yyyy hh:mm a')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
