# Sample Firestore Data for Testing

This file contains sample data to populate your Firestore database for testing the Smart Parking application.

## 📝 Instructions

1. Go to Firebase Console → Firestore Database
2. Create collections manually or use Firebase Admin SDK
3. Copy and paste the JSON data below

---

## 👥 Users Collection

### Document ID: `user123`
```json
{
  "uid": "user123",
  "email": "user@test.com",
  "name": "Rajesh Sharma",
  "phone": "+977-9841234567",
  "role": "user",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### Document ID: `owner123`
```json
{
  "uid": "owner123",
  "email": "owner@test.com",
  "name": "Sita Poudel",
  "phone": "+977-9851234567",
  "role": "owner",
  "createdAt": "2026-01-10T08:00:00Z"
}
```

### Document ID: `admin123`
```json
{
  "uid": "admin123",
  "email": "admin@smartparking.np",
  "name": "Admin User",
  "phone": "+977-9861234567",
  "role": "admin",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

## 🅿️ Parking Spots Collection

### Document ID: `parking_thamel_001`
```json
{
  "name": "Thamel Parking Plaza",
  "address": "Thamel Marg, Kathmandu 44600",
  "description": "Secure parking in the heart of Thamel with 24/7 CCTV surveillance",
  "pricePerHour": 50,
  "latitude": 27.7151,
  "longitude": 85.3124,
  "totalSpots": 50,
  "availableSpots": 35,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["CCTV", "24/7 Security", "Covered Parking", "EV Charging"],
  "rating": 4.5,
  "totalRatings": 128,
  "openTime": "00:00",
  "closeTime": "23:59",
  "createdAt": "2026-01-10T08:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### Document ID: `parking_newroad_002`
```json
{
  "name": "New Road Shopping Center Parking",
  "address": "New Road, Kathmandu 44600",
  "description": "Multi-level parking facility near New Road shopping area",
  "pricePerHour": 40,
  "latitude": 27.7024,
  "longitude": 85.3144,
  "totalSpots": 80,
  "availableSpots": 62,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["Multi-level", "CCTV", "Car Wash", "Restrooms"],
  "rating": 4.2,
  "totalRatings": 95,
  "openTime": "06:00",
  "closeTime": "22:00",
  "createdAt": "2026-01-12T09:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### Document ID: `parking_durbar_003`
```json
{
  "name": "Durbar Square Parking",
  "address": "Durbar Marg, Kathmandu 44600",
  "description": "Premium parking near embassies and luxury hotels",
  "pricePerHour": 80,
  "latitude": 27.7037,
  "longitude": 85.3206,
  "totalSpots": 30,
  "availableSpots": 12,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["Valet Service", "CCTV", "Premium Security", "EV Charging"],
  "rating": 4.8,
  "totalRatings": 210,
  "openTime": "07:00",
  "closeTime": "22:00",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### Document ID: `parking_boudha_004`
```json
{
  "name": "Boudha Stupa Parking",
  "address": "Boudha, Kathmandu 44600",
  "description": "Convenient parking for Boudha Stupa visitors",
  "pricePerHour": 30,
  "latitude": 27.7215,
  "longitude": 85.3622,
  "totalSpots": 40,
  "availableSpots": 28,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["Open Parking", "Security Guard", "Tourist Friendly"],
  "rating": 4.0,
  "totalRatings": 67,
  "openTime": "05:00",
  "closeTime": "21:00",
  "createdAt": "2026-01-18T11:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### Document ID: `parking_patan_005`
```json
{
  "name": "Patan Durbar Square Parking",
  "address": "Patan Durbar Square, Lalitpur 44700",
  "description": "Heritage site parking with traditional architecture",
  "pricePerHour": 35,
  "latitude": 27.6729,
  "longitude": 85.3260,
  "totalSpots": 25,
  "availableSpots": 18,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["CCTV", "Heritage Site", "Bike Parking"],
  "rating": 4.3,
  "totalRatings": 54,
  "openTime": "06:00",
  "closeTime": "20:00",
  "createdAt": "2026-01-20T12:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### Document ID: `parking_lagankhel_006`
```json
{
  "name": "Lagankhel Mall Parking",
  "address": "Lagankhel, Lalitpur 44700",
  "description": "Underground parking at shopping mall",
  "pricePerHour": 45,
  "latitude": 27.6660,
  "longitude": 85.3235,
  "totalSpots": 60,
  "availableSpots": 45,
  "ownerId": "owner123",
  "ownerName": "Sita Poudel",
  "amenities": ["Underground", "Air-conditioned", "Shopping Mall Access"],
  "rating": 4.6,
  "totalRatings": 112,
  "openTime": "08:00",
  "closeTime": "21:00",
  "createdAt": "2026-01-22T13:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

---

## 📅 Bookings Collection

### Document ID: `booking_001`
```json
{
  "bookingId": "BK170812345001001",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "userEmail": "user@test.com",
  "parkingId": "parking_thamel_001",
  "parkingName": "Thamel Parking Plaza",
  "parkingAddress": "Thamel Marg, Kathmandu 44600",
  "startTime": "2026-02-16T10:00:00Z",
  "endTime": "2026-02-16T14:00:00Z",
  "hours": 4,
  "totalAmount": 200,
  "paymentStatus": "paid",
  "paymentMethod": "esewa",
  "bookingStatus": "active",
  "transactionId": "ESEWA170812345001",
  "qrCode": "BK170812345001001",
  "createdAt": "2026-02-15T12:00:00Z",
  "updatedAt": "2026-02-15T12:05:00Z"
}
```

### Document ID: `booking_002`
```json
{
  "bookingId": "BK170812345002002",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "userEmail": "user@test.com",
  "parkingId": "parking_durbar_003",
  "parkingName": "Durbar Square Parking",
  "parkingAddress": "Durbar Marg, Kathmandu 44600",
  "startTime": "2026-02-14T09:00:00Z",
  "endTime": "2026-02-14T12:00:00Z",
  "hours": 3,
  "totalAmount": 240,
  "paymentStatus": "paid",
  "paymentMethod": "khalti",
  "bookingStatus": "completed",
  "transactionId": "KHALTI170812345002",
  "qrCode": "BK170812345002002",
  "createdAt": "2026-02-13T18:00:00Z",
  "updatedAt": "2026-02-14T12:00:00Z"
}
```

### Document ID: `booking_003`
```json
{
  "bookingId": "BK170812345003003",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "userEmail": "user@test.com",
  "parkingId": "parking_newroad_002",
  "parkingName": "New Road Shopping Center Parking",
  "parkingAddress": "New Road, Kathmandu 44600",
  "startTime": "2026-02-12T14:00:00Z",
  "endTime": "2026-02-12T16:00:00Z",
  "hours": 2,
  "totalAmount": 80,
  "paymentStatus": "paid",
  "paymentMethod": "esewa",
  "bookingStatus": "cancelled",
  "transactionId": "ESEWA170812345003",
  "qrCode": "BK170812345003003",
  "createdAt": "2026-02-12T13:30:00Z",
  "updatedAt": "2026-02-12T13:45:00Z",
  "cancelledAt": "2026-02-12T13:45:00Z"
}
```

### Document ID: `booking_004`
```json
{
  "bookingId": "BK170812345004004",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "userEmail": "user@test.com",
  "parkingId": "parking_boudha_004",
  "parkingName": "Boudha Stupa Parking",
  "parkingAddress": "Boudha, Kathmandu 44600",
  "startTime": "2026-02-15T08:00:00Z",
  "endTime": "2026-02-15T11:00:00Z",
  "hours": 3,
  "totalAmount": 90,
  "paymentStatus": "pending",
  "paymentMethod": null,
  "bookingStatus": "active",
  "transactionId": null,
  "qrCode": "BK170812345004004",
  "createdAt": "2026-02-15T07:55:00Z",
  "updatedAt": "2026-02-15T07:55:00Z"
}
```

---

## ⭐ Ratings Collection

### Document ID: `rating_001`
```json
{
  "parkingId": "parking_thamel_001",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "rating": 5,
  "comment": "Excellent parking facility with great security. Highly recommended!",
  "createdAt": "2026-02-14T15:00:00Z"
}
```

### Document ID: `rating_002`
```json
{
  "parkingId": "parking_durbar_003",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "rating": 5,
  "comment": "Premium service and valet parking is very convenient. Worth the price.",
  "createdAt": "2026-02-14T12:30:00Z"
}
```

### Document ID: `rating_003`
```json
{
  "parkingId": "parking_newroad_002",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "rating": 4,
  "comment": "Good parking space, but can get crowded during peak hours.",
  "createdAt": "2026-02-13T18:00:00Z"
}
```

### Document ID: `rating_004`
```json
{
  "parkingId": "parking_lagankhel_006",
  "userId": "user123",
  "userName": "Rajesh Sharma",
  "rating": 5,
  "comment": "Love the underground parking! Cool in summer and protected from rain.",
  "createdAt": "2026-02-12T14:00:00Z"
}
```

---

## 🔔 Notifications Collection

### Document ID: `notif_001`
```json
{
  "userId": "user123",
  "title": "Booking Confirmed! 🎉",
  "message": "Your parking at Thamel Parking Plaza has been successfully booked",
  "type": "booking",
  "bookingId": "booking_001",
  "read": false,
  "createdAt": "2026-02-15T12:05:00Z"
}
```

### Document ID: `notif_002`
```json
{
  "userId": "user123",
  "title": "Booking Reminder",
  "message": "Your parking at Thamel Parking Plaza starts in 1 hour",
  "type": "reminder",
  "bookingId": "booking_001",
  "read": false,
  "createdAt": "2026-02-16T09:00:00Z"
}
```

### Document ID: `notif_003`
```json
{
  "userId": "user123",
  "title": "Booking Completed",
  "message": "Your booking at Durbar Square Parking has been completed",
  "type": "booking",
  "bookingId": "booking_002",
  "read": true,
  "createdAt": "2026-02-14T12:00:00Z"
}
```

---

## 📊 Reports Collection (Admin Only)

### Document ID: `report_daily_2026_02_14`
```json
{
  "type": "daily",
  "date": "2026-02-14T00:00:00Z",
  "totalBookings": 45,
  "totalRevenue": 8500,
  "parkingRevenue": {
    "parking_thamel_001": 2500,
    "parking_durbar_003": 3200,
    "parking_newroad_002": 1600,
    "parking_lagankhel_006": 1200
  },
  "createdAt": "2026-02-15T00:00:00Z"
}
```

---

## 🔧 Firestore Indexes

Create these composite indexes for optimal query performance:

### Index 1: Bookings by User
```
Collection: bookings
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### Index 2: Bookings by Parking
```
Collection: bookings
Fields:
  - parkingId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### Index 3: Active Bookings
```
Collection: bookings
Fields:
  - bookingStatus (Ascending)
  - paymentStatus (Ascending)
  - endTime (Ascending)
Query scope: Collection
```

### Index 4: Ratings by Parking
```
Collection: ratings
Fields:
  - parkingId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### Index 5: Notifications by User
```
Collection: notifications
Fields:
  - userId (Ascending)
  - read (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

---

## 🚀 Quick Import Script

Use this Node.js script to import sample data:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importSampleData() {
  // Import parking spots
  const parkingSpots = [
    // Copy parking spot data here
  ];

  for (const spot of parkingSpots) {
    await db.collection('parking_spots').add(spot);
  }

  console.log('Sample data imported successfully!');
}

importSampleData().catch(console.error);
```

---

## 📝 Notes

1. **Timestamps**: Replace ISO strings with Firestore Timestamp objects
2. **IDs**: Use auto-generated IDs or the ones specified
3. **Testing**: This data is for development/testing only
4. **Production**: Create real data with actual locations in Nepal
5. **Security**: Ensure Firebase security rules are properly configured

---

## 🗺️ Nepal Locations Reference

Popular parking locations in Kathmandu Valley:

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Thamel | 27.7151 | 85.3124 |
| New Road | 27.7024 | 85.3144 |
| Durbar Marg | 27.7037 | 85.3206 |
| Boudha Stupa | 27.7215 | 85.3622 |
| Patan Durbar Square | 27.6729 | 85.3260 |
| Lagankhel | 27.6660 | 85.3235 |
| Baneshwor | 27.6939 | 85.3396 |
| Koteshwor | 27.6782 | 85.3476 |
| Chabahil | 27.7217 | 85.3447 |
| Kalanki | 27.6952 | 85.2831 |

---

Last Updated: February 15, 2026
