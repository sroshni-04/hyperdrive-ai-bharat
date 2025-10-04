import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Gauge, 
  Route as RouteIcon, 
  Shield, 
  Camera, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  LogOut
} from 'lucide-react';
import { LaneDetection } from './LaneDetection';
import { SpeedDetection } from './SpeedDetection';
import { SignRecognition } from './SignRecognition';
import NavigationMap from './Navigation';

interface DashboardMetrics {
  speed: number;
  laneStatus: 'centered' | 'left-drift' | 'right-drift';
  detectedSigns: string[];
  safetyScore: number;
  followingDistance: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    speed: 45,
    laneStatus: 'centered',
    detectedSigns: ['Speed Limit 50', 'No Overtaking'],
    safetyScore: 92,
    followingDistance: 3.2
  });

  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (isActive) {
        setMetrics(prev => ({
          ...prev,
          speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 10),
          followingDistance: Math.max(1, prev.followingDistance + (Math.random() - 0.5) * 0.5),
          safetyScore: Math.min(100, Math.max(0, prev.safetyScore + (Math.random() - 0.5) * 5))
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'centered': return 'success';
      case 'left-drift':
      case 'right-drift': return 'warning';
      default: return 'muted';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center neon-glow">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Driver Assistant
            </h1>
            <p className="text-muted-foreground">Hypercar Intelligence System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">System Time</div>
            <div className="font-mono text-lg">{currentTime.toLocaleTimeString()}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <a href="/family">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Family
              </Button>
            </a>
            <a href="/parental-control">
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Parental Control
              </Button>
            </a>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "neon-glow" : ""}
          >
            {isActive ? (
              <>
                <Shield className="w-4 h-4 mr-2" />
                System Active
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Activate System
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="hypercar-grid mb-8">
        {/* Speed Metric */}
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" />
              <span className="font-semibold">Speed</span>
            </div>
            <div className={`status-indicator ${isActive ? 'bg-success' : 'bg-muted'}`} />
          </div>
          <div className="metric-display text-primary">
            {Math.round(metrics.speed)} km/h
          </div>
          <p className="text-sm text-muted-foreground mt-2">Current vehicle speed</p>
        </Card>

        {/* Lane Status */}
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">Lane Position</span>
            </div>
            <div className={`status-indicator ${isActive ? 'bg-success' : 'bg-muted'}`} />
          </div>
          <Badge variant={getStatusColor(metrics.laneStatus)} className="mb-2">
            {metrics.laneStatus.replace('-', ' ').toUpperCase()}
          </Badge>
          <p className="text-sm text-muted-foreground">Lane detection status</p>
        </Card>

        {/* Safety Score */}
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Safety Score</span>
            </div>
            <div className={`status-indicator ${isActive ? 'bg-success' : 'bg-muted'}`} />
          </div>
          <div className={`metric-display text-${getSafetyScoreColor(metrics.safetyScore)}`}>
            {Math.round(metrics.safetyScore)}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">Overall safety rating</p>
        </Card>

        {/* Following Distance */}
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">Following Distance</span>
            </div>
            <div className={`status-indicator ${isActive ? 'bg-success' : 'bg-muted'}`} />
          </div>
          <div className="metric-display text-primary">
            {metrics.followingDistance.toFixed(1)}s
          </div>
          <p className="text-sm text-muted-foreground mt-2">Safe following time</p>
        </Card>
      </div>

      {/* Detection Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        <LaneDetection isActive={isActive} laneStatus={metrics.laneStatus} />
        <SpeedDetection isActive={isActive} currentSpeed={metrics.speed} />
        <SignRecognition isActive={isActive} detectedSigns={metrics.detectedSigns} />
      </div>

      {/* Navigation Component */}
      <NavigationMap className="mb-8" />

      {/* Recent Alerts */}
      <Card className="glass-panel p-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Recent Alerts</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Speed limit ahead: 40 km/h</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Lane keeping assist active</p>
              <p className="text-xs text-muted-foreground">{new Date(Date.now() - 30000).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};