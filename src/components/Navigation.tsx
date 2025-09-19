import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation as NavigationIcon, 
  MapPin, 
  Route, 
  Play, 
  Square, 
  Volume2,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// You'll need to add your Mapbox public token in Supabase Edge Function Secrets
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTNxbzVjb3MxbzE2MmtzZjYxZzA2YzV6In0.CJWl9XsnwEr-lqkPGw7O9A';

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState('');
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      zoom: 15,
      center: [77.2090, 28.6139], // Default to Delhi
      pitch: 45,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });

    map.current.addControl(geolocate, 'top-right');

    // Get user location
    geolocate.on('geolocate', (e: any) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  const searchRoute = async () => {
    if (!destination || !userLocation || !map.current) {
      toast({
        title: "Location Required",
        description: "Please enable location access and enter a destination",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${encodeURIComponent(destination)}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Add route to map
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          });
        } else {
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': 'hsl(var(--primary))',
              'line-width': 8,
              'line-opacity': 0.8
            }
          });
        }

        // Update route info
        setRouteDistance((route.distance / 1000).toFixed(1) + ' km');
        setRouteDuration(Math.round(route.duration / 60) + ' min');
        
        // Fit map to route
        const coordinates = route.geometry.coordinates;
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        map.current?.fitBounds(bounds, { padding: 50 });

        toast({
          title: "Route Found",
          description: `${routeDistance} • ${routeDuration}`,
        });
      }
    } catch (error) {
      toast({
        title: "Route Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startNavigation = () => {
    if (!routeDistance) {
      toast({
        title: "No Route",
        description: "Please search for a route first",
        variant: "destructive"
      });
      return;
    }

    setIsNavigating(true);
    setCurrentInstruction("Head north on the current road");
    
    // Switch to navigation mode
    if (map.current) {
      map.current.setStyle('mapbox://styles/mapbox/navigation-night-v1');
      map.current.setPitch(60);
    }

    toast({
      title: "Navigation Started",
      description: "Follow the blue route to your destination",
    });
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentInstruction('');
    
    // Switch back to day mode
    if (map.current) {
      map.current.setStyle('mapbox://styles/mapbox/navigation-day-v1');
      map.current.setPitch(45);
    }

    toast({
      title: "Navigation Stopped",
      description: "You can start navigation again anytime",
    });
  };

  return (
    <Card className={`glass-panel p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center neon-glow">
          <NavigationIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Turn-by-Turn Navigation</h3>
          <p className="text-sm text-muted-foreground">AI-powered route guidance</p>
        </div>
      </div>

      {/* Current Instruction */}
      {isNavigating && currentInstruction && (
        <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Next Instruction</span>
          </div>
          <p className="text-sm">{currentInstruction}</p>
        </div>
      )}

      {/* Route Search */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter destination (e.g., Connaught Place, Delhi)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && searchRoute()}
          />
          <Button onClick={searchRoute} size="icon">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Route Info */}
        {routeDistance && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{routeDistance}</Badge>
              <Badge variant="outline">{routeDuration}</Badge>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-2">
          {!isNavigating ? (
            <Button onClick={startNavigation} className="flex-1" disabled={!routeDistance}>
              <Play className="w-4 h-4 mr-2" />
              Start Navigation
            </Button>
          ) : (
            <Button onClick={stopNavigation} variant="destructive" className="flex-1">
              <Square className="w-4 h-4 mr-2" />
              Stop Navigation
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          {isNavigating && (
            <Badge className="bg-success text-success-foreground">
              Navigation Active
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Stats */}
      {isNavigating && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">65</p>
            <p className="text-xs text-muted-foreground">km/h</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">2.3</p>
            <p className="text-xs text-muted-foreground">km left</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">4</p>
            <p className="text-xs text-muted-foreground">min ETA</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Navigation;