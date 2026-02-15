// Booking Service
// Handles booking creation, validation, and management

import { Timestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, ParkingSpot } from '../types';
import { createBooking, updateBooking } from './firestore.service';

/**
 * Generate unique booking ID
 */
function generateBookingId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `BK${timestamp}${random}`;
}

/**
 * Calculate booking hours between two dates
 */
export function calculateBookingHours(
  startTime: Date,
  endTime: Date
): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.ceil(diffHours); // Round up to nearest hour
}

/**
 * Calculate total amount for booking
 */
export function calculateTotalAmount(
  pricePerHour: number,
  startTime: Date,
  endTime: Date
): number {
  const hours = calculateBookingHours(startTime, endTime);
  return pricePerHour * hours;
}

/**
 * Check if parking spot is available for booking
 */
export async function checkParkingAvailability(
  parkingId: string
): Promise<{ available: boolean; availableSpots: number }> {
  try {
    const parkingRef = doc(db, 'parking_spots', parkingId);
    const parkingDoc = await getDoc(parkingRef);

    if (!parkingDoc.exists()) {
      return { available: false, availableSpots: 0 };
    }

    const data = parkingDoc.data() as ParkingSpot;
    return {
      available: data.availableSpots > 0,
      availableSpots: data.availableSpots,
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

/**
 * Create a new booking with validation
 */
export async function createNewBooking(
  userId: string,
  userName: string,
  userEmail: string,
  parkingId: string,
  parkingName: string,
  parkingAddress: string,
  pricePerHour: number,
  startTime: Date,
  endTime: Date
): Promise<string> {
  try {
    // Check availability
    const { available } = await checkParkingAvailability(parkingId);
    if (!available) {
      throw new Error('No parking spots available');
    }

    // Validate times
    if (startTime >= endTime) {
      throw new Error('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new Error('Start time cannot be in the past');
    }

    // Calculate booking details
    const hours = calculateBookingHours(startTime, endTime);
    const totalAmount = calculateTotalAmount(pricePerHour, startTime, endTime);
    const bookingId = generateBookingId();

    // Create booking document
    const booking: Omit<Booking, 'id' | 'createdAt'> = {
      bookingId,
      userId,
      userName,
      userEmail,
      parkingId,
      parkingName,
      parkingAddress,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      hours,
      totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'active',
      qrCode: bookingId, // Use bookingId as QR code data
    };

    const docId = await createBooking(booking);

    // Reduce available spots
    const parkingRef = doc(db, 'parking_spots', parkingId);
    await updateDoc(parkingRef, {
      availableSpots: increment(-1),
    });

    return docId;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Confirm booking payment
 */
export async function confirmBookingPayment(
  bookingId: string,
  transactionId: string,
  paymentMethod: 'esewa' | 'khalti'
): Promise<void> {
  try {
    await updateBooking(bookingId, {
      paymentStatus: 'paid',
      paymentMethod,
      transactionId,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

/**
 * Cancel unpaid booking and restore spots
 */
export async function cancelUnpaidBooking(
  bookingId: string,
  parkingId: string
): Promise<void> {
  try {
    // Update booking status
    await updateBooking(bookingId, {
      bookingStatus: 'expired',
      paymentStatus: 'failed',
    });

    // Restore available spot
    const parkingRef = doc(db, 'parking_spots', parkingId);
    await updateDoc(parkingRef, {
      availableSpots: increment(1),
    });
  } catch (error) {
    console.error('Error cancelling unpaid booking:', error);
    throw error;
  }
}

/**
 * Complete booking after end time
 */
export async function completeBooking(bookingId: string): Promise<void> {
  try {
    await updateBooking(bookingId, {
      bookingStatus: 'completed',
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
}

/**
 * Validate booking time slot
 */
export function validateTimeSlot(
  startTime: Date,
  endTime: Date
): { valid: boolean; error?: string } {
  const now = new Date();

  if (startTime < now) {
    return { valid: false, error: 'Start time cannot be in the past' };
  }

  if (endTime <= startTime) {
    return { valid: false, error: 'End time must be after start time' };
  }

  const hours = calculateBookingHours(startTime, endTime);
  if (hours > 24) {
    return { valid: false, error: 'Booking cannot exceed 24 hours' };
  }

  return { valid: true };
}
