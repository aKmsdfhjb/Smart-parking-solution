// Routes Configuration
// Defines all application routes using React Router

import { createBrowserRouter, Navigate } from 'react-router';
import { LoginScreen } from './screens/LoginScreen';
import { MapScreen } from './screens/MapScreen';
import { BookingScreen } from './screens/BookingScreen';
import { PaymentScreen, PaymentSuccessScreen } from './screens/PaymentScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { OwnerDashboardScreen } from './screens/OwnerDashboardScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginScreen />,
  },
  {
    path: '/map',
    element: <MapScreen />,
  },
  {
    path: '/booking/:parkingId',
    element: <BookingScreen />,
  },
  {
    path: '/payment/:bookingId',
    element: <PaymentScreen />,
  },
  {
    path: '/payment/success',
    element: <PaymentSuccessScreen />,
  },
  {
    path: '/history',
    element: <HistoryScreen />,
  },
  {
    path: '/owner-dashboard',
    element: <OwnerDashboardScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
