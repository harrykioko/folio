import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type ProjectMember = Tables<'project_members'>;

// Extended type for project members with profiles
interface ProjectMemberWithProfile extends Omit<ProjectMember, 'profiles'> {
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
  };
}

interface ProjectsState {
  projects: Project[] | null;
  currentProject: Project | null;
  members: Record<string, ProjectMemberWithProfile[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useProjects() {
  const { user, currentProject } = useAuth();
  const [state, setState] = useState<ProjectsState>({
    projects: null,
    currentProject: null,
    members: {},
    isLoading: false,
    error: null,
  });

  // Fetch all projects the user is a member of
  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('project_members')
        .select('project_id, role')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      if (memberships && memberships.length > 0) {
        const projectIds = memberships.map(m => m.project_id);
        
        // Get projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);

        if (projectsError) throw projectsError;

        setState(prev => ({
          ...prev,
          projects,
          currentProject: currentProject || projects[0] || null,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          projects: [],
          currentProject: null,
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
  }, [user, currentProject]);

  // Fetch members for a specific project
  const fetchProjectMembers = useCallback(async (projectId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get all members of this project
      const { data: memberData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          project_id,
          role,
          created_at,
          updated_at,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            role
          )
        `)
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      // Transform the data to match our ProjectMemberWithProfile type
      const typedMemberData = memberData ? memberData.map(member => ({
        ...member,
        profiles: Array.isArray(member.profiles) && member.profiles.length > 0 
          ? member.profiles[0] 
          : member.profiles
      })) : [];

      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [projectId]: typedMemberData as ProjectMemberWithProfile[],
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

  // Create a new project
  const createProject = async (
    name: string, 
    description: string, 
    verticalId: string | null = null,
    color: string | null = null
  ) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          color,
          vertical_id: verticalId,
          status: 'active',
          created_by: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Make the current user an owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Update local state
      setState(prev => ({
        ...prev,
        projects: [...(prev.projects || []), project],
        currentProject: project,
      }));

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Update a project
  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        projects: prev.projects?.map(project => 
          project.id === id ? { ...project, ...updates } : project
        ) || null,
        currentProject: prev.currentProject?.id === id 
          ? { ...prev.currentProject, ...updates } 
          : prev.currentProject,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Invite a user to a project
  const inviteUserToProject = async (
    projectId: string, 
    email: string, 
    role: 'owner' | 'editor' | 'viewer' = 'viewer'
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

      // If user doesn't exist, implement invite mechanism here
      // For now, we'll just handle existing users
      if (!userData) {
        throw new Error('User not found in the system');
      }

      // Check if they're already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        return { success: false, error: new Error('User is already a member of this project') };
      }

      // Add user to project
      const { error: addMemberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role,
        });

      if (addMemberError) throw addMemberError;

      // Refresh members
      await fetchProjectMembers(projectId);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Remove a user from a project
  const removeUserFromProject = async (projectId: string, userId: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [projectId]: prev.members[projectId]?.filter(m => m.user_id !== userId) || [],
        },
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Change user role in project
  const changeUserRole = async (projectId: string, userId: string, newRole: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [projectId]: prev.members[projectId]?.map(m => 
            m.user_id === userId ? { ...m, role: newRole } : m
          ) || [],
        },
      }));

      return { success: true, error: null };
    } catch (error) {
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

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Load members when current project changes
  useEffect(() => {
    if (user && state.currentProject) {
      fetchProjectMembers(state.currentProject.id);
    }
  }, [user, state.currentProject, fetchProjectMembers]);

  return {
    projects: state.projects,
    currentProject: state.currentProject || currentProject,
    members: state.members,
    isLoading: state.isLoading,
    error: state.error,
    fetchProjects,
    fetchProjectMembers,
    createProject,
    updateProject,
    inviteUserToProject,
    removeUserFromProject,
    changeUserRole,
    setCurrentProject,
  };
}
