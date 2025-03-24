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
  const { user, session, isLoading, profile, refreshSession, isAdmin } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Check session validity and refresh if needed
  useEffect(() => {
    // Only run if user exists but might need refresh
    if (user && session) {
      const checkSession = async () => {
        // Get session expiry time
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const expiryTime = new Date(expiresAt * 1000); // Convert to milliseconds
          const now = new Date();
          
          // If session expires in less than 30 minutes, refresh it
          const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
          if (expiryTime < thirtyMinutesFromNow) {
            console.log("Session expiring soon, refreshing...");
            await refreshSession();
          }
        }
      };
      
      checkSession();
    }
  }, [user, session, refreshSession]);

  // Use useEffect for showing toasts to avoid React warnings
  useEffect(() => {
    // Check if user exists but profile doesn't
    if (user && !profile && location.pathname !== "/settings" && !redirectTo) {
      toast({
        title: "Profile not complete",
        description: "Please complete your profile to continue.",
        variant: "default"
      });
      setRedirectTo("/settings");
    }
    
    // Check for admin access for admin-only routes
    if (user && requireAdmin && !isAdmin && !redirectTo) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      setRedirectTo("/dashboard");
    }
  }, [user, profile, isAdmin, requireAdmin, location.pathname, redirectTo, toast]);

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
