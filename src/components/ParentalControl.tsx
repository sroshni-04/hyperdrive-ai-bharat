import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Eye, 
  MapPin, 
  Clock, 
  Gauge, 
  AlertTriangle,
  Users,
  Activity,
  Camera,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Baby,
  User,
  Crown
} from 'lucide-react';

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'parent' | 'member' | 'child';
  status: string;
}

interface LiveSession {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'paused';
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  heading: number | null;
  battery_level: number | null;
  last_update: string;
  session_start: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  data: any;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  created_at: string;
}

interface Family {
  id: string;
  name: string;
}

export const ParentalControl = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMembers(selectedFamily);
      loadLiveSessions(selectedFamily);
      loadActivityLogs(selectedFamily);
    }
  }, [selectedFamily]);

  useEffect(() => {
    if (selectedFamily) {
      // Set up real-time subscriptions
      const liveSessionsChannel = supabase
        .channel('live-sessions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_sessions',
            filter: `family_id=eq.${selectedFamily}`
          },
          () => {
            loadLiveSessions(selectedFamily);
          }
        )
        .subscribe();

      const activityLogsChannel = supabase
        .channel('activity-logs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_logs',
            filter: `family_id=eq.${selectedFamily}`
          },
          (payload) => {
            setActivityLogs(prev => [payload.new as ActivityLog, ...prev.slice(0, 49)]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(liveSessionsChannel);
        supabase.removeChannel(activityLogsChannel);
      };
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
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('status', 'active')
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setFamilyMembers((data || []) as FamilyMember[]);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const loadLiveSessions = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('family_id', familyId)
        .order('last_update', { ascending: false });

      if (error) throw error;
      setLiveSessions((data || []) as LiveSession[]);
    } catch (error) {
      console.error('Error loading live sessions:', error);
    }
  };

  const loadActivityLogs = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-warning" />;
      case 'parent': return <Shield className="w-4 h-4 text-primary" />;
      case 'child': return <Baby className="w-4 h-4 text-success" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'location_update': return <MapPin className="w-4 h-4 text-primary" />;
      case 'speed_alert': return <Gauge className="w-4 h-4 text-warning" />;
      case 'geofence_entry':
      case 'geofence_exit': return <Shield className="w-4 h-4 text-success" />;
      case 'harsh_braking':
      case 'harsh_acceleration': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'inactive': return 'secondary';
      default: return 'muted';
    }
  };

  const selectedMemberData = familyMembers.find(m => m.user_id === selectedMember);
  const selectedMemberSession = liveSessions.find(s => s.user_id === selectedMember);
  const selectedMemberLogs = activityLogs.filter(log => log.user_id === selectedMember);

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
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Parental Control</h1>
            <p className="text-muted-foreground">Monitor and manage family driving activities</p>
          </div>
        </div>
      </div>

      {/* Family & Member Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {families.length > 1 && (
            <Select value={selectedFamily} onValueChange={setSelectedFamily}>
              <SelectTrigger className="w-48">
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
          )}

          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select member to monitor" />
            </SelectTrigger>
            <SelectContent>
              {familyMembers.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    {member.user_id} ({member.role})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {selectedMember ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Camera Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Live Camera Feed
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
              {cameraEnabled ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white">
                    <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera feed would appear here</p>
                    <p className="text-xs opacity-50 mt-1">
                      Live stream from {selectedMemberData?.user_id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Camera feed disabled</p>
                  <Button onClick={() => setCameraEnabled(true)}>
                    <Play className="w-4 h-4 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              )}
              
              {cameraEnabled && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      LIVE
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCameraEnabled(false)}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Real-time Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Status
            </h3>
            
            {selectedMemberSession ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getStatusColor(selectedMemberSession.status)}>
                        {selectedMemberSession.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Session Status</p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">
                      {selectedMemberSession.speed || 0} km/h
                    </div>
                    <p className="text-sm text-muted-foreground">Current Speed</p>
                  </div>
                </div>

                {selectedMemberSession.latitude && selectedMemberSession.longitude && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">Current Location</span>
                    </div>
                    <p className="text-sm font-mono">
                      {selectedMemberSession.latitude.toFixed(6)}, {selectedMemberSession.longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">
                      {selectedMemberSession.battery_level || 'N/A'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Battery Level</p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">
                      {selectedMemberSession.heading || 'N/A'}°
                    </div>
                    <p className="text-sm text-muted-foreground">Heading</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedMemberSession.last_update).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No active session</p>
              </div>
            )}
          </Card>

          {/* Activity Logs */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity History
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedMemberLogs.length > 0 ? (
                selectedMemberLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getActivityIcon(log.activity_type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {formatActivityType(log.activity_type)}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      {log.data && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(log.data)}
                        </p>
                      )}
                      
                      {log.latitude && log.longitude && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Location: {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                        </p>
                      )}
                      
                      {log.speed && (
                        <p className="text-xs text-muted-foreground">
                          Speed: {log.speed} km/h
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No activity logs found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a family member</h3>
          <p className="text-muted-foreground">
            Choose a family member from the dropdown above to monitor their driving activity
          </p>
        </Card>
      )}
    </div>
  );
};