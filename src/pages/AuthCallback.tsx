import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { getUserProfileDetails } from '../lib/subscription';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Timeout fallback - if session not found after 3 seconds redirect to /login
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Session check timed out (3s). Redirecting to login.');
        navigate('/login');
      }
    }, 3000);

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase session result from getSession():', data.session, 'Error:', error);

        if (error) {
          console.error('Error during auth callback:', error);
          if (mounted) setErrorMsg(error.message);
          return;
        }

        if (data?.session) {
          console.log('Session found immediately. Redirecting to dashboard...');
          if (mounted) {
            clearTimeout(timeoutId);
            const details = await getUserProfileDetails(data.session.user.id);
            navigate(details ? '/dashboard' : '/onboarding');
          }
        } else {
          console.log('No session found initially, waiting for auth state change...');
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event, 'Session:', session);
      if (event === 'SIGNED_IN' && session) {
        console.log('Session found via auth state change. Redirecting to dashboard...');
        if (mounted) {
          clearTimeout(timeoutId);
          void (async () => {
            const details = await getUserProfileDetails(session.user.id);
            navigate(details ? '/dashboard' : '/onboarding');
          })();
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          clearTimeout(timeoutId);
          navigate('/login');
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-onSurfaceVariant font-sans text-sm animate-pulse">
        {errorMsg ? `Error: ${errorMsg}` : 'Completing authentication...'}
      </p>
    </div>
  );
}
