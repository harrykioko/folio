-- Revised Schema for Folio - Unified Management Platform (Single Organization)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- Profile table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Company settings table (single record for the organization)
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  theme_color TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT single_company_settings CHECK (id = '00000000-0000-0000-0000-000000000000')
);

-- Verticals table (business verticals/areas)
CREATE TABLE verticals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects table (represents businesses in the portfolio)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  status TEXT NOT NULL, -- active, archived, completed
  vertical_id UUID REFERENCES verticals(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT NOT NULL, -- owner, editor, viewer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Asset categories
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Assets table (domains, credentials, documents, images, etc.)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- domain, credential, document, image, repository, social, subscription, apikey
  category_id UUID REFERENCES asset_categories(id) NOT NULL,
  status TEXT NOT NULL, -- active, expiring, expired, needs-attention
  expiry_date TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  starred BOOLEAN DEFAULT false,
  metadata JSONB,
  created_by UUID REFERENCES profiles(id),
  owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Assets to Projects relationship (many-to-many)
CREATE TABLE asset_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(asset_id, project_id)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- todo, in-progress, done, blocked
  priority TEXT NOT NULL, -- low, medium, high, urgent
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES projects(id),
  vertical_id UUID REFERENCES verticals(id),
  assignee_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Task attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workspaces (collaborative spaces)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Documents (for collaborative editing)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content JSONB, -- Rich text content in JSON format
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document collaboration history
CREATE TABLE document_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) NOT NULL,
  content JSONB NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- investment, product, asset
  status TEXT NOT NULL,
  value DECIMAL(18, 2),
  currency TEXT DEFAULT 'USD',
  metrics JSONB,
  project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs for tracking user actions
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- project, task, asset, etc.
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- info, warning, success, error
  is_read BOOLEAN DEFAULT false,
  entity_type TEXT, -- project, task, asset, etc.
  entity_id UUID,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Assistant conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL, -- user, assistant
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User settings for individual preferences
CREATE TABLE user_settings (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  theme TEXT DEFAULT 'system', -- light, dark, system
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics dashboards
CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics widgets
CREATE TABLE analytics_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID REFERENCES analytics_dashboards(id) NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- chart, metric, table
  config JSONB NOT NULL,
  position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row-Level Security (RLS) Policies
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Admin users can do anything with projects
CREATE POLICY "Admins have full access to projects"
  ON projects
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Regular members can view all projects
CREATE POLICY "All members can view projects"
  ON projects FOR SELECT
  USING (auth.role() = 'authenticated');

-- Project members with appropriate roles can edit projects
CREATE POLICY "Project members can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  );

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assets
CREATE POLICY "All authenticated users can view assets"
  ON assets FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin users can do anything with assets
CREATE POLICY "Admins have full access to assets"
  ON assets
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view tasks
CREATE POLICY "All authenticated users can view tasks"
  ON tasks FOR SELECT
  USING (auth.role() = 'authenticated');

-- Task assignees and admin users can modify tasks
CREATE POLICY "Task assignees can modify tasks"
  ON tasks FOR UPDATE
  USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Realtime subscription setup for collaborative features
BEGIN;
  -- Enable publication for realtime tables
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    tasks, 
    task_comments,
    documents;
COMMIT;

-- Function to handle updating the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_company_settings_timestamp
BEFORE UPDATE ON company_settings
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- (Add similar triggers for all other tables with updated_at column)

-- Create function to generate activity logs
CREATE OR REPLACE FUNCTION create_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    metadata
  )
  VALUES (
    TG_OP, -- INSERT, UPDATE, DELETE
    TG_TABLE_NAME,
    NEW.id,
    auth.uid(),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach activity log triggers to important tables
CREATE TRIGGER log_projects_activity
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE PROCEDURE create_activity_log();

CREATE TRIGGER log_assets_activity
AFTER INSERT OR UPDATE OR DELETE ON assets
FOR EACH ROW EXECUTE PROCEDURE create_activity_log();

CREATE TRIGGER log_tasks_activity
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE PROCEDURE create_activity_log();

-- Create initial seed data for verticals
INSERT INTO verticals (id, name, slug, color)
VALUES 
  (uuid_generate_v4(), 'Marketing', 'marketing', '#3B82F6'),
  (uuid_generate_v4(), 'Finance', 'finance', '#10B981'),
  (uuid_generate_v4(), 'Product', 'product', '#8B5CF6'),
  (uuid_generate_v4(), 'Development', 'development', '#F59E0B');

-- Create initial asset categories
INSERT INTO asset_categories (id, name, slug, description)
VALUES
  (uuid_generate_v4(), 'Domains & Web Assets', 'domains', 'Web domains and related resources'),
  (uuid_generate_v4(), 'Brand Assets', 'brand', 'Logos, guidelines, and brand materials'),
  (uuid_generate_v4(), 'Credentials & Access', 'credentials', 'Passwords, keys, and access credentials'),
  (uuid_generate_v4(), 'Development Resources', 'development', 'Code repositories and development tools');

-- Insert company settings (single record)
INSERT INTO company_settings (id, name, logo_url)
VALUES ('00000000-0000-0000-0000-000000000000', 'Folio', NULL);
