import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  BookOpen, 
  Camera, 
  Zap,
  Shield,
  Gauge,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { RoadRulesBooklet } from '@/components/RoadRulesBooklet';
import { RoadRulesChatbot } from '@/components/RoadRulesChatbot';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);

  if (activeTab === 'dashboard') {
    return (
      <>
        <Dashboard />
        <RoadRulesChatbot 
          isMinimized={isChatbotMinimized}
          onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
        />
      </>
    );
  }

  if (activeTab === 'rules') {
    return (
      <>
        <div>
          <Button 
            onClick={() => setActiveTab('dashboard')} 
            variant="outline" 
            className="m-6 mb-0"
          >
            ← Back to Dashboard
          </Button>
          <RoadRulesBooklet />
        </div>
        <RoadRulesChatbot 
          isMinimized={isChatbotMinimized}
          onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.1),transparent_50%)]" />
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center neon-glow">
                <Eye className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                AI Driver Assistant
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience hypercar-level intelligence for Indian roads. Advanced lane detection, 
              sign recognition, and real-time safety monitoring.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="neon-glow"
                onClick={() => setActiveTab('dashboard')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setActiveTab('rules')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Road Rules Guide
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="hypercar-grid mb-16">
            <FeatureCard
              icon={<Navigation className="w-8 h-8 text-success" />}
              title="Lane Detection"
              description="Real-time lane tracking with drift alerts for safer driving on Indian roads."
              accent="success"
            />
            <FeatureCard
              icon={<Gauge className="w-8 h-8 text-warning" />}
              title="Speed Monitoring"
              description="Intelligent speed limit detection and over-speeding warnings with penalty information."
              accent="warning"
            />
            <FeatureCard
              icon={<Camera className="w-8 h-8 text-primary" />}
              title="Sign Recognition"
              description="AI-powered recognition of Indian traffic signs with instant rule explanations."
              accent="primary"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-accent" />}
              title="Safety Scoring"
              description="Continuous safety assessment with personalized driving recommendations."
              accent="accent"
            />
          </div>

          {/* Indian Road Safety Compliance */}
          <Card className="glass-panel p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-success to-success-glow flex items-center justify-center neon-glow-success">
                <Shield className="w-8 h-8 text-success-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Indian Road Safety Compliant</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Built according to Indian Road Safety Handbook with comprehensive traffic rules, 
              sign database, and penalty information for all states.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="success">Motor Vehicle Act 2019</Badge>
              <Badge variant="default">Indian Road Safety Handbook</Badge>
              <Badge variant="secondary">All State Compliant</Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Chatbot */}
      <RoadRulesChatbot 
        isMinimized={isChatbotMinimized}
        onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
      />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: 'primary' | 'success' | 'warning' | 'accent';
}

const FeatureCard = ({ icon, title, description, accent }: FeatureCardProps) => {
  const getAccentClasses = (accent: string) => {
    switch (accent) {
      case 'success': return 'neon-glow-success';
      case 'warning': return 'neon-glow-warning';
      case 'accent': return 'border-accent/20';
      default: return 'neon-glow';
    }
  };

  return (
    <Card className={`glass-panel p-6 hover:scale-105 transition-all duration-300 ${getAccentClasses(accent)}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="flex items-center text-primary text-sm font-medium">
        Learn more <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </Card>
  );
};

export default Index;
