import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Search,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { INDIAN_TRAFFIC_SIGNS, ROAD_SAFETY_RULES } from '@/data/trafficSigns';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  relatedSigns?: typeof INDIAN_TRAFFIC_SIGNS;
}

interface RoadRulesChatbotProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const RoadRulesChatbot = ({ isMinimized = false, onToggleMinimize }: RoadRulesChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI Road Rules Assistant. Ask me anything about Indian traffic signs, road safety rules, or driving regulations. Try asking 'What is a stop sign?' or 'Tell me about speed limits'.",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantSigns = (query: string): typeof INDIAN_TRAFFIC_SIGNS => {
    const lowercaseQuery = query.toLowerCase();
    return INDIAN_TRAFFIC_SIGNS.filter(sign => 
      sign.name.toLowerCase().includes(lowercaseQuery) ||
      sign.description.toLowerCase().includes(lowercaseQuery) ||
      sign.rule.toLowerCase().includes(lowercaseQuery) ||
      sign.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const findRelevantRules = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return ROAD_SAFETY_RULES.filter(rule =>
      rule.title.toLowerCase().includes(lowercaseQuery) ||
      rule.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const generateBotResponse = (userQuery: string): { content: string; relatedSigns?: typeof INDIAN_TRAFFIC_SIGNS } => {
    const query = userQuery.toLowerCase();
    
    // Find relevant signs and rules
    const relevantSigns = findRelevantSigns(query);
    const relevantRules = findRelevantRules(query);

    // Specific query patterns
    if (query.includes('stop sign') || query.includes('stop')) {
      const stopSign = INDIAN_TRAFFIC_SIGNS.find(s => s.id === 'stop');
      return {
        content: stopSign ? 
          `A stop sign requires a complete stop before proceeding. ${stopSign.rule} The penalty for not stopping is ${stopSign.penalty}.` :
          "A stop sign requires you to come to a complete stop before proceeding through an intersection.",
        relatedSigns: stopSign ? [stopSign] : []
      };
    }

    if (query.includes('speed limit') || query.includes('speed')) {
      const speedSigns = INDIAN_TRAFFIC_SIGNS.filter(s => s.name.toLowerCase().includes('speed'));
      return {
        content: "Speed limits in India vary by area: 25 km/h in school zones, 40-50 km/h in city areas, and up to 100 km/h on highways. Always follow posted speed limit signs. Over-speeding fines range from ₹1000-2000.",
        relatedSigns: speedSigns
      };
    }

    if (query.includes('school zone') || query.includes('school')) {
      const schoolSign = INDIAN_TRAFFIC_SIGNS.find(s => s.id === 'school-zone');
      return {
        content: schoolSign ?
          `In school zones, reduce speed to 25 km/h during school hours. ${schoolSign.rule} Penalty: ${schoolSign.penalty}` :
          "School zones require extra caution. Reduce speed to 25 km/h during school hours.",
        relatedSigns: schoolSign ? [schoolSign] : []
      };
    }

    if (query.includes('helmet') || query.includes('two wheeler')) {
      const helmetRule = ROAD_SAFETY_RULES.find(r => r.id === 'helmet');
      return {
        content: helmetRule ?
          `${helmetRule.description} Penalty: ${helmetRule.penalty}` :
          "Both rider and pillion must wear ISI marked helmets on two-wheelers.",
        relatedSigns: []
      };
    }

    if (query.includes('seatbelt') || query.includes('seat belt')) {
      const seatbeltRule = ROAD_SAFETY_RULES.find(r => r.id === 'seatbelt');
      return {
        content: seatbeltRule ?
          `${seatbeltRule.description} Penalty: ${seatbeltRule.penalty}` :
          "All occupants must wear seat belts. Fine of ₹1000 for non-compliance.",
        relatedSigns: []
      };
    }

    if (query.includes('mobile') || query.includes('phone')) {
      const phoneRule = ROAD_SAFETY_RULES.find(r => r.id === 'mobile-phone');
      return {
        content: phoneRule ?
          `${phoneRule.description} Penalty: ${phoneRule.penalty}` :
          "Using mobile phone while driving is prohibited. Fine of ₹5000 for first offense.",
        relatedSigns: []
      };
    }

    if (query.includes('mandatory') || query.includes('compulsory')) {
      const mandatorySigns = relevantSigns.filter(s => s.category === 'mandatory');
      return {
        content: `Mandatory signs (circular with red border) must be obeyed. There are ${mandatorySigns.length} mandatory signs including stop signs, no entry, speed limits, and no overtaking signs.`,
        relatedSigns: mandatorySigns.slice(0, 3)
      };
    }

    if (query.includes('warning') || query.includes('cautionary')) {
      const cautionarySigns = relevantSigns.filter(s => s.category === 'cautionary');
      return {
        content: `Cautionary signs (triangular with red border) warn of hazards ahead. There are ${cautionarySigns.length} cautionary signs including sharp turns, school zones, and pedestrian crossings.`,
        relatedSigns: cautionarySigns.slice(0, 3)
      };
    }

    if (query.includes('informative') || query.includes('info')) {
      const informativeSigns = relevantSigns.filter(s => s.category === 'informative');
      return {
        content: `Informative signs (rectangular with blue background) provide helpful information like hospitals, parking, and fuel stations. There are ${informativeSigns.length} informative signs in our database.`,
        relatedSigns: informativeSigns.slice(0, 3)
      };
    }

    // General responses for common queries
    if (query.includes('penalty') || query.includes('fine')) {
      return {
        content: "Indian traffic fines vary by violation: ₹500 for not stopping at signals, ₹1000 for speeding/wrong way driving, ₹5000 for mobile phone use, and ₹1000 for not wearing helmets/seatbelts.",
        relatedSigns: []
      };
    }

    if (query.includes('how many') || query.includes('total')) {
      return {
        content: `Our database contains ${INDIAN_TRAFFIC_SIGNS.length} traffic signs: ${INDIAN_TRAFFIC_SIGNS.filter(s => s.category === 'mandatory').length} mandatory, ${INDIAN_TRAFFIC_SIGNS.filter(s => s.category === 'cautionary').length} cautionary, and ${INDIAN_TRAFFIC_SIGNS.filter(s => s.category === 'informative').length} informative signs.`,
        relatedSigns: []
      };
    }

    // If we found relevant signs, show them
    if (relevantSigns.length > 0) {
      return {
        content: `I found ${relevantSigns.length} relevant sign(s) for your query. Here are the details:`,
        relatedSigns: relevantSigns.slice(0, 3)
      };
    }

    // If we found relevant rules, show them
    if (relevantRules.length > 0) {
      const ruleText = relevantRules.map(rule => `${rule.title}: ${rule.description} (Penalty: ${rule.penalty})`).join('\n\n');
      return {
        content: `Here are the relevant road safety rules:\n\n${ruleText}`,
        relatedSigns: []
      };
    }

    // Default response
    return {
      content: "I can help you with information about Indian traffic signs, road safety rules, penalties, and driving regulations. Try asking about specific signs like 'stop sign', 'speed limit', or general topics like 'mandatory signs' or 'safety rules'.",
      relatedSigns: []
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { content, relatedSigns } = generateBotResponse(inputMessage);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      relatedSigns: relatedSigns || []
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mandatory': return <Shield className="w-3 h-3" />;
      case 'cautionary': return <AlertTriangle className="w-3 h-3" />;
      case 'informative': return <Info className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
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

  if (isMinimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg neon-glow z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] glass-panel flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Road Rules Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask me about traffic rules</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMinimize}
          className="w-8 h-8"
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-accent-foreground" />
              </div>
            )}
            <div className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''}`}>
              <div className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Related Signs */}
              {message.relatedSigns && message.relatedSigns.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.relatedSigns.map((sign) => (
                    <div key={sign.id} className="p-2 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(sign.category)}
                        <span className="text-xs font-semibold">{sign.name}</span>
                        <Badge variant={getCategoryColor(sign.category) as any} className="text-xs">
                          {sign.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{sign.description}</p>
                      <p className="text-xs text-muted-foreground">{sign.rule}</p>
                      {sign.penalty && (
                        <p className="text-xs text-destructive mt-1">
                          <strong>Penalty:</strong> {sign.penalty}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about traffic rules..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick suggestions */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {['Stop sign', 'Speed limits', 'School zone', 'Helmet rules'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInputMessage(suggestion)}
              disabled={isTyping}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};