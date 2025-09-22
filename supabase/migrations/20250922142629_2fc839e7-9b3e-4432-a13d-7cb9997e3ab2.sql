-- Drop existing problematic policies
DROP POLICY IF EXISTS "Family admins can manage members" ON public.family_members;
DROP POLICY IF EXISTS "Users can view family members in their families" ON public.family_members;
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;
DROP POLICY IF EXISTS "Family admins can update families" ON public.families;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_family_ids()
RETURNS uuid[] AS $$
  SELECT ARRAY_AGG(family_id) 
  FROM public.family_members 
  WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_admin_family_ids()
RETURNS uuid[] AS $$
  SELECT ARRAY_AGG(family_id) 
  FROM public.family_members 
  WHERE user_id = auth.uid() 
    AND role IN ('admin', 'parent') 
    AND status = 'active';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new non-recursive policies for family_members
CREATE POLICY "Users can view family members in their families"
ON public.family_members
FOR SELECT
USING (family_id = ANY(public.get_user_family_ids()));

CREATE POLICY "Family admins can manage members"
ON public.family_members
FOR ALL
USING (family_id = ANY(public.get_user_admin_family_ids()));

-- Create new non-recursive policies for families
CREATE POLICY "Users can view families they belong to"
ON public.families
FOR SELECT
USING (id = ANY(public.get_user_family_ids()));

CREATE POLICY "Family admins can update families"
ON public.families
FOR UPDATE
USING (id = ANY(public.get_user_admin_family_ids()));