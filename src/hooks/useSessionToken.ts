import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useSessionToken = () => {
  const navigate = useNavigate();

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return session.access_token;
  }, []);

  const requireAuth = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      navigate('/auth');
      return null;
    }
    return token;
  }, [getToken, navigate]);

  return { getToken, requireAuth };
};
