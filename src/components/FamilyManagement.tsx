import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { familyNameSchema, familyCodeSchema, inviteEmailSchema } from '@/lib/validations';
import { z } from 'zod';
import { 
  Users, 
  Plus, 
  QrCode, 
  UserPlus, 
  Shield, 
  Crown,
  Baby,
  User,
  Copy,
  Check,
  X
} from 'lucide-react';

interface Family {
  id: string;
  name: string;
  family_code: string;
  created_by: string;
  created_at: string;
}

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'parent' | 'member' | 'child';
  status: 'pending' | 'active' | 'blocked';
  joined_at: string;
}

interface FamilyInvite {
  id: string;
  invited_email: string | null;
  invite_code: string;
  expires_at: string;
}

export const FamilyManagement = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMembers(selectedFamily.id);
      loadFamilyInvites(selectedFamily.id);
    }
  }, [selectedFamily]);

  const loadFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFamilies(data || []);
      if (data && data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0]);
      }
    } catch (error) {
      console.error('Error loading families:', error);
      toast({
        title: "Error",
        description: "Failed to load families",
        variant: "destructive"
      });
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
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setFamilyMembers((data || []) as FamilyMember[]);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const loadFamilyInvites = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_invites')
        .select('*')
        .eq('family_id', familyId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFamilyInvites(data || []);
    } catch (error) {
      console.error('Error loading family invites:', error);
    }
  };

  const createFamily = async () => {
    try {
      // Validate family name
      const validated = familyNameSchema.parse({ name: newFamilyName });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: validated.name,
          created_by: userData.user.id
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: userData.user.id,
          role: 'admin',
          status: 'active'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Family created successfully!"
      });

      setNewFamilyName('');
      setShowCreateDialog(false);
      loadFamilies();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error creating family:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create family",
          variant: "destructive"
        });
      }
    }
  };

  const joinFamily = async () => {
    try {
      // Validate join code
      const validated = familyCodeSchema.parse({ code: joinCode });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Find family by code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('family_code', validated.code)
        .single();

      if (familyError || !family) {
        toast({
          title: "Error",
          description: "Invalid family code",
          variant: "destructive"
        });
        return;
      }

      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: userData.user.id,
          role: 'member',
          status: 'active'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: `Joined ${family.name} successfully!`
      });

      setJoinCode('');
      loadFamilies();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error joining family:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to join family",
          variant: "destructive"
        });
      }
    }
  };

  const createInvite = async () => {
    if (!selectedFamily) return;

    try {
      // Validate invite email if provided
      if (inviteEmail) {
        inviteEmailSchema.parse({ email: inviteEmail });
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_invites')
        .insert({
          family_id: selectedFamily.id,
          invited_by: userData.user.id,
          invited_email: inviteEmail.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invite created successfully!"
      });

      setInviteEmail('');
      loadFamilyInvites(selectedFamily.id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error creating invite:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create invite",
          variant: "destructive"
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard"
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-warning" />;
      case 'parent': return <Shield className="w-4 h-4 text-primary" />;
      case 'child': return <Baby className="w-4 h-4 text-success" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'parent': return 'default' as const;
      case 'child': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

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
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Family Management</h1>
            <p className="text-muted-foreground">Manage your family connections</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Family</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Family name"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
                <Button onClick={createFamily} className="w-full">
                  Create Family
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter family code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-40"
            />
            <Button onClick={joinFamily} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Join
            </Button>
          </div>
        </div>
      </div>

      {families.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No families yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a new family or join an existing one to get started
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Family
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Family Selection & Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Information</h3>
            
            {families.length > 1 && (
              <Select
                value={selectedFamily?.id || ''}
                onValueChange={(value) => {
                  const family = families.find(f => f.id === value);
                  setSelectedFamily(family || null);
                }}
              >
                <SelectTrigger className="mb-4">
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

            {selectedFamily && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">{selectedFamily.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(selectedFamily.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Family Code</p>
                      <p className="font-mono text-lg">{selectedFamily.family_code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedFamily.family_code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Family Members ({familyMembers.length})</h5>
                  <div className="space-y-2">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span className="text-sm">{member.user_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Invites Management */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invite Management</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Email (optional)"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={createInvite} disabled={!selectedFamily}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>

              <div>
                <h5 className="font-medium mb-2">Active Invites ({familyInvites.length})</h5>
                <div className="space-y-2">
                  {familyInvites.map((invite) => (
                    <div key={invite.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">{invite.invite_code}</p>
                          {invite.invited_email && (
                            <p className="text-xs text-muted-foreground">{invite.invited_email}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(invite.invite_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};