// Owner Dashboard Screen
// Allows parking owners to manage their parking spots and view bookings

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ParkingSpot, Booking } from '../types';
import {
  getParkingSpotsByOwner,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot,
  getParkingBookings,
} from '../services/firestore.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Building2,
  Car,
  IndianRupee,
  MapPin,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Timestamp } from 'firebase/firestore';

export function OwnerDashboardScreen() {
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);

  useEffect(() => {
    if (!isOwner) {
      navigate('/map');
      return;
    }
    if (user) {
      loadParkingSpots();
    }
  }, [user, isOwner]);

  const loadParkingSpots = async () => {
    if (!user) return;

    try {
      const spots = await getParkingSpotsByOwner(user.uid);
      setParkingSpots(spots);
    } catch (error) {
      toast.error('Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpot = () => {
    setEditingSpot(null);
    setShowAddDialog(true);
  };

  const handleEditSpot = (spot: ParkingSpot) => {
    setEditingSpot(spot);
    setShowAddDialog(true);
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!confirm('Are you sure you want to delete this parking spot?')) return;

    try {
      await deleteParkingSpot(spotId);
      toast.success('Parking spot deleted');
      await loadParkingSpots();
    } catch (error) {
      toast.error('Failed to delete parking spot');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/map')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">Owner Dashboard</h1>
            </div>
          </div>

          <Button onClick={handleAddSpot}>
            <Plus className="w-4 h-4 mr-2" />
            Add Parking
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Parking Spots</p>
                  <p className="text-3xl font-bold">{parkingSpots.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Spots</p>
                  <p className="text-3xl font-bold">
                    {parkingSpots.reduce((sum, p) => sum + p.availableSpots, 0)}
                  </p>
                </div>
                <Car className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-3xl font-bold">
                    {parkingSpots.reduce((sum, p) => sum + p.totalSpots, 0)}
                  </p>
                </div>
                <Car className="w-12 h-12 text-gray-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parking Spots List */}
        {parkingSpots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                No parking spots yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first parking spot to start earning
              </p>
              <Button onClick={handleAddSpot}>
                <Plus className="w-4 h-4 mr-2" />
                Add Parking Spot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parkingSpots.map((spot) => (
              <Card key={spot.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{spot.name}</CardTitle>
                    <Badge
                      variant={spot.availableSpots > 0 ? 'default' : 'destructive'}
                    >
                      {spot.availableSpots > 0 ? 'Available' : 'Full'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                    <span>{spot.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
                      <span className="font-semibold">Rs {spot.pricePerHour}/hr</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Car className="w-4 h-4 mr-1 text-blue-600" />
                      <span>
                        {spot.availableSpots}/{spot.totalSpots}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditSpot(spot)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSpot(spot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <ParkingSpotDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        spot={editingSpot}
        ownerId={user?.uid || ''}
        ownerName={user?.name || ''}
        onSuccess={() => {
          loadParkingSpots();
          setShowAddDialog(false);
        }}
      />
    </div>
  );
}

// Parking Spot Add/Edit Dialog
interface ParkingSpotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: ParkingSpot | null;
  ownerId: string;
  ownerName: string;
  onSuccess: () => void;
}

function ParkingSpotDialog({
  open,
  onOpenChange,
  spot,
  ownerId,
  ownerName,
  onSuccess,
}: ParkingSpotDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pricePerHour: '',
    latitude: '',
    longitude: '',
    totalSpots: '',
    description: '',
  });

  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name,
        address: spot.address,
        pricePerHour: spot.pricePerHour.toString(),
        latitude: spot.latitude.toString(),
        longitude: spot.longitude.toString(),
        totalSpots: spot.totalSpots.toString(),
        description: spot.description || '',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        pricePerHour: '',
        latitude: '',
        longitude: '',
        totalSpots: '',
        description: '',
      });
    }
  }, [spot, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        name: formData.name,
        address: formData.address,
        pricePerHour: parseFloat(formData.pricePerHour),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        totalSpots: parseInt(formData.totalSpots),
        availableSpots: spot
          ? spot.availableSpots
          : parseInt(formData.totalSpots),
        description: formData.description,
        ownerId,
        ownerName,
      };

      if (spot) {
        await updateParkingSpot(spot.id, data);
        toast.success('Parking spot updated');
      } else {
        await createParkingSpot({
          ...data,
          createdAt: Timestamp.now(),
        });
        toast.success('Parking spot created');
      }

      onSuccess();
    } catch (error) {
      toast.error('Failed to save parking spot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {spot ? 'Edit Parking Spot' : 'Add Parking Spot'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Parking Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., City Center Parking"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                placeholder="27.7172"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                placeholder="85.324"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Hour (Rs) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerHour}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerHour: e.target.value })
                }
                placeholder="50"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spots">Total Spots *</Label>
              <Input
                id="spots"
                type="number"
                value={formData.totalSpots}
                onChange={(e) =>
                  setFormData({ ...formData, totalSpots: e.target.value })
                }
                placeholder="20"
                required
                min="1"
                disabled={!!spot}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional details about the parking"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : spot
                ? 'Update Parking'
                : 'Add Parking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
