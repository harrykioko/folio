import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';
import type { Tables } from '../integrations/supabase/types';
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

// Explicitly define table types
export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type CompanySettings = Tables<'company_settings'>;

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  currentProject: Project | null;
  companySettings: CompanySettings | null;
  isLoading: boolean;
  error: Error | null;
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null; data?: any }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error: Error | null; data?: any }>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error: Error | null }>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<{ success: boolean; error: Error | null }>;
  setCurrentProject: (project: Project) => void;
  refreshSession: () => Promise<void>;
  isAdmin: boolean;
};

const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  currentProject: null,
  companySettings: null,
  isLoading: false,
  error: null,
  isAdmin: false,
  signIn: async () => ({ success: false, error: new Error('AuthContext not initialized') }),
  signUp: async () => ({ success: false, error: new Error('AuthContext not initialized') }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false, error: new Error('AuthContext not initialized'), data: null }),
  updatePassword: async () => ({ success: false, error: new Error('AuthContext not initialized'), data: null }),
  updateProfile: async () => ({ success: false, error: new Error('AuthContext not initialized') }),
  updateCompanySettings: async () => ({ success: false, error: new Error('AuthContext not initialized') }),
  setCurrentProject: () => {},
  refreshSession: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    currentProject: null,
    companySettings: null,
    isLoading: true,
    error: null,
  });

  // Computed property for admin status
  const isAdmin = state.profile?.role === 'admin';

  // Fetch profile with retry logic
  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Try to get existing profile using RPC function to bypass RLS
      const { data, error } = await supabase.rpc(
        'get_user_profile', 
        { user_id: userId }
      );
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // Create new profile if none exists using RPC
        if ((error.code === 'PGRST116' || error.message.includes('no rows')) && retryCount < 3) {
          const { data: authUser } = await supabase.auth.getUser();
          const user = authUser?.user;
          const userMeta = user?.user_metadata || {};
          
          const defaultProfile = {
            id: userId,
            first_name: userMeta.first_name || user?.email?.split('@')[0] || 'User',
            last_name: userMeta.last_name || '',
            role: 'member',
            created_at: new Date().toISOString(),
          };
          
          console.log('Creating new profile with data:', defaultProfile);
          
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'create_user_profile',
            { profile_data: defaultProfile }
          );
          
          if (rpcError) {
            console.error('RPC error creating profile:', rpcError);
            
            if (retryCount < 2) {
              setTimeout(() => fetchProfile(userId, retryCount + 1), 1000 * Math.pow(2, retryCount));
              return;
            } else {
              toast({
                title: "Error creating user profile",
                description: "Please contact support.",
                variant: "destructive"
              });
            }
          } else {
            console.log('Successfully created profile via RPC:', rpcResult);
            setState(prev => ({ ...prev, profile: rpcResult, isLoading: false }));
            return;
          }
        }
        
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log('Successfully fetched profile:', data);
      setState(prev => ({ ...prev, profile: data, isLoading: false }));

    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fetch company settings with retry logic
  const fetchCompanySettings = async (retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', state.user?.id)
        .single();

      if (error) {
        // PGRST116 is a "no rows returned" error, which is expected if no company settings exist yet
        if (error.code !== 'PGRST116') {
          console.error('Error fetching company settings:', error);
        } else if (retryCount < 1) {
          // If no company settings exist, create default ones
          const defaultSettings = {
            user_id: state.user?.id,
            company_name: 'Folio',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          console.log('Attempting to create default company settings:', defaultSettings);
          
          const { data: newSettings, error: insertError } = await supabase
            .from('company_settings')
            .insert(defaultSettings)
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating default company settings:', insertError);
          } else {
            console.log('Created default company settings', newSettings);
            setState(prev => ({ ...prev, companySettings: newSettings, isLoading: false }));
            return;
          }
        }
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        companySettings: data,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching company settings:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh the current session
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (session) {
        setState(prev => ({ ...prev, session, user: session.user }));
        
        if (session.user) {
          fetchProfile(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAuth = async () => {
      try {
        // Set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event);
          
          // Only set isLoading true for specific events that require fetching profile
          const shouldFetchProfile = ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event);
          
          setState(prev => ({ 
            ...prev, 
            session, 
            user: session?.user || null,
            // Only set isLoading if we need to fetch profile and don't have one already
            isLoading: session && shouldFetchProfile && !prev.profile ? true : prev.isLoading
          }));
          
          if (session?.user && shouldFetchProfile) {
            fetchProfile(session.user.id);
            fetchCompanySettings();
          } else if (event === 'SIGNED_OUT') {
            // Clear all cached queries when user signs out
            queryClient.clear();
          }
        });
        
        subscription = data.subscription;

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user || null,
          isLoading: session?.user ? true : false
        }));
        
        if (session?.user) {
          fetchProfile(session.user.id);
          fetchCompanySettings();
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Clear any existing queries and fetch fresh data
      queryClient.clear();
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const profileData = {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role: 'member',
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) throw profileError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all query cache
      queryClient.clear();
      
      setState({
        session: null,
        user: null,
        profile: null,
        currentProject: null,
        companySettings: null,
        isLoading: false,
        error: null,
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      
      toast({
        title: "Error signing out",
        description: "Please try again or refresh the page.",
        variant: "destructive"
      });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          error: new Error('Please enter a valid email address'),
          data: null
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('Password reset email sent successfully');
      return { success: true, error: null, data };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      
      // Provide a more user-friendly error message
      let errorMessage = 'An error occurred while sending the reset link. Please try again.';
      
      if (error?.message) {
        // Common Supabase errors that we want to display more user-friendly messages for
        if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many reset attempts. Please try again later';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: new Error(errorMessage),
        data: null
      };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      // Password validation
      if (password.length < 8) {
        return { 
          success: false, 
          error: new Error('Password must be at least 8 characters long'),
          data: null
        };
      }

      // Validate password contains uppercase, lowercase, and number
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        return { 
          success: false, 
          error: new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
          data: null
        };
      }

      const { data, error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      // Clear sensitive session data from storage
      await supabase.auth.refreshSession();
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been securely updated. You'll be redirected to the login page.",
      });
      
      return { success: true, error: null, data };
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      // Provide a more user-friendly error message
      let errorMessage = 'An error occurred while updating your password. Please try again.';
      
      if (error?.message) {
        // Parse common Supabase errors
        if (error.message.includes('Password should be')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Your session has expired. Please try again from the login page.';
        } else if (error.message.includes('JWT')) {
          errorMessage = 'Your session has expired. Please try again from the login page.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: new Error(errorMessage),
        data: null
      };
    }
  };

  // Update profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!state.user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', state.user.id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...profileData } : null,
      }));
      
      // Invalidate any queries that might depend on profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Error updating profile",
        description: (error as Error).message || "Please try again.",
        variant: "destructive"
      });
      
      return { success: false, error: error as Error };
    }
  };

  // Update company settings
  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    try {
      if (state.companySettings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from('company_settings')
          .update({
            company_name: settings.company_name,
            logo_url: settings.logo_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.companySettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('company_settings')
          .insert({
            user_id: state.user?.id,
            company_name: settings.company_name || 'My Company',
            logo_url: settings.logo_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        // Fetch the newly created settings
        await fetchCompanySettings();
        return { success: true, error: null };
      }

      // Update local state
      setState(prev => ({
        ...prev,
        companySettings: prev.companySettings 
          ? { ...prev.companySettings, ...settings } 
          : null,
      }));
      
      // Invalidate any queries that might depend on company settings
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      
      toast({
        title: "Company settings updated",
        description: "Your company settings have been successfully updated.",
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating company settings:', error);
      
      toast({
        title: "Error updating company settings",
        description: (error as Error).message || "Please try again.",
        variant: "destructive"
      });
      
      return { success: false, error: error as Error };
    }
  };

  // Set current project
  const setCurrentProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      currentProject: project,
    }));
    
    // Store the current project ID in local storage
    localStorage.setItem('currentProjectId', project.id);
    
    // Invalidate queries that depend on the current project
    queryClient.invalidateQueries({ queryKey: ['priorityTasks'] });
    queryClient.invalidateQueries({ queryKey: ['activityFeed'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      isAdmin,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      updateCompanySettings,
      setCurrentProject,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
