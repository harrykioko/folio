import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: AuthError | Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const fetchInitialSession = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          setAuthState({
            user: session.user,
            profile,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: error as AuthError | Error,
        });
      }
    };

    fetchInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setAuthState({
            user: session.user,
            profile,
            isLoading: false,
            error: profileError && profileError.code !== 'PGRST116' ? profileError : null,
          });

          // If we don't have a profile, create one
          if (!profile && !profileError) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                first_name: '',
                last_name: '',
                avatar_url: '',
                role: 'member',
              })
              .select()
              .single();

            if (!createError) {
              setAuthState(prev => ({
                ...prev,
                profile: newProfile,
              }));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        profile: data,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
