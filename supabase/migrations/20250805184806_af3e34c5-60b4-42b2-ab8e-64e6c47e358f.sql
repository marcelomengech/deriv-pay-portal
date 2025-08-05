-- Create function to delete user account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user's profile data
  DELETE FROM public.profiles WHERE user_id = auth.uid();
  
  -- Delete the user's clients
  DELETE FROM public.clients WHERE agent_id = auth.uid();
  
  -- Delete the user's transactions
  DELETE FROM public.transactions WHERE agent_id = auth.uid();
  
  -- Delete the user from auth.users (this will cascade delete related data)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;