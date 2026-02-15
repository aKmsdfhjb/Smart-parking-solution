// Main App Component
// Root component with context providers and routing

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </LocationProvider>
    </AuthProvider>
  );
}
