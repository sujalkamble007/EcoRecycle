-- Add user_id column to pickup_requests table
ALTER TABLE public.pickup_requests
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing rows to have a null user_id (they were created anonymously)
-- In production, you'd want to handle this differently

-- Make user_id NOT NULL for future inserts
ALTER TABLE public.pickup_requests
ALTER COLUMN user_id SET NOT NULL;

-- Drop the old permissive RLS policy
DROP POLICY IF EXISTS "Anyone can view their own pickup requests" ON public.pickup_requests;

-- Create new RLS policy that properly restricts access to own requests
CREATE POLICY "Users can view their own pickup requests"
ON public.pickup_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update the insert policy to ensure user_id is set correctly
DROP POLICY IF EXISTS "Anyone can create pickup requests" ON public.pickup_requests;

CREATE POLICY "Authenticated users can create pickup requests"
ON public.pickup_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);