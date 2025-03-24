-- Comprehensive Row Level Security (RLS) Policies for Folio
-- This file implements a complete set of security policies for all tables
-- based on the single-tenant, project-based data model

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is a project member with specific role
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID, roles TEXT[]) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members 
    WHERE 
      project_id = $1 AND 
      user_id = auth.uid() AND
      role = ANY($2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE 
      id = auth.uid() AND 
      role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is a member of any project involving this asset
CREATE OR REPLACE FUNCTION public.can_access_asset(asset_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a member of any project that has this asset
  RETURN EXISTS (
    SELECT 1 FROM asset_projects ap
    JOIN project_members pm ON ap.project_id = pm.project_id
    WHERE 
      ap.asset_id = $1 AND 
      pm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function for notification access
CREATE OR REPLACE FUNCTION public.can_access_notification(notification_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM notifications 
    WHERE 
      id = notification_id AND 
      (user_id = auth.uid() OR is_global = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE POLICIES
-- Allow users to insert their own profile (for new users)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to view all profiles (needed for collaboration features)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- COMPANY SETTINGS POLICIES
-- Only admins can modify company settings
DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
CREATE POLICY "Admins can update company settings"
ON public.company_settings
FOR ALL
USING (public.is_admin());

-- All authenticated users can view company settings
DROP POLICY IF EXISTS "All users can view company settings" ON public.company_settings;
CREATE POLICY "All users can view company settings"
ON public.company_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- VERTICALS TABLE POLICIES
-- Only admins can modify verticals
DROP POLICY IF EXISTS "Admins can manage verticals" ON public.verticals;
CREATE POLICY "Admins can manage verticals"
ON public.verticals
FOR ALL
USING (public.is_admin());

-- All authenticated users can view verticals
DROP POLICY IF EXISTS "All users can view verticals" ON public.verticals;
CREATE POLICY "All users can view verticals"
ON public.verticals
FOR SELECT
USING (auth.role() = 'authenticated');

-- PROJECTS TABLE POLICIES
-- Project owners and admins can modify projects
DROP POLICY IF EXISTS "Project owners and admins can manage projects" ON public.projects;
CREATE POLICY "Project owners and admins can manage projects"
ON public.projects
FOR ALL
USING (
  created_by = auth.uid() OR 
  public.is_admin() OR
  public.is_project_member(id, ARRAY['owner'])
);

-- Project members can view their projects
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;
CREATE POLICY "Project members can view projects"
ON public.projects
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM project_members
    WHERE 
      project_id = id AND 
      user_id = auth.uid()
  )
);

-- PROJECT MEMBERS TABLE POLICIES
-- Project owners and admins can modify project members
DROP POLICY IF EXISTS "Project owners and admins can manage project members" ON public.project_members;
CREATE POLICY "Project owners and admins can manage project members"
ON public.project_members
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner'])
);

-- All members can view project members
DROP POLICY IF EXISTS "Project members can view other members" ON public.project_members;
CREATE POLICY "Project members can view other members"
ON public.project_members
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM project_members
    WHERE 
      project_id = project_members.project_id AND 
      user_id = auth.uid()
  )
);

-- ASSET CATEGORIES POLICIES
-- Only admins can modify asset categories
DROP POLICY IF EXISTS "Admins can manage asset categories" ON public.asset_categories;
CREATE POLICY "Admins can manage asset categories"
ON public.asset_categories
FOR ALL
USING (public.is_admin());

-- All authenticated users can view asset categories
DROP POLICY IF EXISTS "All users can view asset categories" ON public.asset_categories;
CREATE POLICY "All users can view asset categories"
ON public.asset_categories
FOR SELECT
USING (auth.role() = 'authenticated');

-- ASSETS TABLE POLICIES
-- Project members can view project assets
DROP POLICY IF EXISTS "Project members can view assets" ON public.assets;
CREATE POLICY "Project members can view assets"
ON public.assets
FOR SELECT
USING (
  public.is_admin() OR
  public.can_access_asset(id)
);

-- Project owners, editors, and admins can modify assets
DROP POLICY IF EXISTS "Project owners and editors can manage assets" ON public.assets;
CREATE POLICY "Project owners and editors can manage assets"
ON public.assets
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM asset_projects ap
    JOIN project_members pm ON ap.project_id = pm.project_id
    WHERE 
      ap.asset_id = id AND 
      pm.user_id = auth.uid() AND
      pm.role IN ('owner', 'editor')
  )
);

-- ASSET_PROJECTS TABLE POLICIES
-- Project owners, editors, and admins can modify asset relationships
DROP POLICY IF EXISTS "Project members can manage asset relationships" ON public.asset_projects;
CREATE POLICY "Project members can manage asset relationships"
ON public.asset_projects
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor'])
);

-- Project members can view asset relationships
DROP POLICY IF EXISTS "Project members can view asset relationships" ON public.asset_projects;
CREATE POLICY "Project members can view asset relationships"
ON public.asset_projects
FOR SELECT
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor', 'viewer'])
);

-- TASKS TABLE POLICIES
-- Project members can view tasks
DROP POLICY IF EXISTS "Project members can view tasks" ON public.tasks;
CREATE POLICY "Project members can view tasks"
ON public.tasks
FOR SELECT
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor', 'viewer'])
);

-- Project owners, editors, and task assignees can modify tasks
DROP POLICY IF EXISTS "Project members can manage tasks" ON public.tasks;
CREATE POLICY "Project members can manage tasks"
ON public.tasks
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor']) OR
  assignee_id = auth.uid()
);

-- TASK COMMENTS POLICIES
-- Project members can view task comments
DROP POLICY IF EXISTS "Project members can view task comments" ON public.task_comments;
CREATE POLICY "Project members can view task comments"
ON public.task_comments
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE 
      t.id = task_id AND 
      pm.user_id = auth.uid()
  )
);

-- Project members can add comments
DROP POLICY IF EXISTS "Project members can add comments" ON public.task_comments;
CREATE POLICY "Project members can add comments"
ON public.task_comments
FOR INSERT
WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE 
      t.id = task_id AND 
      pm.user_id = auth.uid()
  )
);

-- Users can edit/delete their own comments
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.task_comments;
CREATE POLICY "Users can manage their own comments"
ON public.task_comments
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin());

-- TASK ATTACHMENTS POLICIES
-- Project members can view task attachments
DROP POLICY IF EXISTS "Project members can view task attachments" ON public.task_attachments;
CREATE POLICY "Project members can view task attachments"
ON public.task_attachments
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE 
      t.id = task_id AND 
      pm.user_id = auth.uid()
  )
);

-- Project members can add attachments
DROP POLICY IF EXISTS "Project members can add attachments" ON public.task_attachments;
CREATE POLICY "Project members can add attachments"
ON public.task_attachments
FOR INSERT
WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE 
      t.id = task_id AND 
      pm.user_id = auth.uid()
  )
);

-- Users can manage their own attachments
DROP POLICY IF EXISTS "Users can manage their own attachments" ON public.task_attachments;
CREATE POLICY "Users can manage their own attachments"
ON public.task_attachments
FOR ALL
USING (user_id = auth.uid() OR public.is_admin());

-- WORKSPACES POLICIES
-- Project members can view workspaces
DROP POLICY IF EXISTS "Project members can view workspaces" ON public.workspaces;
CREATE POLICY "Project members can view workspaces"
ON public.workspaces
FOR SELECT
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor', 'viewer'])
);

-- Project owners and editors can manage workspaces
DROP POLICY IF EXISTS "Project members can manage workspaces" ON public.workspaces;
CREATE POLICY "Project members can manage workspaces"
ON public.workspaces
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor'])
);

-- DOCUMENTS POLICIES
-- Project/workspace members can view documents
DROP POLICY IF EXISTS "Project members can view documents" ON public.documents;
CREATE POLICY "Project members can view documents"
ON public.documents
FOR SELECT
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor', 'viewer']) OR
  EXISTS (
    SELECT 1 FROM workspaces w
    JOIN project_members pm ON w.project_id = pm.project_id
    WHERE 
      w.id = workspace_id AND 
      pm.user_id = auth.uid()
  )
);

-- Project owners and editors can manage documents
DROP POLICY IF EXISTS "Project members can manage documents" ON public.documents;
CREATE POLICY "Project members can manage documents"
ON public.documents
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor']) OR
  EXISTS (
    SELECT 1 FROM workspaces w
    JOIN project_members pm ON w.project_id = pm.project_id
    WHERE 
      w.id = workspace_id AND 
      pm.user_id = auth.uid() AND
      pm.role IN ('owner', 'editor')
  )
);

-- DOCUMENT HISTORY POLICIES
-- Project/workspace members can view document history
DROP POLICY IF EXISTS "Project members can view document history" ON public.document_history;
CREATE POLICY "Project members can view document history"
ON public.document_history
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM documents d
    JOIN workspaces w ON d.workspace_id = w.id
    JOIN project_members pm ON w.project_id = pm.project_id
    WHERE 
      d.id = document_id AND 
      pm.user_id = auth.uid()
  )
);

-- PORTFOLIO ITEMS POLICIES
-- Project members can view portfolio items
DROP POLICY IF EXISTS "Project members can view portfolio items" ON public.portfolio_items;
CREATE POLICY "Project members can view portfolio items"
ON public.portfolio_items
FOR SELECT
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor', 'viewer'])
);

-- Project owners and editors can manage portfolio items
DROP POLICY IF EXISTS "Project members can manage portfolio items" ON public.portfolio_items;
CREATE POLICY "Project members can manage portfolio items"
ON public.portfolio_items
FOR ALL
USING (
  public.is_admin() OR
  public.is_project_member(project_id, ARRAY['owner', 'editor'])
);

-- ACTIVITY LOGS POLICIES
-- Users can view activity logs for their projects
DROP POLICY IF EXISTS "Project members can view activity logs" ON public.activity_logs;
CREATE POLICY "Project members can view activity logs"
ON public.activity_logs
FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM project_members
    WHERE 
      project_id = activity_logs.project_id AND 
      user_id = auth.uid()
  )
);

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications and global ones
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
USING (
  user_id = auth.uid() OR 
  is_global = true OR
  public.is_admin()
);

-- Users can mark their notifications as read
DROP POLICY IF EXISTS "Users can mark their notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their notifications as read"
ON public.notifications
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  public.is_admin()
);

-- Admins can create global notifications
DROP POLICY IF EXISTS "Admins can create global notifications" ON public.notifications;
CREATE POLICY "Admins can create global notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  (is_global = true AND public.is_admin())
);
