// Firestore Database Service
// Handles all Firestore operations for parking spots, bookings, and ratings

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ParkingSpot, Booking, Rating } from '../types';

// ===================================
// PARKING SPOTS OPERATIONS
// ===================================

/**
 * Get all parking spots
 */
export async function getAllParkingSpots(): Promise<ParkingSpot[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'parking_spots'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ParkingSpot[];
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    throw error;
  }
}

/**
 * Get parking spot by ID
 */
export async function getParkingSpotById(
  id: string
): Promise<ParkingSpot | null> {
  try {
    const docRef = doc(db, 'parking_spots', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ParkingSpot;
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    throw error;
  }
}

/**
 * Get parking spots by owner
 */
export async function getParkingSpotsByOwner(
  ownerId: string
): Promise<ParkingSpot[]> {
  try {
    const q = query(
      collection(db, 'parking_spots'),
      where('ownerId', '==', ownerId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ParkingSpot[];
  } catch (error) {
    console.error('Error fetching owner parking spots:', error);
    throw error;
  }
}

/**
 * Create a new parking spot (Owner only)
 */
export async function createParkingSpot(
  spotData: Omit<ParkingSpot, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'parking_spots'), {
      ...spotData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating parking spot:', error);
    throw error;
  }
}

/**
 * Update parking spot
 */
export async function updateParkingSpot(
  id: string,
  updates: Partial<ParkingSpot>
): Promise<void> {
  try {
    const docRef = doc(db, 'parking_spots', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating parking spot:', error);
    throw error;
  }
}

/**
 * Delete parking spot
 */
export async function deleteParkingSpot(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'parking_spots', id));
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    throw error;
  }
}

// ===================================
// BOOKINGS OPERATIONS
// ===================================

/**
 * Create a new booking
 */
export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const docRef = doc(db, 'bookings', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

/**
 * Get user bookings
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Get parking spot bookings (for owner)
 */
export async function getParkingBookings(
  parkingId: string
): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('parkingId', '==', parkingId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching parking bookings:', error);
    throw error;
  }
}

/**
 * Update booking
 */
export async function updateBooking(
  id: string,
  updates: Partial<Booking>
): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

/**
 * Cancel booking and restore parking spot availability
 */
export async function cancelBooking(
  bookingId: string,
  parkingId: string
): Promise<void> {
  try {
    // Update booking status
    await updateBooking(bookingId, {
      bookingStatus: 'cancelled',
      cancelledAt: serverTimestamp() as any,
    });

    // Restore available spot
    const parkingRef = doc(db, 'parking_spots', parkingId);
    await updateDoc(parkingRef, {
      availableSpots: increment(1),
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

// ===================================
// RATINGS OPERATIONS
// ===================================

/**
 * Add rating to parking spot
 */
export async function addRating(
  ratingData: Omit<Rating, 'id' | 'createdAt'>
): Promise<void> {
  try {
    // Add rating document
    await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      createdAt: serverTimestamp(),
    });

    // Update parking spot rating statistics
    const parkingRef = doc(db, 'parking_spots', ratingData.parkingId);
    const parkingDoc = await getDoc(parkingRef);

    if (parkingDoc.exists()) {
      const data = parkingDoc.data();
      const currentRating = data.rating || 0;
      const totalRatings = data.totalRatings || 0;
      const newTotalRatings = totalRatings + 1;
      const newRating =
        (currentRating * totalRatings + ratingData.rating) / newTotalRatings;

      await updateDoc(parkingRef, {
        rating: newRating,
        totalRatings: newTotalRatings,
      });
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
}

/**
 * Get ratings for parking spot
 */
export async function getParkingRatings(
  parkingId: string
): Promise<Rating[]> {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('parkingId', '==', parkingId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Rating[];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
}
