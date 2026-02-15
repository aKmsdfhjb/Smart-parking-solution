// Type definitions for the Smart Parking application

import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  ownerId: string;
  ownerName?: string;
  amenities?: string[];
  images?: string[];
  rating?: number;
  totalRatings?: number;
  description?: string;
  openTime?: string;
  closeTime?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'active' | 'completed' | 'cancelled' | 'expired';
export type PaymentMethod = 'esewa' | 'khalti' | 'cash';

export interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  parkingId: string;
  parkingName?: string;
  parkingAddress?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  hours: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  bookingStatus: BookingStatus;
  qrCode?: string;
  transactionId?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  cancelledAt?: Timestamp;
}

export interface Rating {
  id: string;
  parkingId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'cancellation' | 'reminder';
  read: boolean;
  bookingId?: string;
  createdAt: Timestamp;
}

// Payment gateway response types
export interface EsewaPaymentResponse {
  status: 'success' | 'failed';
  transactionId?: string;
  amount?: number;
  refId?: string;
}

export interface KhaltiPaymentResponse {
  status: 'success' | 'failed';
  token?: string;
  amount?: number;
  idx?: string;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

// Map marker types
export interface MapMarker extends ParkingSpot {
  distance?: number;
}
