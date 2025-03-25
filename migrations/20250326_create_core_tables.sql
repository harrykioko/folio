-- Migration: 20250326_create_core_tables.sql
-- Description: Creates core tables for project and task management
-- Author: System

-- Start transaction
BEGIN;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Grant permissions on profiles
GRANT ALL ON public.profiles TO authenticated;

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'active',
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'archived', 'on_hold'))
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'todo',
    priority text NOT NULL DEFAULT 'medium',
    assigned_to uuid REFERENCES public.profiles(id),
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    due_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'document', 'video', 'audio', 'other'))
);

-- Create indexes for foreign keys and commonly queried columns
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view projects they are members of"
ON public.projects FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = id
    )
);

CREATE POLICY "Project owners can update projects"
ON public.projects FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = id AND role = 'owner'
    )
);

CREATE POLICY "Project owners can delete projects"
ON public.projects FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = id AND role = 'owner'
    )
);

-- Project members policies
CREATE POLICY "Users can view project members"
ON public.project_members FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = project_members.project_id
    )
);

CREATE POLICY "Project owners can manage members"
ON public.project_members FOR ALL
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = project_members.project_id AND role = 'owner'
    )
);

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects"
ON public.tasks FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = tasks.project_id
    )
);

CREATE POLICY "Users can create tasks in their projects"
ON public.tasks FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = tasks.project_id
    )
);

CREATE POLICY "Users can update tasks in their projects"
ON public.tasks FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = tasks.project_id
    )
);

CREATE POLICY "Users can delete tasks in their projects"
ON public.tasks FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = tasks.project_id
    )
);

-- Task comments policies
CREATE POLICY "Users can view comments on tasks in their projects"
ON public.task_comments FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = (
            SELECT project_id FROM public.tasks
            WHERE id = task_comments.task_id
        )
    )
);

CREATE POLICY "Users can create comments on tasks in their projects"
ON public.task_comments FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = (
            SELECT project_id FROM public.tasks
            WHERE id = task_comments.task_id
        )
    )
);

-- Task attachments policies
CREATE POLICY "Users can view attachments on tasks in their projects"
ON public.task_attachments FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = (
            SELECT project_id FROM public.tasks
            WHERE id = task_attachments.task_id
        )
    )
);

CREATE POLICY "Users can create attachments on tasks in their projects"
ON public.task_attachments FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.project_members
        WHERE project_id = (
            SELECT project_id FROM public.tasks
            WHERE id = task_attachments.task_id
        )
    )
);

-- Grant permissions
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.task_comments TO authenticated;
GRANT ALL ON public.task_attachments TO authenticated;

-- Commit transaction
COMMIT; 