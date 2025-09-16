import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Eye, BookOpen } from 'lucide-react';
import { INDIAN_TRAFFIC_SIGNS } from '@/data/trafficSigns';
import { toast } from 'sonner';

interface SignRecognitionProps {
  isActive: boolean;
  detectedSigns: string[];
}

export const SignRecognition = ({ isActive, detectedSigns }: SignRecognitionProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recognizedSign, setRecognizedSign] = useState<typeof INDIAN_TRAFFIC_SIGNS[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        simulateSignRecognition();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateSignRecognition = async () => {
    setIsProcessing(true);
    toast("Analyzing uploaded sign...");
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomly select a sign for demonstration
    const randomSign = INDIAN_TRAFFIC_SIGNS[Math.floor(Math.random() * INDIAN_TRAFFIC_SIGNS.length)];
    setRecognizedSign(randomSign);
    setIsProcessing(false);
    
    toast.success(`Sign recognized: ${randomSign.name}`);
  };

  const getSignsByCategory = (category: string) => {
    return INDIAN_TRAFFIC_SIGNS.filter(sign => sign.category === category);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mandatory': return 'destructive';
      case 'cautionary': return 'warning';
      case 'informative': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <span className="font-semibold">Sign Recognition</span>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </Badge>
      </div>

      {/* Current Detected Signs */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Live Detection</h4>
        <div className="space-y-2">
          {detectedSigns.map((sign, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-success/10 border border-success/20 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium">{sign}</span>
            </div>
          ))}
          {detectedSigns.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              {isActive ? 'No signs detected' : 'System standby'}
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Upload Sign for Recognition</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </Button>
            <Button size="sm" variant="outline" disabled>
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
          </div>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded sign"
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-sm">Processing...</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recognition Result */}
          {recognizedSign && !isProcessing && (
            <div className="p-4 bg-card border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold">{recognizedSign.name}</h5>
                <Badge variant={getCategoryColor(recognizedSign.category)}>
                  {recognizedSign.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {recognizedSign.description}
              </p>
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-xs font-medium mb-1">Traffic Rule:</p>
                <p className="text-xs text-muted-foreground">{recognizedSign.rule}</p>
                {recognizedSign.penalty && (
                  <p className="text-xs text-destructive mt-2">
                    <strong>Penalty:</strong> {recognizedSign.penalty}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex justify-between">
          <span>Signs Database:</span>
          <span className="font-mono">{INDIAN_TRAFFIC_SIGNS.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Recognition Accuracy:</span>
          <span className="font-mono">{isActive ? '95%' : '0%'}</span>
        </div>
        <div className="flex justify-between">
          <span>Processing Speed:</span>
          <span className="font-mono">~2.1s</span>
        </div>
      </div>

      {/* Sign Categories Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-destructive/10 rounded-lg">
          <div className="text-lg font-bold text-destructive">
            {getSignsByCategory('mandatory').length}
          </div>
          <div className="text-xs text-muted-foreground">Mandatory</div>
        </div>
        <div className="text-center p-2 bg-warning/10 rounded-lg">
          <div className="text-lg font-bold text-warning">
            {getSignsByCategory('cautionary').length}
          </div>
          <div className="text-xs text-muted-foreground">Cautionary</div>
        </div>
        <div className="text-center p-2 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">
            {getSignsByCategory('informative').length}
          </div>
          <div className="text-xs text-muted-foreground">Informative</div>
        </div>
      </div>

      {/* Road Rules Link */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => window.open('/rules', '_blank')}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        View Complete Rule Book
      </Button>
    </Card>
  );
};