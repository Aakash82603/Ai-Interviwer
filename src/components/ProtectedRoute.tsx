import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserProfileDetails, isProfileCompleted } from '../lib/subscription';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setCheckingProfile(false);
        setHasProfile(false);
        return;
      }
      // onboarding route should remain accessible even if profile is incomplete
      if (location.pathname === '/onboarding') {
        setHasProfile(true);
        setCheckingProfile(false);
        return;
      }
      if (isProfileCompleted(user.id)) {
        setHasProfile(true);
        setCheckingProfile(false);
        return;
      }
      const details = await getUserProfileDetails(user.id);
      setHasProfile(!!details);
      setCheckingProfile(false);
    };
    void run();
  }, [user, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
