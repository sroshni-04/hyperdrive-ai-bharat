import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  AlertTriangle, 
  Shield, 
  Info,
  ChevronRight,
  Ban,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Users,
  Plus,
  Car,
  Fuel,
  Gauge,
  ArrowRightLeft,
  Octagon
} from 'lucide-react';
import { INDIAN_TRAFFIC_SIGNS, ROAD_SAFETY_RULES } from '@/data/trafficSigns';

const iconMap = {
  'OctagonStop': Octagon,
  'Ban': Ban,
  'Gauge': Gauge,
  'ArrowRightLeft': ArrowRightLeft,
  'TurnLeft': ArrowLeft,
  'TurnRight': ArrowRight,
  'GraduationCap': GraduationCap,
  'Users': Users,
  'Cross': Plus,
  'Car': Car,
  'Fuel': Fuel,
};

export const RoadRulesBooklet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSigns = INDIAN_TRAFFIC_SIGNS.filter(sign => {
    const matchesSearch = sign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mandatory': return <Shield className="w-4 h-4" />;
      case 'cautionary': return <AlertTriangle className="w-4 h-4" />;
      case 'informative': return <Info className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mandatory': return 'destructive';
      case 'cautionary': return 'warning';
      case 'informative': return 'default';
      default: return 'secondary';
    }
  };

  const getSignIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center neon-glow">
          <BookOpen className="w-6 h-6 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
            Indian Road Rules Booklet
          </h1>
          <p className="text-muted-foreground">Complete traffic signs and safety regulations</p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search signs and rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
            <TabsTrigger value="cautionary">Cautionary</TabsTrigger>
            <TabsTrigger value="informative">Informative</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          <AllSigns signs={filteredSigns} getSignIcon={getSignIcon} getCategoryColor={getCategoryColor} getCategoryIcon={getCategoryIcon} />
        </TabsContent>

        <TabsContent value="mandatory" className="space-y-6">
          <CategorySigns 
            signs={filteredSigns.filter(s => s.category === 'mandatory')} 
            category="mandatory"
            getSignIcon={getSignIcon} 
            getCategoryColor={getCategoryColor} 
            getCategoryIcon={getCategoryIcon}
          />
        </TabsContent>

        <TabsContent value="cautionary" className="space-y-6">
          <CategorySigns 
            signs={filteredSigns.filter(s => s.category === 'cautionary')} 
            category="cautionary"
            getSignIcon={getSignIcon} 
            getCategoryColor={getCategoryColor} 
            getCategoryIcon={getCategoryIcon}
          />
        </TabsContent>

        <TabsContent value="informative" className="space-y-6">
          <CategorySigns 
            signs={filteredSigns.filter(s => s.category === 'informative')} 
            category="informative"
            getSignIcon={getSignIcon} 
            getCategoryColor={getCategoryColor} 
            getCategoryIcon={getCategoryIcon}
          />
        </TabsContent>
      </Tabs>

      {/* Road Safety Rules Section */}
      <Card className="glass-panel p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-success" />
          <h2 className="text-xl font-bold">Essential Road Safety Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROAD_SAFETY_RULES.map((rule) => (
            <div key={rule.id} className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">{rule.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
              <Badge variant="warning" className="text-xs">
                Penalty: {rule.penalty}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

interface SignsProps {
  signs: typeof INDIAN_TRAFFIC_SIGNS;
  getSignIcon: (iconName: string) => JSX.Element;
  getCategoryColor: (category: string) => any;
  getCategoryIcon: (category: string) => JSX.Element;
}

const AllSigns = ({ signs, getSignIcon, getCategoryColor, getCategoryIcon }: SignsProps) => (
  <div className="hypercar-grid">
    {signs.map((sign) => (
      <SignCard 
        key={sign.id} 
        sign={sign} 
        getSignIcon={getSignIcon} 
        getCategoryColor={getCategoryColor} 
        getCategoryIcon={getCategoryIcon}
      />
    ))}
  </div>
);

interface CategorySignsProps extends SignsProps {
  category: string;
}

const CategorySigns = ({ signs, category, getSignIcon, getCategoryColor, getCategoryIcon }: CategorySignsProps) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2">
      {getCategoryIcon(category)}
      <h2 className="text-2xl font-bold capitalize">{category} Signs</h2>
      <Badge variant={getCategoryColor(category) as any}>{signs.length} signs</Badge>
    </div>
    <div className="hypercar-grid">
      {signs.map((sign) => (
        <SignCard 
          key={sign.id} 
          sign={sign} 
          getSignIcon={getSignIcon} 
          getCategoryColor={getCategoryColor} 
          getCategoryIcon={getCategoryIcon}
        />
      ))}
    </div>
  </div>
);

interface SignCardProps {
  sign: typeof INDIAN_TRAFFIC_SIGNS[0];
  getSignIcon: (iconName: string) => JSX.Element;
  getCategoryColor: (category: string) => any;
  getCategoryIcon: (category: string) => JSX.Element;
}

const SignCard = ({ sign, getSignIcon, getCategoryColor, getCategoryIcon }: SignCardProps) => (
  <Card className="glass-panel p-4 hover:scale-105 transition-transform duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        {getCategoryIcon(sign.category)}
        <Badge variant={getCategoryColor(sign.category) as any} className="text-xs">
          {sign.category}
        </Badge>
      </div>
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center border-2"
        style={{ 
          backgroundColor: sign.backgroundColor,
          borderColor: sign.category === 'mandatory' ? '#DC2626' : sign.category === 'cautionary' ? '#DC2626' : '#2563EB',
          color: sign.textColor
        }}
      >
        {getSignIcon(sign.iconName)}
      </div>
    </div>
    
    <h3 className="font-semibold mb-2">{sign.name}</h3>
    <p className="text-sm text-muted-foreground mb-3">{sign.description}</p>
    
    <div className="space-y-2">
      <div className="p-2 bg-muted/20 rounded-lg">
        <p className="text-xs font-medium mb-1">Rule:</p>
        <p className="text-xs text-muted-foreground">{sign.rule}</p>
      </div>
      
      {sign.penalty && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-destructive">
            <strong>Penalty:</strong> {sign.penalty}
          </p>
        </div>
      )}
    </div>
  </Card>
);