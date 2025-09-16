import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, AlertTriangle, CheckCircle } from 'lucide-react';
import { SPEED_LIMITS } from '@/data/trafficSigns';

interface SpeedDetectionProps {
  isActive: boolean;
  currentSpeed: number;
}

export const SpeedDetection = ({ isActive, currentSpeed }: SpeedDetectionProps) => {
  const detectedSpeedLimit = 50; // Simulated detected speed limit
  const speedPercentage = (currentSpeed / detectedSpeedLimit) * 100;
  const isOverSpeeding = currentSpeed > detectedSpeedLimit;
  const isNearLimit = currentSpeed > detectedSpeedLimit * 0.9;

  const getSpeedStatus = () => {
    if (isOverSpeeding) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
        message: 'Speed limit exceeded!',
        color: 'destructive' as const,
        penalty: '₹1000-2000 fine'
      };
    } else if (isNearLimit) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-warning" />,
        message: 'Approaching speed limit',
        color: 'warning' as const,
        penalty: null
      };
    } else {
      return {
        icon: <CheckCircle className="w-4 h-4 text-success" />,
        message: 'Speed within limits',
        color: 'success' as const,
        penalty: null
      };
    }
  };

  const speedGaugeColor = isOverSpeeding ? 'destructive' : 
                         isNearLimit ? 'warning' : 'success';

  const status = getSpeedStatus();

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <span className="font-semibold">Speed Detection</span>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </Badge>
      </div>

      {/* Speed Gauge */}
      <div className="mb-6">
        <div className="flex items-end justify-center mb-4">
          <div className="text-center">
            <div className={`metric-display text-4xl mb-1 ${
              isOverSpeeding ? 'text-destructive' : 
              isNearLimit ? 'text-warning' : 'text-primary'
            }`}>
              {Math.round(currentSpeed)}
            </div>
            <div className="text-sm text-muted-foreground">km/h</div>
          </div>
        </div>
        
        <Progress 
          value={Math.min(speedPercentage, 100)} 
          className="h-3 mb-2"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-semibold text-primary">Limit: {detectedSpeedLimit}</span>
          <span>{detectedSpeedLimit + 20}</span>
        </div>
      </div>

      {/* Status Information */}
      <div className="flex items-center gap-2 mb-3">
        {status.icon}
        <span className="text-sm font-medium">{status.message}</span>
      </div>

      <Badge variant={status.color} className="mb-4">
        {isOverSpeeding ? 'OVER LIMIT' : isNearLimit ? 'NEAR LIMIT' : 'SAFE SPEED'}
      </Badge>

      {/* Detection Info */}
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex justify-between">
          <span>Detected Limit:</span>
          <span className="font-mono">{detectedSpeedLimit} km/h</span>
        </div>
        <div className="flex justify-between">
          <span>Current Zone:</span>
          <span>Urban Road</span>
        </div>
        <div className="flex justify-between">
          <span>Detection Confidence:</span>
          <span className="font-mono">{isActive ? '97%' : '0%'}</span>
        </div>
      </div>

      {/* Speed Limit Sign Visualization */}
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-white rounded-full border-4 border-destructive flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{detectedSpeedLimit}</div>
            <div className="text-xs text-destructive">km/h</div>
          </div>
        </div>
      </div>

      {/* Penalty Warning */}
      {status.penalty && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-destructive">
            <strong>Penalty:</strong> {status.penalty}
          </p>
        </div>
      )}

      {/* Speed Rules */}
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Speed Rule:</strong> Maintain speed within posted limits. 
          Urban areas: 50 km/h, Highways: 80-100 km/h.
        </p>
      </div>
    </Card>
  );
};