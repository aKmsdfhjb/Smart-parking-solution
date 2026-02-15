# Smart Parking PWA - Setup Guide

Complete guide to set up and deploy the Smart Parking application for Nepal.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Google Maps Setup](#google-maps-setup)
4. [Payment Gateway Setup](#payment-gateway-setup)
5. [Local Development](#local-development)
6. [Deployment](#deployment)
7. [Security Rules](#security-rules)

---

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or higher)
- npm or pnpm package manager
- Firebase account
- Google Cloud account
- eSewa merchant account (for production)
- Khalti merchant account (for production)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "smart-parking-nepal")
4. Enable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Register Web App

1. In Firebase Console, click the web icon (</>)
2. Register app with nickname (e.g., "Smart Parking Web")
3. Copy the Firebase configuration object
4. Paste it in `/src/app/config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Step 3: Enable Authentication

1. Go to Authentication → Get Started
2. Enable "Email/Password" sign-in method
3. Save changes

### Step 4: Create Firestore Database

1. Go to Firestore Database → Create Database
2. Choose "Start in production mode"
3. Select location (asia-south1 for India/Nepal region)
4. Click "Enable"

### Step 5: Create Collections

Create the following collections:

- `users` - User profiles
- `parking_spots` - Parking spot listings
- `bookings` - Booking records
- `ratings` - User ratings

### Step 6: Set up Firestore Security Rules

Go to Firestore Database → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isUserRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Users cannot be deleted
    }
    
    // Parking spots collection
    match /parking_spots/{spotId} {
      allow read: if true; // Anyone can view parking spots
      allow create: if isAuthenticated() && isUserRole('owner');
      allow update: if isAuthenticated() && 
                      resource.data.ownerId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                      resource.data.ownerId == request.auth.uid;
      
      // Prevent direct modification of critical fields
      allow update: if !request.resource.data.diff(resource.data)
                        .affectedKeys().hasAny(['ownerId', 'createdAt']);
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.ownerId == request.auth.uid
      );
      allow create: if isAuthenticated() && 
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.paymentStatus == 'pending';
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
      
      // Prevent direct modification of payment status (must use Cloud Functions)
      allow update: if !request.resource.data.diff(resource.data)
                        .affectedKeys().hasAny(['paymentStatus', 'totalAmount', 'userId']);
    }
    
    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if true; // Anyone can read ratings
      allow create: if isAuthenticated() && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                              resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 7: Create Firestore Indexes

Go to Firestore Database → Indexes and create:

1. **bookings collection:**
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

2. **bookings collection:**
   - Fields: `parkingId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

3. **ratings collection:**
   - Fields: `parkingId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

---

## Google Maps Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable billing (required for Maps)

### Step 2: Enable Maps APIs

1. Go to APIs & Services → Library
2. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional)

### Step 3: Create API Key

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Edit API Key"
5. Under "API restrictions", select:
   - Maps JavaScript API
   - Geocoding API
6. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `https://yourapp.com/*`)
   - For development: `http://localhost:*`
7. Save changes

### Step 4: Configure in Application

Update `/src/app/screens/MapScreen.tsx`:

```typescript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

---

## Payment Gateway Setup

### eSewa Integration

#### Development/Testing

1. Use test merchant code: `EPAYTEST`
2. Test URL: `https://uat.esewa.com.np/epay/main`
3. Test credentials available at [eSewa Developer Portal](https://developer.esewa.com.np/)

#### Production

1. Register as eSewa merchant:
   - Visit [eSewa](https://esewa.com.np/)
   - Complete merchant registration
   - Submit required documents
   - Wait for approval

2. Get merchant credentials:
   - Merchant ID (SCD)
   - Secret Key
   - Production URL: `https://esewa.com.np/epay/main`

3. Update `/src/app/services/payment.service.ts`:

```typescript
const merchantId = 'YOUR_MERCHANT_ID';
const secretKey = 'YOUR_SECRET_KEY';
```

### Khalti Integration

#### Development/Testing

1. Register at [Khalti Developer Portal](https://docs.khalti.com/)
2. Get test public key
3. Test environment automatically uses test mode

#### Production

1. Register as Khalti merchant:
   - Visit [Khalti Merchant Portal](https://khalti.com/)
   - Complete business verification
   - Submit documents

2. Get production credentials:
   - Public Key
   - Secret Key

3. Add Khalti SDK to `/index.html`:

```html
<script src="https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js"></script>
```

4. Update `/src/app/services/payment.service.ts`:

```typescript
const publicKey = 'YOUR_KHALTI_PUBLIC_KEY';
```

---

## Local Development

### Step 1: Clone and Install

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Step 2: Configure Environment

Update configuration files:

1. `/src/app/config/firebase.ts` - Firebase config
2. `/src/app/screens/MapScreen.tsx` - Google Maps API key
3. `/src/app/services/payment.service.ts` - Payment gateway keys

### Step 3: Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### Step 4: Test Application

Demo accounts for testing:

- **User Account:**
  - Email: user@test.com
  - Password: user123

- **Owner Account:**
  - Email: owner@test.com
  - Password: owner123

---

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase:

```bash
firebase init hosting
```

- Select your Firebase project
- Set public directory: `dist`
- Configure as single-page app: Yes
- Set up automatic builds: No

4. Build the application:

```bash
npm run build
```

5. Deploy:

```bash
firebase deploy --only hosting
```

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Follow prompts and configure:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Deploy to Netlify

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Build application:

```bash
npm run build
```

3. Deploy:

```bash
netlify deploy --prod
```

---

## Cloud Functions (Optional)

For production, implement server-side verification:

### Step 1: Initialize Functions

```bash
firebase init functions
```

### Step 2: Install Dependencies

```bash
cd functions
npm install
```

### Step 3: Implement Payment Verification

Create `/functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Verify eSewa Payment
export const verifyEsewaPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { bookingId, transactionId, refId } = data;

  // Verify with eSewa API
  // Implementation here

  // Update booking
  await admin.firestore().collection('bookings').doc(bookingId).update({
    paymentStatus: 'paid',
    transactionId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

// Auto-cancel unpaid bookings after 10 minutes
export const autoCancelUnpaidBookings = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const tenMinutesAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 10 * 60 * 1000)
    );

    const snapshot = await admin.firestore()
      .collection('bookings')
      .where('paymentStatus', '==', 'pending')
      .where('createdAt', '<', tenMinutesAgo)
      .get();

    const batch = admin.firestore().batch();

    snapshot.docs.forEach(doc => {
      const booking = doc.data();
      
      // Cancel booking
      batch.update(doc.ref, {
        bookingStatus: 'expired',
        paymentStatus: 'failed'
      });

      // Restore parking spot availability
      const parkingRef = admin.firestore()
        .collection('parking_spots')
        .doc(booking.parkingId);
      
      batch.update(parkingRef, {
        availableSpots: admin.firestore.FieldValue.increment(1)
      });
    });

    await batch.commit();
  });

// Auto-complete bookings after end time
export const autoCompleteBookings = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await admin.firestore()
      .collection('bookings')
      .where('bookingStatus', '==', 'active')
      .where('endTime', '<', now)
      .get();

    const batch = admin.firestore().batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        bookingStatus: 'completed'
      });
    });

    await batch.commit();
  });
```

### Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

---

## Progressive Web App (PWA) Setup

### Step 1: Create Manifest

Create `/public/manifest.json`:

```json
{
  "name": "Smart Parking Nepal",
  "short_name": "SmartParking",
  "description": "Find and book parking spots in Nepal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 2: Add Service Worker

Create service worker for offline support and caching.

### Step 3: Add to HTML

Add to `/index.html`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3B82F6">
```

---

## Testing

### Test Checklist

- [ ] User registration and login
- [ ] Map loads with user location
- [ ] Parking spots displayed correctly
- [ ] Booking creation works
- [ ] Payment integration (test mode)
- [ ] Booking history displays
- [ ] QR code generation
- [ ] Owner dashboard functionality
- [ ] Responsive design on mobile
- [ ] PWA installation

---

## Production Checklist

- [ ] Firebase configuration updated
- [ ] Google Maps API key configured with restrictions
- [ ] Payment gateway production keys added
- [ ] Firestore security rules deployed
- [ ] Cloud Functions deployed (if applicable)
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Analytics set up
- [ ] Error monitoring (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Backup strategy implemented

---

## Troubleshooting

### Firebase Connection Issues

- Verify API keys in firebase.ts
- Check Firebase project settings
- Ensure billing is enabled

### Google Maps Not Loading

- Verify API key
- Check API restrictions
- Ensure billing is enabled
- Check browser console for errors

### Payment Gateway Errors

- Verify merchant credentials
- Check test/production mode
- Review payment service logs
- Test with provided test cards

### Location Access Denied

- Request HTTPS (required for geolocation)
- Check browser permissions
- Provide fallback location

---

## Support

For issues or questions:

- Firebase: [Firebase Support](https://firebase.google.com/support)
- Google Maps: [Google Maps Platform Support](https://developers.google.com/maps/support)
- eSewa: [developer@esewa.com.np](mailto:developer@esewa.com.np)
- Khalti: [support@khalti.com](mailto:support@khalti.com)

---

## License

This project is for educational and commercial use.
