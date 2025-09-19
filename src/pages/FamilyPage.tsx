import { FamilyManagement } from '@/components/FamilyManagement';
import { GeofenceManager } from '@/components/GeofenceManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FamilyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="family" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="family">Family Management</TabsTrigger>
            <TabsTrigger value="geofence">Geofences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="family" className="mt-6">
            <FamilyManagement />
          </TabsContent>
          
          <TabsContent value="geofence" className="mt-6">
            <GeofenceManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilyPage;