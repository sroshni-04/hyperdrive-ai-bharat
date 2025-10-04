-- Add missing UPDATE and DELETE RLS policies for family_invites table
-- This prevents unauthorized users from hijacking or manipulating invite codes

-- Allow family admins to update invites (e.g., mark as used, extend expiration)
CREATE POLICY "Family admins can update invites"
ON family_invites FOR UPDATE
USING (
  family_id IN (
    SELECT family_id FROM family_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'parent') 
    AND status = 'active'
  )
);

-- Allow family admins to delete invites
CREATE POLICY "Family admins can delete invites"
ON family_invites FOR DELETE
USING (
  family_id IN (
    SELECT family_id FROM family_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'parent') 
    AND status = 'active'
  )
);