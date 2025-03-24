import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, session, isLoading, refreshSession, isAdmin } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Session refresh effect - only handles token refresh, not profile loading
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isMounted) return;
      
      // Only check session validity if we have both user and session
      if (user && session) {
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const expiryTime = new Date(expiresAt * 1000);
          const now = new Date();
          const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
          
          // Only refresh if session is about to expire
          if (expiryTime < thirtyMinutesFromNow) {
            try {
              await refreshSession();
            } catch (error) {
              console.error("Failed to refresh session:", error);
            }
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [user, session, refreshSession]);

  // Check profile and admin status in a separate effect to avoid refresh loops
  useEffect(() => {
    if (!user || isLoading) return;

    // Check profile completeness - this is now handled by useAuth() internally
    // so we only need to check the profile value
    if (user && !user.app_metadata?.profile_complete && location.pathname !== '/settings') {
      toast({
        title: 'Profile not complete',
        description: 'Please complete your profile to continue.',
        variant: 'default'
      });
      setRedirectTo('/settings');
      return;
    }

    // Check admin access
    if (user && requireAdmin && !isAdmin) {
      toast({
        title: 'Access denied',
        description: 'You don\'t have permission to access this page.',
        variant: 'destructive'
      });
      setRedirectTo('/dashboard');
      return;
    }
  }, [user, requireAdmin, location.pathname, toast, isLoading, isAdmin]);

  // If authentication is still loading, show a minimal loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    // Store the attempted URL for redirection after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Handle redirects set from the useEffect hooks
  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // If authenticated and has required role, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
}
