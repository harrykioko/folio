import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type Organization = Tables<'organizations'>;
export type OrganizationMember = Tables<'organization_members'>;

interface AuthState {
  user: User | null;
  profile: Profile | null;
  organizations: Organization[] | null;
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: AuthError | Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    organizations: null,
    currentOrganization: null,
    isLoading: true,
    error: null,
  });

  // Fetch user organizations
  const fetchUserOrganizations = async (userId: string) => {
    try {
      // Get organizations the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId);
      
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        // Get organization details
        const orgIds = memberships.map(m => m.organization_id);
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds);
          
        if (orgsError) throw orgsError;
        
        // Set current organization to the first one
        return {
          organizations: orgs,
          currentOrganization: orgs[0] || null
        };
      }
      
      return { organizations: [], currentOrganization: null };
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return { organizations: [], currentOrganization: null };
    }
  };

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
          
          // Fetch organizations
          const { organizations, currentOrganization } = await fetchUserOrganizations(session.user.id);

          setAuthState({
            user: session.user,
            profile,
            organizations,
            currentOrganization,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            organizations: null,
            currentOrganization: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          profile: null,
          organizations: null,
          currentOrganization: null,
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
            
          // Fetch organizations
          const { organizations, currentOrganization } = await fetchUserOrganizations(session.user.id);

          setAuthState({
            user: session.user,
            profile,
            organizations,
            currentOrganization,
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
            organizations: null,
            currentOrganization: null,
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
      return { data: null, error: new Error('User not authenticated') as Error };
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
      return { data: null, error: error as Error };
    }
  };
  
  const setCurrentOrganization = (organization: Organization) => {
    setAuthState(prev => ({
      ...prev,
      currentOrganization: organization,
    }));
  };
  
  const createOrganization = async (name: string, slug: string, logoUrl?: string) => {
    if (!authState.user) {
      return { data: null, error: new Error('User not authenticated') as Error };
    }
    
    try {
      // Begin a transaction to create org and add user as admin
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          logo_url: logoUrl,
        })
        .select()
        .single();
        
      if (orgError) throw orgError;
      
      // Add the creator as an admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: authState.user.id,
          role: 'admin',
        });
        
      if (memberError) throw memberError;
      
      // Update local state
      const updatedOrgs = [...(authState.organizations || []), newOrg];
      setAuthState(prev => ({
        ...prev,
        organizations: updatedOrgs,
        currentOrganization: newOrg,
      }));
      
      return { data: newOrg, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    organizations: authState.organizations,
    currentOrganization: authState.currentOrganization,
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    setCurrentOrganization,
    createOrganization,
  };
}
