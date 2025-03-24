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
    let refreshTimeout: NodeJS.Timeout | null = null;

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
          } else {
            // Schedule the next refresh check
            const timeUntilRefresh = Math.max(
              0, 
              expiryTime.getTime() - thirtyMinutesFromNow.getTime()
            );
            
            // Set a timeout to refresh before expiry (minimum 1 minute)
            const delayMs = Math.max(60000, timeUntilRefresh);
            refreshTimeout = setTimeout(checkAuth, delayMs);
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [user?.id, session?.expires_at]);

  // Check profile and admin status in a separate effect with careful dependency management
  useEffect(() => {
    // Clear any previous redirect when dependencies change
    setRedirectTo(null);
    
    // Skip this effect if we're still loading or don't have a user
    if (!user || isLoading) return;

    // Check profile completeness
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
    if (requireAdmin && !isAdmin) {
      toast({
        title: 'Access denied',
        description: 'You don\'t have permission to access this page.',
        variant: 'destructive'
      });
      setRedirectTo('/dashboard');
      return;
    }
  }, [
    user?.id, 
    user?.app_metadata?.profile_complete, 
    isAdmin, 
    requireAdmin, 
    location.pathname, 
    isLoading
  ]);

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
