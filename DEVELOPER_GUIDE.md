# Developer Guide - Smart Parking PWA

Quick reference guide for developers working on the Smart Parking application.

## 🎯 Quick Links

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Cloud Functions](./CLOUD_FUNCTIONS.md) - Backend functions
- [Sample Data](./SAMPLE_DATA.md) - Test data

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# Run on specific port
npm run dev -- --port 3000

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Structure

```
src/app/
├── components/     # Reusable UI components
├── screens/        # Page components
├── services/       # Business logic
├── contexts/       # State management
├── types/          # TypeScript definitions
├── utils/          # Helper functions
└── config/         # Configuration files
```

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad - Implicit any
function getUser(id) {
  // ...
}
```

### Component Structure

```typescript
// Component template
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Service Functions

```typescript
// Service template
export async function functionName(
  param1: Type1,
  param2: Type2
): Promise<ReturnType> {
  try {
    // Logic here
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## 🔥 Firebase Operations

### Firestore CRUD

```typescript
import { db } from '../config/firebase';
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
} from 'firebase/firestore';

// Create
const docRef = await addDoc(collection(db, 'bookings'), data);

// Read single
const docSnap = await getDoc(doc(db, 'bookings', id));
const data = docSnap.data();

// Read multiple
const querySnapshot = await getDocs(collection(db, 'bookings'));
const items = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Query
const q = query(
  collection(db, 'bookings'),
  where('userId', '==', userId)
);
const snapshot = await getDocs(q);

// Update
await updateDoc(doc(db, 'bookings', id), { field: value });

// Delete
await deleteDoc(doc(db, 'bookings', id));
```

### Authentication

```typescript
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

// Sign in
const userCredential = await signInWithEmailAndPassword(
  auth,
  email,
  password
);

// Sign up
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);

// Sign out
await signOut(auth);

// Get current user
const currentUser = auth.currentUser;
```

## 🗺️ Google Maps Integration

### Basic Map

```typescript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';

function MapComponent() {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        center={{ lat: 27.7172, lng: 85.324 }}
        zoom={13}
        mapContainerStyle={{ width: '100%', height: '400px' }}
      >
        <Marker position={{ lat: 27.7172, lng: 85.324 }} />
      </GoogleMap>
    </LoadScript>
  );
}
```

### Distance Calculation

```typescript
import { calculateDistance } from '../utils/distance';

const distance = calculateDistance(
  userLat,
  userLon,
  parkingLat,
  parkingLon
);
// Returns distance in kilometers
```

## 💳 Payment Integration

### eSewa Payment

```typescript
import { processPayment } from '../services/payment.service';

processPayment('esewa', {
  amount: 500,
  transactionId: bookingId,
  productName: 'Parking Booking',
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

### Khalti Payment

```typescript
processPayment('khalti', {
  amount: 500,
  transactionId: bookingId,
  productName: 'Parking Booking',
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

## 🎨 UI Components

### Using Radix UI Components

```typescript
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="input">Label</Label>
          <Input id="input" placeholder="Enter text" />
        </div>
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Booking created!');

// Error
toast.error('Failed to create booking');

// With description
toast.success('Payment successful', {
  description: 'Your booking is confirmed',
});

// Loading
const toastId = toast.loading('Processing payment...');
// Later
toast.success('Payment complete', { id: toastId });
```

## 🔐 Context Usage

### Auth Context

```typescript
import { useAuth } from '../contexts/AuthContext';

function Component() {
  const { user, login, logout, isOwner } = useAuth();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      {isOwner && <OwnerFeatures />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Location Context

```typescript
import { useLocation } from '../contexts/LocationContext';

function Component() {
  const { location, loading, error, refreshLocation } = useLocation();

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Lat: {location?.latitude}</p>
      <p>Lng: {location?.longitude}</p>
      <button onClick={refreshLocation}>Refresh</button>
    </div>
  );
}
```

## 🧪 Testing

### Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

test('handles click', () => {
  const handleClick = jest.fn();
  render(<Component onClick={handleClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Testing Services

```typescript
import { createBooking } from '../services/booking.service';

describe('BookingService', () => {
  it('creates booking successfully', async () => {
    const bookingId = await createBooking(data);
    expect(bookingId).toBeDefined();
  });

  it('throws error on invalid data', async () => {
    await expect(createBooking(invalidData)).rejects.toThrow();
  });
});
```

## 📱 Responsive Design

### Tailwind Breakpoints

```typescript
// Mobile first approach
<div className="
  w-full           // Mobile
  md:w-1/2         // Tablet
  lg:w-1/3         // Desktop
  xl:w-1/4         // Large desktop
">
  Content
</div>

// Hide/show at breakpoints
<div className="
  hidden           // Hidden on mobile
  md:block         // Visible on tablet+
">
  Desktop content
</div>
```

### Common Patterns

```typescript
// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Flex layout
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Left</div>
  <div className="flex-1">Right</div>
</div>

// Container
<div className="max-w-7xl mx-auto px-4 py-6">
  Content
</div>
```

## 🚀 Performance Tips

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function Component({ data }) {
  // Memoize expensive calculations
  const processed = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  // Memoize callbacks
  const handleClick = useCallback(() => {
    // Handler logic
  }, []);

  return <div>{processed}</div>;
}
```

### Optimize Firestore Queries

```typescript
// ✅ Good - Indexed query with limit
const q = query(
  collection(db, 'bookings'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// ❌ Bad - Fetching all documents
const allDocs = await getDocs(collection(db, 'bookings'));
```

## 🐛 Debugging

### Console Logging

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Structured logging
console.group('Booking Creation');
console.log('User:', user);
console.log('Parking:', parking);
console.log('Amount:', amount);
console.groupEnd();
```

### Firebase Debugging

```typescript
// Enable Firestore debug logging
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db, { 
  synchronizeTabs: true 
}).catch((err) => {
  console.error('Persistence error:', err);
});
```

### React DevTools

- Install React Developer Tools extension
- Use Components tab to inspect component tree
- Use Profiler tab to identify performance issues

## 📦 Common Packages

### Date Handling

```typescript
import { format, addHours, differenceInHours } from 'date-fns';

const formatted = format(new Date(), 'MMM dd, yyyy');
const future = addHours(new Date(), 3);
const diff = differenceInHours(endDate, startDate);
```

### Form Validation

```typescript
import { useForm } from 'react-hook-form';

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>This field is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🔧 Environment Variables

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_GOOGLE_MAPS_KEY=your_maps_key
VITE_ESEWA_MERCHANT_ID=your_merchant_id
```

```typescript
// Usage in code
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub

# After merge, update main
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/new-feature
```

### Commit Message Convention

```
feat: add new feature
fix: fix bug in component
docs: update documentation
style: format code
refactor: refactor service
test: add tests
chore: update dependencies
```

## 🔍 Troubleshooting

### Common Issues

**Firebase connection error:**
```typescript
// Check Firebase config
console.log('Firebase config:', firebaseConfig);
// Verify API key is correct
// Check network tab in DevTools
```

**Map not loading:**
```typescript
// Verify API key
// Check browser console for errors
// Ensure Maps JavaScript API is enabled
// Check API restrictions
```

**Payment not working:**
```typescript
// Use test/sandbox mode first
// Check merchant credentials
// Verify callback URLs
// Review browser console
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or with pnpm
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## 📚 Learning Resources

### Documentation
- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Tutorials
- [Firebase Tutorial](https://firebase.google.com/docs/web/setup)
- [React Google Maps](https://react-google-maps-api-docs.netlify.app/)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

## 💡 Best Practices

1. **Always use TypeScript** - Type safety prevents bugs
2. **Handle errors gracefully** - Show user-friendly messages
3. **Optimize queries** - Use Firestore indexes
4. **Secure data** - Implement proper security rules
5. **Test thoroughly** - Write tests for critical features
6. **Document code** - Add comments for complex logic
7. **Follow conventions** - Consistent code style
8. **Use contexts wisely** - Don't overuse global state
9. **Optimize performance** - Lazy load heavy components
10. **Keep it simple** - Write clean, maintainable code

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write/update tests
5. Commit with conventional messages
6. Push and create PR
7. Wait for review

## 📞 Support

- 💬 Team Chat: Slack/Discord
- 📧 Email: kuikelaashutosh@gmail.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: Internal Wiki

---

**Happy Coding! 🚀**

Last Updated: February 15, 2026
