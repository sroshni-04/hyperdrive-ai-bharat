import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { geofenceSchema } from '@/lib/validations';
import { z } from 'zod';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Bell,
  Map
} from 'lucide-react';

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'safe_zone' | 'restricted_zone' | 'notification_zone';
  is_active: boolean;
  created_at: string;
}

interface Family {
  id: string;
  name: string;
}

export const GeofenceManager = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
    type: 'safe_zone' as 'safe_zone' | 'restricted_zone' | 'notification_zone'
  });

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      loadGeofences(selectedFamily);
    }
  }, [selectedFamily]);

  const loadFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFamilies(data || []);
      if (data && data.length > 0) {
        setSelectedFamily(data[0].id);
      }
    } catch (error) {
      console.error('Error loading families:', error);
      toast({
        title: "Error",
        description: "Failed to load families",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGeofences = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGeofences((data || []) as Geofence[]);
    } catch (error) {
      console.error('Error loading geofences:', error);
      toast({
        title: "Error",
        description: "Failed to load geofences",
        variant: "destructive"
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: "Location Updated",
            description: "Current location set successfully"
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Error",
            description: "Failed to get current location",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFamily) {
      toast({
        title: "Error",
        description: "Please select a family",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate all inputs
      const validated = geofenceSchema.parse({
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
        type: formData.type
      });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const geofenceData = {
        family_id: selectedFamily,
        name: validated.name,
        latitude: validated.latitude,
        longitude: validated.longitude,
        radius: validated.radius,
        type: validated.type,
        created_by: userData.user.id
      };

      if (editingGeofence) {
        const { error } = await supabase
          .from('geofences')
          .update(geofenceData)
          .eq('id', editingGeofence.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Geofence updated successfully!"
        });
      } else {
        const { error } = await supabase
          .from('geofences')
          .insert(geofenceData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Geofence created successfully!"
        });
      }

      resetForm();
      loadGeofences(selectedFamily);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error saving geofence:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save geofence",
          variant: "destructive"
        });
      }
    }
  };

  const deleteGeofence = async (id: string) => {
    try {
      const { error } = await supabase
        .from('geofences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Geofence deleted successfully!"
      });

      loadGeofences(selectedFamily);
    } catch (error) {
      console.error('Error deleting geofence:', error);
      toast({
        title: "Error",
        description: "Failed to delete geofence",
        variant: "destructive"
      });
    }
  };

  const toggleGeofence = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('geofences')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Geofence ${!isActive ? 'activated' : 'deactivated'} successfully!`
      });

      loadGeofences(selectedFamily);
    } catch (error) {
      console.error('Error toggling geofence:', error);
      toast({
        title: "Error",
        description: "Failed to update geofence",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100',
      type: 'safe_zone'
    });
    setEditingGeofence(null);
    setShowCreateDialog(false);
  };

  const startEdit = (geofence: Geofence) => {
    setFormData({
      name: geofence.name,
      latitude: geofence.latitude.toString(),
      longitude: geofence.longitude.toString(),
      radius: geofence.radius.toString(),
      type: geofence.type as 'safe_zone' | 'restricted_zone' | 'notification_zone'
    });
    setEditingGeofence(geofence);
    setShowCreateDialog(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safe_zone': return <Shield className="w-4 h-4 text-success" />;
      case 'restricted_zone': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'notification_zone': return <Bell className="w-4 h-4 text-primary" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'safe_zone': return { variant: 'success' as const, label: 'Safe Zone' };
      case 'restricted_zone': return { variant: 'destructive' as const, label: 'Restricted' };
      case 'notification_zone': return { variant: 'default' as const, label: 'Notification' };
      default: return { variant: 'secondary' as const, label: type };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Geofence Management</h1>
            <p className="text-muted-foreground">Set up location-based alerts and restrictions</p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          if (!open) resetForm();
          setShowCreateDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Geofence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Geofence name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                />
                <Input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Radius (meters)"
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                />
                <Button onClick={getCurrentLocation} variant="outline" size="sm">
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
              
              <Select
                value={formData.type}
                onValueChange={(value: 'safe_zone' | 'restricted_zone' | 'notification_zone') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe_zone">Safe Zone</SelectItem>
                  <SelectItem value="restricted_zone">Restricted Zone</SelectItem>
                  <SelectItem value="notification_zone">Notification Zone</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSubmit} className="w-full">
                {editingGeofence ? 'Update Geofence' : 'Create Geofence'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Family Selection */}
      {families.length > 1 && (
        <Card className="p-4">
          <Select value={selectedFamily} onValueChange={setSelectedFamily}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Geofences List */}
      {geofences.length === 0 ? (
        <Card className="p-8 text-center">
          <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No geofences created</h3>
          <p className="text-muted-foreground mb-4">
            Create your first geofence to start monitoring locations
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Geofence
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geofences.map((geofence) => {
            const typeBadge = getTypeBadge(geofence.type);
            return (
              <Card key={geofence.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(geofence.type)}
                    <h3 className="font-semibold">{geofence.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(geofence)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGeofence(geofence.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant={typeBadge.variant}>
                    {typeBadge.label}
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Lat: {geofence.latitude.toFixed(6)}</p>
                    <p>Lng: {geofence.longitude.toFixed(6)}</p>
                    <p>Radius: {geofence.radius}m</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={geofence.is_active ? 'success' : 'secondary'}>
                      {geofence.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGeofence(geofence.id, geofence.is_active)}
                    >
                      {geofence.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};