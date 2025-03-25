import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { PolicyErrorBoundary } from './PolicyErrorBoundary';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import { AuthLoadingState } from './ui/AuthLoadingState';
import { PolicyAccessDeniedError } from '@/types/errors';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, session, isLoading, refreshSession, isAdmin } = useAuth();
  const location = useLocation();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle session refresh
  useEffect(() => {
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh if less than 5 minutes until expiry
      if (timeUntilExpiry < 5 * 60 * 1000) {
        refreshSession();
      }
    }
  }, [session?.expires_at, refreshSession]);

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
      const error = new PolicyAccessDeniedError('You don\'t have permission to access this page.');
      toast({
        title: 'Access denied',
        description: error.message,
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

  // If authentication is still loading, show the loading state
  if (isLoading) {
    return <AuthLoadingState message="Checking authentication..." />;
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
  // Wrap with both error boundaries for comprehensive error handling
  return (
    <AuthErrorBoundary>
      <PolicyErrorBoundary>
        {children ? <>{children}</> : <Outlet />}
      </PolicyErrorBoundary>
    </AuthErrorBoundary>
  );
}
