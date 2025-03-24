import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Organization = Tables<'organizations'>;
export type OrganizationMember = Tables<'organizations_members'>;

interface OrganizationsState {
  organizations: Organization[] | null;
  members: Record<string, OrganizationMember[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useOrganizations() {
  const { user, currentOrganization } = useAuth();
  const [state, setState] = useState<OrganizationsState>({
    organizations: null,
    members: {},
    isLoading: false,
    error: null,
  });

  // Fetch all organizations the user belongs to
  const fetchOrganizations = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      if (memberships && memberships.length > 0) {
        const orgIds = memberships.map(m => m.organization_id);
        
        // Get organizations
        const { data: organizations, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds);

        if (orgsError) throw orgsError;

        setState(prev => ({
          ...prev,
          organizations,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          organizations: [],
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user]);

  // Fetch members for a specific organization
  const fetchOrganizationMembers = useCallback(async (organizationId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get all members of this organization
      const { data: memberData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          organization_id,
          role,
          joined_at,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            email
          )
        `)
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;

      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [organizationId]: memberData || [],
        },
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user]);

  // Create a new organization
  const createOrganization = async (name: string, slug: string, logoUrl?: string) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      // Insert organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Make the current user an admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Update local state
      setState(prev => ({
        ...prev,
        organizations: [...(prev.organizations || []), organization],
      }));

      return { data: organization, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Update an organization
  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        organizations: prev.organizations?.map(org => 
          org.id === id ? { ...org, ...updates } : org
        ) || null,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Invite a user to an organization
  const inviteUserToOrganization = async (
    organizationId: string, 
    email: string, 
    role: 'admin' | 'member' = 'member'
  ) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      // Check if the user already exists in the system
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (userData) {
        // User exists, add them directly
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: organizationId,
            user_id: userData.id,
            role,
          });

        if (memberError) throw memberError;
      } else {
        // User doesn't exist, create invitation
        // This would typically involve sending an email and creating an invitation record
        // For now, we'll just pretend we did that
        console.log(`Invitation would be sent to ${email}`);
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Remove a user from an organization
  const removeUserFromOrganization = async (organizationId: string, userId: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .match({ organization_id: organizationId, user_id: userId });

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [organizationId]: prev.members[organizationId]?.filter(m => m.user_id !== userId) || [],
        },
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Load organizations when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchOrganizations();
    } else {
      setState({
        organizations: null,
        members: {},
        isLoading: false,
        error: null,
      });
    }
  }, [user, fetchOrganizations]);

  // Load members of the current organization when it changes
  useEffect(() => {
    if (user && currentOrganization) {
      fetchOrganizationMembers(currentOrganization.id);
    }
  }, [user, currentOrganization, fetchOrganizationMembers]);

  // Setup realtime subscription for organization changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to organization changes
    const organizationsSubscription = supabase
      .channel('organizations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'organizations' }, 
        (payload) => {
          fetchOrganizations();
        }
      )
      .subscribe();

    // Subscribe to organization member changes
    const membersSubscription = supabase
      .channel('organization-members-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'organization_members' }, 
        (payload) => {
          if (currentOrganization) {
            fetchOrganizationMembers(currentOrganization.id);
          }
        }
      )
      .subscribe();

    return () => {
      organizationsSubscription.unsubscribe();
      membersSubscription.unsubscribe();
    };
  }, [user, currentOrganization, fetchOrganizations, fetchOrganizationMembers]);

  return {
    organizations: state.organizations,
    currentOrganizationMembers: currentOrganization 
      ? state.members[currentOrganization.id] || [] 
      : [],
    isLoading: state.isLoading,
    error: state.error,
    createOrganization,
    updateOrganization,
    inviteUserToOrganization,
    removeUserFromOrganization,
    fetchOrganizationMembers,
  };
}
