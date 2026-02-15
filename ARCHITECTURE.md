# Smart Parking PWA - Architecture Documentation

## System Architecture Overview

The Smart Parking application follows a modern, scalable architecture using React, Firebase, and external payment gateways.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React PWA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Screens    │  │  Components  │  │   Contexts   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │    Services     │                        │
│                  └────────┬────────┘                        │
└───────────────────────────┼──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐   ┌────▼─────┐
│   Firebase   │   │  Google Maps    │   │ Payment  │
│              │   │                 │   │ Gateways │
│ • Auth       │   │ • Maps API      │   │          │
│ • Firestore  │   │ • Geocoding     │   │ • eSewa  │
│ • Functions  │   │ • Markers       │   │ • Khalti │
│ • Messaging  │   └─────────────────┘   └──────────┘
└──────────────┘
```

---

## Technology Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router v7** - Routing
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **react-qr-code** - QR code generation

### Backend Services
- **Firebase Auth** - User authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Cloud Functions** - Serverless backend
- **Firebase Cloud Messaging** - Push notifications

### Third-Party APIs
- **Google Maps JavaScript API** - Map rendering and location
- **eSewa Payment Gateway** - Digital wallet payments
- **Khalti Payment Gateway** - Digital wallet payments

---

## Project Structure

```
smart-parking-pwa/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # Radix UI components
│   │   │   ├── BookingCard.tsx
│   │   │   ├── ParkingCard.tsx
│   │   │   ├── QRCodeDialog.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── config/             # Configuration files
│   │   │   └── firebase.ts     # Firebase initialization
│   │   │
│   │   ├── contexts/           # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── LocationContext.tsx
│   │   │
│   │   ├── screens/            # Page components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── MapScreen.tsx
│   │   │   ├── BookingScreen.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   ├── HistoryScreen.tsx
│   │   │   └── OwnerDashboardScreen.tsx
│   │   │
│   │   ├── services/           # Business logic & API calls
│   │   │   ├── auth.service.ts
│   │   │   ├── firestore.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── payment.service.ts
│   │   │   └── location.service.ts
│   │   │
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   └── distance.ts     # Haversine formula
│   │   │
│   │   ├── App.tsx             # Root component
│   │   └── routes.tsx          # Route definitions
│   │
│   └── styles/                 # Global styles
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
│
├── functions/                   # Firebase Cloud Functions (optional)
│   └── src/
│       └── index.ts
│
├── SETUP_GUIDE.md              # Setup instructions
├── ARCHITECTURE.md             # This file
└── package.json
```

---

## Data Models

### User Model
```typescript
interface User {
  uid: string;                  // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: Timestamp;
}
```

### Parking Spot Model
```typescript
interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;         // In NPR
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  ownerId: string;
  ownerName?: string;
  amenities?: string[];
  images?: string[];
  rating?: number;              // Average rating (0-5)
  totalRatings?: number;
  description?: string;
  openTime?: string;
  closeTime?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Booking Model
```typescript
interface Booking {
  id: string;
  bookingId: string;            // Unique booking reference
  userId: string;
  userName?: string;
  userEmail?: string;
  parkingId: string;
  parkingName?: string;
  parkingAddress?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  hours: number;                // Calculated duration
  totalAmount: number;          // In NPR
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'esewa' | 'khalti' | 'cash';
  bookingStatus: 'active' | 'completed' | 'cancelled' | 'expired';
  qrCode?: string;              // QR code data
  transactionId?: string;       // Payment transaction ID
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  cancelledAt?: Timestamp;
}
```

### Rating Model
```typescript
interface Rating {
  id: string;
  parkingId: string;
  userId: string;
  userName?: string;
  rating: number;               // 1-5 stars
  comment?: string;
  createdAt: Timestamp;
}
```

---

## Core Features

### 1. Authentication System

**Components:**
- `LoginScreen` - Email/password authentication
- `AuthContext` - Global auth state management

**Flow:**
```
User Input → Firebase Auth → Firestore User Doc → Context State → App
```

**Security:**
- Passwords hashed by Firebase Auth
- Session managed by Firebase SDK
- Role-based access control

### 2. Map & Location System

**Components:**
- `MapScreen` - Google Maps integration
- `LocationContext` - Geolocation management

**Features:**
- Real-time user location tracking
- Custom map markers for parking spots
- Distance calculation (Haversine formula)
- Sorting by proximity

**Implementation:**
```typescript
// Distance calculation
const distance = calculateDistance(
  userLat, userLon,
  parkingLat, parkingLon
);

// Haversine formula
const R = 6371; // Earth radius in km
const dLat = toRadians(lat2 - lat1);
const dLon = toRadians(lon2 - lon1);
const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return R * c;
```

### 3. Booking System

**Components:**
- `BookingScreen` - Booking creation
- `BookingService` - Business logic

**Flow:**
```
1. User selects parking spot
2. Chooses date/time
3. System calculates price (hours × rate)
4. Validates availability
5. Creates booking (status: pending)
6. Reduces availableSpots by 1
7. Redirects to payment
```

**Validation:**
- Start time must be in future
- End time must be after start time
- Duration maximum 24 hours
- At least 1 spot available

**Price Calculation:**
```typescript
hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
totalAmount = pricePerHour × hours;
```

### 4. Payment Integration

**Supported Gateways:**
- **eSewa** - Nepal's popular digital wallet
- **Khalti** - Alternative payment gateway

**Flow:**
```
Booking Created
    ↓
Payment Screen
    ↓
User selects gateway (eSewa/Khalti)
    ↓
Redirect to payment gateway
    ↓
User completes payment
    ↓
Callback to app
    ↓
[Cloud Function] Verify payment
    ↓
Update booking: paymentStatus = 'paid'
    ↓
Show success screen with QR code
```

**Security:**
- Payment verification via Cloud Functions
- Transaction IDs stored in Firestore
- Automatic cancellation of unpaid bookings (10 min timeout)

### 5. QR Code System

**Purpose:**
- Entry validation at parking location
- Verify booking authenticity

**QR Data Structure:**
```json
{
  "bookingId": "BK170812345001234",
  "parkingId": "parking_spot_id",
  "userId": "user_uid",
  "startTime": "2026-02-15T10:00:00Z",
  "endTime": "2026-02-15T14:00:00Z"
}
```

**Usage:**
- Displayed in BookingCard
- Shown in QRCodeDialog
- Scanned by parking owner/staff

### 6. Owner Dashboard

**Features:**
- Create/edit/delete parking spots
- View statistics (total spots, available, capacity)
- Monitor bookings
- Real-time availability updates

**Access Control:**
- Only users with role='owner' can access
- Owners can only manage their own spots
- Security rules enforce ownership

---

## State Management

### Context Architecture

**AuthContext:**
- Current user data
- Authentication methods (login, register, logout)
- Role-based permissions (isOwner, isAdmin)

**LocationContext:**
- User's current location
- Location loading state
- Error handling
- Refresh functionality

**Benefits:**
- Global state without prop drilling
- Automatic re-renders on state change
- Clean separation of concerns

---

## Security

### Firebase Security Rules

**Principles:**
1. **Authentication Required** - Most operations require login
2. **Ownership Validation** - Users can only modify their own data
3. **Role-Based Access** - Owners have additional permissions
4. **Field Protection** - Critical fields cannot be modified directly

**Example Rules:**
```javascript
// Users can only read their own bookings
match /bookings/{bookingId} {
  allow read: if request.auth.uid == resource.data.userId;
}

// Only owners can create parking spots
match /parking_spots/{spotId} {
  allow create: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid))
                    .data.role == 'owner';
}

// Payment status cannot be modified directly
allow update: if !request.resource.data.diff(resource.data)
                  .affectedKeys().hasAny(['paymentStatus']);
```

### API Key Security

**Google Maps:**
- HTTP referrer restrictions
- API restrictions (only Maps JavaScript API)
- Rate limiting

**Payment Gateways:**
- Public keys for client-side
- Secret keys only in Cloud Functions
- Webhook verification

---

## Performance Optimization

### Database Queries

**Indexing:**
- Composite indexes for complex queries
- Index on frequently queried fields

**Query Optimization:**
```typescript
// Get user bookings (indexed query)
const q = query(
  collection(db, 'bookings'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);
```

### Code Splitting

- Route-based code splitting via React Router
- Lazy loading of heavy components
- Dynamic imports for payment SDKs

### Caching

- Firebase SDK built-in caching
- Browser geolocation caching
- Service worker for offline support (PWA)

---

## Scalability Considerations

### Current Architecture (MVP)

**Capacity:**
- Supports thousands of concurrent users
- Real-time updates via Firestore
- Serverless auto-scaling

**Limitations:**
- No database sharding
- No CDN for static assets
- Limited offline functionality

### Future Enhancements

**Phase 2:**
- CDN integration (Cloudflare/CloudFront)
- Advanced caching strategies
- Optimistic UI updates
- Background sync for offline bookings

**Phase 3:**
- Microservices architecture
- Dedicated payment service
- Analytics dashboard
- Machine learning for demand prediction

**Phase 4:**
- Multi-region deployment
- Real-time parking occupancy sensors
- Dynamic pricing based on demand
- Mobile native apps (Flutter)

---

## Error Handling

### Strategy

**Frontend:**
- Try-catch blocks in async operations
- User-friendly error messages via Toaster
- Fallback UI for failed data loads
- Network error handling

**Backend:**
- Cloud Functions error logging
- Firebase error reporting
- Automatic retry for transient failures

**Example:**
```typescript
try {
  await createBooking(bookingData);
  toast.success('Booking created!');
} catch (error) {
  console.error('Booking error:', error);
  toast.error('Failed to create booking. Please try again.');
}
```

---

## Testing Strategy

### Unit Tests
- Service functions (auth, booking, payment)
- Utility functions (distance calculation)
- Component logic

### Integration Tests
- Authentication flow
- Booking creation flow
- Payment processing
- Firestore operations

### End-to-End Tests
- Complete user journey
- Owner dashboard operations
- Cross-browser testing
- Mobile responsiveness

---

## Monitoring & Analytics

### Firebase Analytics
- User engagement metrics
- Screen views
- Conversion tracking
- Error rates

### Custom Events
- `booking_created`
- `payment_completed`
- `booking_cancelled`
- `parking_spot_created`

### Performance Monitoring
- Page load times
- API response times
- Database query performance
- Payment gateway latency

---

## Deployment Pipeline

### Development
```
Local Dev → Git Commit → Feature Branch
```

### Staging
```
Pull Request → Review → Merge to Develop → Auto-deploy to Staging
```

### Production
```
Merge to Main → Manual Deploy → Firebase Hosting / Vercel
```

### CI/CD (Recommended)
```yaml
# GitHub Actions example
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to Firebase
        run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## API Documentation

### Authentication Service

```typescript
// Register new user
registerUser(email, password, name, role): Promise<User>

// Login user
loginUser(email, password): Promise<User>

// Logout
signOut(): Promise<void>

// Get current user data
getCurrentUserData(uid): Promise<User | null>
```

### Booking Service

```typescript
// Create booking
createNewBooking(
  userId, userName, userEmail,
  parkingId, parkingName, parkingAddress,
  pricePerHour, startTime, endTime
): Promise<string>

// Cancel booking
cancelBooking(bookingId, parkingId): Promise<void>

// Calculate price
calculateTotalAmount(pricePerHour, startTime, endTime): number
```

### Payment Service

```typescript
// Process payment
processPayment(
  method: 'esewa' | 'khalti',
  config: {
    amount, transactionId, productName,
    onSuccess, onError
  }
): void

// Verify payment (Cloud Function)
verifyPayment(token, amount): Promise<PaymentResponse>
```

---

## Glossary

- **PWA** - Progressive Web App (installable web app)
- **Firestore** - Firebase's NoSQL database
- **Haversine** - Formula for calculating distance between coordinates
- **QR Code** - Quick Response code for entry validation
- **Serverless** - Cloud Functions that auto-scale
- **NPR** - Nepali Rupee currency
- **eSewa/Khalti** - Digital wallets popular in Nepal

---

## Contributing

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Meaningful commit messages

### Branch Strategy
- `main` - Production code
- `develop` - Development code
- `feature/*` - New features
- `bugfix/*` - Bug fixes

---

## License

MIT License - Free for commercial and personal use.

---

## Contact

For architectural questions or contributions:
- GitHub Issues
- Email: kuikelaashutosh@gmail.com
  

---

Last Updated: February 15, 2026
