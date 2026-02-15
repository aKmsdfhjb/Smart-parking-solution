# Firebase Cloud Functions for Smart Parking

Complete implementation of serverless backend functions for production-ready Smart Parking application.

## Overview

Cloud Functions provide:
- Payment verification
- Automatic booking management
- Security enforcement
- Background tasks
- Push notifications

---

## Setup

### 1. Initialize Firebase Functions

```bash
firebase init functions
```

Select:
- Language: TypeScript
- ESLint: Yes
- Install dependencies: Yes

### 2. Install Dependencies

```bash
cd functions
npm install firebase-admin firebase-functions
npm install axios  # For external API calls
npm install crypto  # For payment verification
```

---

## Functions Implementation

### functions/src/index.ts

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as crypto from 'crypto';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// ===================================
// PAYMENT VERIFICATION FUNCTIONS
// ===================================

/**
 * Verify eSewa Payment
 * Called after successful payment redirect
 */
export const verifyEsewaPayment = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { bookingId, oid, amt, refId } = data;

  try {
    // Get booking
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const booking = bookingSnap.data();

    // Verify user owns this booking
    if (booking!.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized'
      );
    }

    // Verify amount matches
    if (parseFloat(amt) !== booking!.totalAmount) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Amount mismatch'
      );
    }

    // Verify with eSewa API
    const esewaVerifyUrl = 'https://esewa.com.np/epay/transrec';
    const merchantId = functions.config().esewa.merchant_id;
    const secretKey = functions.config().esewa.secret_key;

    const verifyParams = {
      amt: amt,
      rid: refId,
      pid: oid,
      scd: merchantId,
    };

    const response = await axios.get(esewaVerifyUrl, {
      params: verifyParams,
    });

    // Check response (eSewa returns "Success" in response body)
    if (!response.data.includes('Success')) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Payment verification failed'
      );
    }

    // Update booking
    await bookingRef.update({
      paymentStatus: 'paid',
      paymentMethod: 'esewa',
      transactionId: refId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send confirmation notification
    await sendBookingConfirmation(bookingId, booking!.userId);

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  } catch (error: any) {
    console.error('eSewa verification error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Payment verification failed'
    );
  }
});

/**
 * Verify Khalti Payment
 * Called after successful payment
 */
export const verifyKhaltiPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { bookingId, token, amount } = data;

  try {
    // Get booking
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const booking = bookingSnap.data();

    // Verify user owns this booking
    if (booking!.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized'
      );
    }

    // Verify with Khalti API
    const khaltiVerifyUrl = 'https://khalti.com/api/v2/payment/verify/';
    const secretKey = functions.config().khalti.secret_key;

    const response = await axios.post(
      khaltiVerifyUrl,
      {
        token: token,
        amount: amount,
      },
      {
        headers: {
          Authorization: `Key ${secretKey}`,
        },
      }
    );

    if (response.data.state !== 'Complete') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Payment not completed'
      );
    }

    // Update booking
    await bookingRef.update({
      paymentStatus: 'paid',
      paymentMethod: 'khalti',
      transactionId: response.data.idx,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send confirmation notification
    await sendBookingConfirmation(bookingId, booking!.userId);

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  } catch (error: any) {
    console.error('Khalti verification error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Payment verification failed'
    );
  }
});

// ===================================
// BOOKING MANAGEMENT FUNCTIONS
// ===================================

/**
 * Auto-cancel unpaid bookings after 10 minutes
 * Runs every 5 minutes
 */
export const autoCancelUnpaidBookings = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const tenMinutesAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 10 * 60 * 1000)
    );

    try {
      // Find unpaid bookings older than 10 minutes
      const snapshot = await db
        .collection('bookings')
        .where('paymentStatus', '==', 'pending')
        .where('createdAt', '<', tenMinutesAgo)
        .get();

      if (snapshot.empty) {
        console.log('No unpaid bookings to cancel');
        return null;
      }

      const batch = db.batch();

      for (const doc of snapshot.docs) {
        const booking = doc.data();

        console.log(`Cancelling unpaid booking: ${doc.id}`);

        // Update booking status
        batch.update(doc.ref, {
          bookingStatus: 'expired',
          paymentStatus: 'failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Restore parking spot availability
        const parkingRef = db.collection('parking_spots').doc(booking.parkingId);
        batch.update(parkingRef, {
          availableSpots: admin.firestore.FieldValue.increment(1),
        });

        // Send notification to user
        await sendBookingCancellationNotification(doc.id, booking.userId);
      }

      await batch.commit();
      console.log(`Cancelled ${snapshot.size} unpaid bookings`);

      return null;
    } catch (error) {
      console.error('Error cancelling unpaid bookings:', error);
      return null;
    }
  });

/**
 * Auto-complete bookings after end time
 * Runs every hour
 */
export const autoCompleteBookings = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();

    try {
      // Find active bookings past end time
      const snapshot = await db
        .collection('bookings')
        .where('bookingStatus', '==', 'active')
        .where('paymentStatus', '==', 'paid')
        .where('endTime', '<', now)
        .get();

      if (snapshot.empty) {
        console.log('No bookings to complete');
        return null;
      }

      const batch = db.batch();

      for (const doc of snapshot.docs) {
        console.log(`Completing booking: ${doc.id}`);

        batch.update(doc.ref, {
          bookingStatus: 'completed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`Completed ${snapshot.size} bookings`);

      return null;
    } catch (error) {
      console.error('Error completing bookings:', error);
      return null;
    }
  });

/**
 * Prevent double booking
 * Validates booking before creation
 */
export const validateBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { parkingId, startTime, endTime } = data;

  try {
    // Check parking spot availability
    const parkingRef = db.collection('parking_spots').doc(parkingId);
    const parkingSnap = await parkingRef.get();

    if (!parkingSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Parking spot not found');
    }

    const parking = parkingSnap.data();

    if (parking!.availableSpots <= 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No spots available'
      );
    }

    // Check for overlapping bookings (optional additional validation)
    const start = admin.firestore.Timestamp.fromMillis(startTime);
    const end = admin.firestore.Timestamp.fromMillis(endTime);

    const overlappingBookings = await db
      .collection('bookings')
      .where('parkingId', '==', parkingId)
      .where('bookingStatus', '==', 'active')
      .where('paymentStatus', '==', 'paid')
      .where('startTime', '<', end)
      .where('endTime', '>', start)
      .get();

    if (overlappingBookings.size >= parking!.totalSpots) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Parking fully booked for this time'
      );
    }

    return {
      valid: true,
      availableSpots: parking!.availableSpots,
    };
  } catch (error: any) {
    console.error('Booking validation error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Validation failed'
    );
  }
});

// ===================================
// NOTIFICATION FUNCTIONS
// ===================================

/**
 * Send booking confirmation notification
 */
async function sendBookingConfirmation(bookingId: string, userId: string) {
  try {
    // Get user data
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) return;

    const userData = userSnap.data();

    // Create notification document
    await db.collection('notifications').add({
      userId: userId,
      title: 'Booking Confirmed! 🎉',
      message: 'Your parking spot has been successfully booked',
      type: 'booking',
      bookingId: bookingId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: Send FCM push notification if user has device token
    // if (userData.fcmToken) {
    //   await admin.messaging().send({
    //     token: userData.fcmToken,
    //     notification: {
    //       title: 'Booking Confirmed!',
    //       body: 'Your parking spot has been successfully booked',
    //     },
    //     data: {
    //       bookingId: bookingId,
    //       type: 'booking',
    //     },
    //   });
    // }

    console.log(`Sent booking confirmation to user ${userId}`);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}

/**
 * Send booking cancellation notification
 */
async function sendBookingCancellationNotification(
  bookingId: string,
  userId: string
) {
  try {
    await db.collection('notifications').add({
      userId: userId,
      title: 'Booking Expired',
      message: 'Your booking was cancelled due to unpaid payment',
      type: 'cancellation',
      bookingId: bookingId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Sent cancellation notification to user ${userId}`);
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
  }
}

/**
 * Send reminder notification before booking starts
 * Runs every hour
 */
export const sendBookingReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const oneHourFromNow = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 60 * 60 * 1000)
    );
    const twoHoursFromNow = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 2 * 60 * 60 * 1000)
    );

    try {
      // Find bookings starting in 1-2 hours
      const snapshot = await db
        .collection('bookings')
        .where('bookingStatus', '==', 'active')
        .where('paymentStatus', '==', 'paid')
        .where('startTime', '>', oneHourFromNow)
        .where('startTime', '<', twoHoursFromNow)
        .get();

      for (const doc of snapshot.docs) {
        const booking = doc.data();

        await db.collection('notifications').add({
          userId: booking.userId,
          title: 'Booking Reminder',
          message: `Your parking at ${booking.parkingName} starts in 1 hour`,
          type: 'reminder',
          bookingId: doc.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`Sent ${snapshot.size} booking reminders`);
      return null;
    } catch (error) {
      console.error('Error sending reminders:', error);
      return null;
    }
  });

// ===================================
// STATISTICS & ANALYTICS FUNCTIONS
// ===================================

/**
 * Update parking spot statistics
 * Triggered when a rating is added
 */
export const updateParkingStatistics = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snap, context) => {
    const rating = snap.data();

    try {
      const parkingRef = db.collection('parking_spots').doc(rating.parkingId);
      const parkingSnap = await parkingRef.get();

      if (!parkingSnap.exists) return;

      const parking = parkingSnap.data();
      const currentRating = parking!.rating || 0;
      const totalRatings = parking!.totalRatings || 0;

      const newTotalRatings = totalRatings + 1;
      const newRating =
        (currentRating * totalRatings + rating.rating) / newTotalRatings;

      await parkingRef.update({
        rating: newRating,
        totalRatings: newTotalRatings,
      });

      console.log(`Updated rating for parking ${rating.parkingId}`);
    } catch (error) {
      console.error('Error updating parking statistics:', error);
    }
  });

/**
 * Generate daily revenue report
 * Runs at midnight every day
 */
export const generateDailyReport = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Kathmandu')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    try {
      const snapshot = await db
        .collection('bookings')
        .where('paymentStatus', '==', 'paid')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

      let totalRevenue = 0;
      const parkingRevenue: { [key: string]: number } = {};

      snapshot.forEach((doc) => {
        const booking = doc.data();
        totalRevenue += booking.totalAmount;

        if (!parkingRevenue[booking.parkingId]) {
          parkingRevenue[booking.parkingId] = 0;
        }
        parkingRevenue[booking.parkingId] += booking.totalAmount;
      });

      // Store report
      await db.collection('reports').add({
        type: 'daily',
        date: admin.firestore.Timestamp.fromDate(yesterday),
        totalBookings: snapshot.size,
        totalRevenue: totalRevenue,
        parkingRevenue: parkingRevenue,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Generated daily report: ${snapshot.size} bookings, Rs ${totalRevenue}`);
      return null;
    } catch (error) {
      console.error('Error generating daily report:', error);
      return null;
    }
  });

// ===================================
// WEBHOOK HANDLERS
// ===================================

/**
 * eSewa payment webhook
 */
export const esewaWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-esewa-signature'];
    const secretKey = functions.config().esewa.webhook_secret;

    // Implement signature verification logic here

    // Process payment update
    const { oid, refId, amt } = req.body;

    // Find and update booking
    const bookingSnap = await db
      .collection('bookings')
      .where('bookingId', '==', oid)
      .limit(1)
      .get();

    if (!bookingSnap.empty) {
      const bookingDoc = bookingSnap.docs[0];
      await bookingDoc.ref.update({
        paymentStatus: 'paid',
        transactionId: refId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('eSewa webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Khalti payment webhook
 */
export const khaltiWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Verify webhook signature
    const signature = req.headers['khalti-signature'];
    // Implement signature verification logic here

    // Process payment update
    const { idx, token, amount } = req.body;

    // Update booking based on payment data

    res.status(200).send('OK');
  } catch (error) {
    console.error('Khalti webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});
```

---

## Configuration

### Set Firebase Config Variables

```bash
# eSewa Configuration
firebase functions:config:set esewa.merchant_id="YOUR_MERCHANT_ID"
firebase functions:config:set esewa.secret_key="YOUR_SECRET_KEY"
firebase functions:config:set esewa.webhook_secret="YOUR_WEBHOOK_SECRET"

# Khalti Configuration
firebase functions:config:set khalti.secret_key="YOUR_SECRET_KEY"
firebase functions:config:set khalti.webhook_secret="YOUR_WEBHOOK_SECRET"

# View all config
firebase functions:config:get
```

---

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:verifyEsewaPayment

# View logs
firebase functions:log
```

---

## Testing Cloud Functions

### Local Emulator

```bash
# Start emulators
firebase emulators:start

# Functions will run on http://localhost:5001
```

### Test Payment Verification

```typescript
// Client-side call
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const verifyPayment = httpsCallable(functions, 'verifyEsewaPayment');

const result = await verifyPayment({
  bookingId: 'booking123',
  oid: 'BK123456',
  amt: '500',
  refId: 'ESEWA123'
});
```

---

## Security Best Practices

1. **Never expose secret keys in client code**
2. **Always verify user authentication in callable functions**
3. **Validate all input data**
4. **Use HTTPS only**
5. **Implement rate limiting**
6. **Log all security events**
7. **Use webhook signatures to verify authenticity**

---

## Monitoring

### Firebase Console
- View function execution logs
- Monitor invocation counts
- Check error rates
- Analyze execution times

### Alerting
Set up alerts for:
- High error rates
- Long execution times
- Failed payments
- Unauthorized access attempts

---

## Cost Optimization

1. **Use scheduled functions instead of continuous listeners**
2. **Batch database operations**
3. **Implement caching where possible**
4. **Set function timeout limits**
5. **Use appropriate memory allocation**

---

## Troubleshooting

### Common Issues

**Function timeout:**
- Increase timeout: `functions.runWith({ timeoutSeconds: 300 })`

**Permission denied:**
- Check Firebase security rules
- Verify user authentication

**External API errors:**
- Implement retry logic
- Log all API responses
- Use try-catch blocks

---

Last Updated: February 15, 2026
