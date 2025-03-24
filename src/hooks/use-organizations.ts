/**
 * @deprecated This hook is deprecated and will be removed in a future release.
 * Use the useProjects hook instead as we're transitioning to a project-based model.
 */
import { useState } from 'react';

// Mock types to maintain backward compatibility
export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
};

interface OrganizationsState {
  organizations: Organization[] | null;
  members: Record<string, OrganizationMember[]>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * @deprecated This hook is deprecated and will be removed in a future release.
 * Use the useProjects hook instead as we're transitioning to a project-based model.
 */
export function useOrganizations() {
  // Provide empty implementation to prevent runtime errors
  const [state] = useState<OrganizationsState>({
    organizations: [],
    members: {},
    isLoading: false,
    error: null,
  });

  console.warn(
    'useOrganizations is deprecated and will be removed in a future release. ' +
    'Use useProjects instead as we are transitioning to a project-based model.'
  );
  
  // Return a minimal API to prevent runtime errors in components that still use this hook
  return {
    ...state,
    fetchOrganizations: () => {
      console.warn('fetchOrganizations is deprecated. Use useProjects.fetchProjects instead.');
      return Promise.resolve();
    },
    fetchOrganizationMembers: () => {
      console.warn('fetchOrganizationMembers is deprecated. Use useProjects.fetchProjectMembers instead.');
      return Promise.resolve();
    },
    createOrganization: () => {
      console.warn('createOrganization is deprecated. Use useProjects.createProject instead.');
      return Promise.resolve({ data: null, error: new Error('Method deprecated') });
    },
    updateOrganization: () => {
      console.warn('updateOrganization is deprecated. Use useProjects.updateProject instead.');
      return Promise.resolve({ data: null, error: new Error('Method deprecated') });
    },
    inviteUserToOrganization: () => {
      console.warn('inviteUserToOrganization is deprecated. Use useProjects.inviteUserToProject instead.');
      return Promise.resolve({ success: false, error: new Error('Method deprecated') });
    },
    removeUserFromOrganization: () => {
      console.warn('removeUserFromOrganization is deprecated. Use useProjects.removeUserFromProject instead.');
      return Promise.resolve({ success: false, error: new Error('Method deprecated') });
    },
  };
}
