import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type ProjectMember = Tables<'project_members'>;

interface ProjectsState {
  projects: Project[] | null;
  currentProject: Project | null;
  members: Record<string, ProjectMember[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useProjects() {
  const { user, currentOrganization } = useAuth();
  const [state, setState] = useState<ProjectsState>({
    projects: null,
    currentProject: null,
    members: {},
    isLoading: false,
    error: null,
  });

  // Fetch all projects for the current organization
  const fetchProjects = useCallback(async () => {
    if (!user || !currentOrganization) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        projects,
        currentProject: prev.currentProject || (projects.length > 0 ? projects[0] : null),
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
  }, [user, currentOrganization]);

  // Fetch members for a specific project
  const fetchProjectMembers = useCallback(async (projectId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: memberData, error } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          project_id,
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
        .eq('project_id', projectId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        members: {
          ...prev.members,
          [projectId]: memberData || [],
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
    verticalId: string,
    status: 'active' | 'completed' | 'archived' = 'active',
    startDate?: string,
    endDate?: string,
    logoUrl?: string
  ) => {
    if (!user || !currentOrganization) {
      return { data: null, error: new Error('User not authenticated or no organization selected') };
    }

    try {
      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          organization_id: currentOrganization.id,
          vertical_id: verticalId,
          status,
          start_date: startDate,
          end_date: endDate,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Make the current user a project admin
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'admin',
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

  // Delete a project
  const deleteProject = async (id: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      // Check if user has permission (should be a project admin)
      const { data: memberCheck, error: memberCheckError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single();

      if (memberCheckError) throw memberCheckError;
      if (!memberCheck || memberCheck.role !== 'admin') {
        throw new Error('You do not have permission to delete this project');
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => {
        const updatedProjects = prev.projects?.filter(project => project.id !== id) || null;
        return {
          ...prev,
          projects: updatedProjects,
          currentProject: prev.currentProject?.id === id 
            ? (updatedProjects && updatedProjects.length > 0 ? updatedProjects[0] : null)
            : prev.currentProject,
        };
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Add a user to a project
  const addUserToProject = async (
    projectId: string, 
    userId: string, 
    role: 'admin' | 'member' | 'viewer' = 'member'
  ) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
        });

      if (error) throw error;

      // Refresh project members
      fetchProjectMembers(projectId);

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
        .match({ project_id: projectId, user_id: userId });

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

  // Set the current project
  const setCurrentProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      currentProject: project,
    }));
  };

  // Load projects when component mounts or organization changes
  useEffect(() => {
    if (user && currentOrganization) {
      fetchProjects();
    } else {
      setState({
        projects: null,
        currentProject: null,
        members: {},
        isLoading: false,
        error: null,
      });
    }
  }, [user, currentOrganization, fetchProjects]);

  // Load members of the current project when it changes
  useEffect(() => {
    if (user && state.currentProject) {
      fetchProjectMembers(state.currentProject.id);
    }
  }, [user, state.currentProject, fetchProjectMembers]);

  // Setup realtime subscription for project changes
  useEffect(() => {
    if (!user || !currentOrganization) return;

    // Subscribe to project changes
    const projectsSubscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `organization_id=eq.${currentOrganization.id}`
        }, 
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    // Subscribe to project member changes if a project is selected
    let membersSubscription;
    if (state.currentProject) {
      membersSubscription = supabase
        .channel('project-members-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'project_members',
            filter: `project_id=eq.${state.currentProject.id}`
          }, 
          () => {
            fetchProjectMembers(state.currentProject!.id);
          }
        )
        .subscribe();
    }

    return () => {
      projectsSubscription.unsubscribe();
      if (membersSubscription) membersSubscription.unsubscribe();
    };
  }, [user, currentOrganization, state.currentProject, fetchProjects, fetchProjectMembers]);

  return {
    projects: state.projects,
    currentProject: state.currentProject,
    currentProjectMembers: state.currentProject 
      ? state.members[state.currentProject.id] || [] 
      : [],
    isLoading: state.isLoading,
    error: state.error,
    createProject,
    updateProject,
    deleteProject,
    addUserToProject,
    removeUserFromProject,
    setCurrentProject,
    fetchProjectMembers,
  };
}
