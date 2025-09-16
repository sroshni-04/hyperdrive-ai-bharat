import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, AlertTriangle, CheckCircle } from 'lucide-react';

interface LaneDetectionProps {
  isActive: boolean;
  laneStatus: 'centered' | 'left-drift' | 'right-drift';
}

export const LaneDetection = ({ isActive, laneStatus }: LaneDetectionProps) => {
  const getLaneVisualization = () => {
    const lanePosition = laneStatus === 'left-drift' ? '20%' : 
                        laneStatus === 'right-drift' ? '80%' : '50%';
    
    return (
      <div className="relative h-32 bg-muted/20 rounded-lg overflow-hidden">
        {/* Road Surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/50" />
        
        {/* Lane Markings */}
        <div className="absolute left-0 top-0 w-1 h-full bg-primary/60" />
        <div className="absolute left-1/3 top-0 w-0.5 h-full bg-primary/40 opacity-60" 
             style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 8px, hsl(var(--primary)) 8px, hsl(var(--primary)) 16px)' }} />
        <div className="absolute left-2/3 top-0 w-0.5 h-full bg-primary/40 opacity-60"
             style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 8px, hsl(var(--primary)) 8px, hsl(var(--primary)) 16px)' }} />
        <div className="absolute right-0 top-0 w-1 h-full bg-primary/60" />

        {/* Vehicle Position */}
        <div 
          className={`absolute top-1/2 w-6 h-12 rounded-sm transition-all duration-500 ${
            isActive ? 'bg-primary neon-glow' : 'bg-muted'
          }`}
          style={{ 
            left: lanePosition, 
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Lane Boundaries Highlight */}
        {laneStatus !== 'centered' && isActive && (
          <div className={`absolute inset-0 border-2 rounded-lg ${
            laneStatus === 'left-drift' ? 'border-warning/50' : 'border-warning/50'
          }`} />
        )}
      </div>
    );
  };

  const getStatusInfo = () => {
    switch (laneStatus) {
      case 'centered':
        return {
          icon: <CheckCircle className="w-4 h-4 text-success" />,
          message: 'Vehicle centered in lane',
          color: 'success' as const
        };
      case 'left-drift':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-warning" />,
          message: 'Drifting towards left lane',
          color: 'warning' as const
        };
      case 'right-drift':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-warning" />,
          message: 'Drifting towards right lane',
          color: 'warning' as const
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <span className="font-semibold">Lane Detection</span>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </Badge>
      </div>

      {/* Lane Visualization */}
      <div className="mb-4">
        {getLaneVisualization()}
      </div>

      {/* Status Information */}
      <div className="flex items-center gap-2 mb-3">
        {statusInfo.icon}
        <span className="text-sm font-medium">{statusInfo.message}</span>
      </div>

      <Badge variant={statusInfo.color} className="mb-4">
        {laneStatus.replace('-', ' ').toUpperCase()}
      </Badge>

      {/* Detection Info */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Lane Width:</span>
          <span className="font-mono">3.5m</span>
        </div>
        <div className="flex justify-between">
          <span>Marking Type:</span>
          <span>Dashed</span>
        </div>
        <div className="flex justify-between">
          <span>Confidence:</span>
          <span className="font-mono">{isActive ? '94%' : '0%'}</span>
        </div>
      </div>

      {/* Lane Rules */}
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Lane Rule:</strong> Maintain center position within lane markings. 
          Dashed lines allow safe lane changes when clear.
        </p>
      </div>
    </Card>
  );
};