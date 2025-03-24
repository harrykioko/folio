import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';
import type { Tables } from '../integrations/supabase/types';

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
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error: Error | null }>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error: Error | null }>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<{ success: boolean; error: Error | null }>;
  setCurrentProject: (project: Project) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    currentProject: null,
    companySettings: null,
    isLoading: true,
    error: null,
  });

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user || null }));
    });

    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user || null, isLoading: true }));
      
      if (session?.user) {
        // Fetch user profile
        fetchProfile(session.user.id);
        // Fetch company settings
        fetchCompanySettings();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        profile: data as Profile,
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({ ...prev, isLoading: false, error: error as Error }));
    }
  };

  // Fetch company settings
  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setState(prev => ({ 
        ...prev, 
        companySettings: data as CompanySettings,
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      console.error('Error fetching company settings:', error);
      setState(prev => ({ ...prev, isLoading: false, error: error as Error }));
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            role: 'user',
          });

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
    await supabase.auth.signOut();
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
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error as Error };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error as Error };
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

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error as Error };
    }
  };

  // Update company settings
  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    if (!state.user) return { success: false, error: new Error('Not authenticated') };

    try {
      // Check if company settings exist
      if (state.companySettings) {
        // Update existing settings
        const { error } = await supabase
          .from('company_settings')
          .update(settings)
          .eq('id', state.companySettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('company_settings')
          .insert({
            name: settings.name || 'My Company',
            logo_url: settings.logo_url || null,
            primary_color: settings.primary_color || '#3498db',
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

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating company settings:', error);
      return { success: false, error: error as Error };
    }
  };

  // Set current project
  const setCurrentProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      currentProject: project,
    }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      updateCompanySettings,
      setCurrentProject,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
