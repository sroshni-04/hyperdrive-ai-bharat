-- Create families table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'parent', 'member', 'child')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create family invites table
CREATE TABLE public.family_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,
  invite_code TEXT NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 6),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create geofences table
CREATE TABLE public.geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL DEFAULT 100, -- meters
  type TEXT NOT NULL DEFAULT 'safe_zone' CHECK (type IN ('safe_zone', 'restricted_zone', 'notification_zone')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('location_update', 'speed_alert', 'geofence_entry', 'geofence_exit', 'harsh_braking', 'harsh_acceleration', 'system_start', 'system_stop')),
  data JSONB,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live sessions table for real-time tracking
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed INTEGER DEFAULT 0,
  heading INTEGER,
  battery_level INTEGER,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, family_id)
);

-- Enable Row Level Security
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Users can view families they belong to" ON public.families 
FOR SELECT USING (
  id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can create their own families" ON public.families 
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family admins can update families" ON public.families 
FOR UPDATE USING (
  id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);

-- RLS Policies for family_members
CREATE POLICY "Users can view family members in their families" ON public.family_members 
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Family admins can manage members" ON public.family_members 
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);

CREATE POLICY "Users can join families" ON public.family_members 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for family_invites
CREATE POLICY "Family members can view invites" ON public.family_invites 
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Family admins can create invites" ON public.family_invites 
FOR INSERT WITH CHECK (
  invited_by = auth.uid() AND
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);

-- RLS Policies for geofences
CREATE POLICY "Family members can view geofences" ON public.geofences 
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Family admins can manage geofences" ON public.geofences 
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);

-- RLS Policies for activity_logs
CREATE POLICY "Family members can view activity logs" ON public.activity_logs 
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for live_sessions
CREATE POLICY "Family members can view live sessions" ON public.live_sessions 
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage their own live sessions" ON public.live_sessions 
FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_activity_logs_family_id ON public.activity_logs(family_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_live_sessions_family_id ON public.live_sessions(family_id);
CREATE INDEX idx_geofences_family_id ON public.geofences(family_id);

-- Enable realtime for live tracking
ALTER TABLE public.live_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;