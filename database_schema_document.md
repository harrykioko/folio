# Folio Database Schema Documentation

## Overview

This document provides a comprehensive analysis of the Folio application's database schema, mapping UI components to database tables, identifying gaps, and recommending improvements. Folio is designed as a single-tenant solution for internal team use, with projects as the main organizational unit.

## Table of Contents

1. [Database Design Principles](#database-design-principles)
2. [Page-by-Page Analysis](#page-by-page-analysis)
   - [Auth](#auth)
   - [Dashboard](#dashboard)
   - [Assets](#assets)
   - [Tasks](#tasks)
   - [Workspace](#workspace)
   - [Portfolio](#portfolio)
   - [Analytics](#analytics)
   - [Settings](#settings)
   - [Assistant](#assistant)
3. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Schema Migration Planning](#schema-migration-planning)
5. [Future Schema Evolution](#future-schema-evolution)

## Database Design Principles

The Folio database follows these key design principles:

1. **Single-Tenant Architecture**: The application is designed for a single organization with multiple projects.
2. **Project-Centric Model**: Projects are the primary organizational unit, with other entities related to projects.
3. **Row-Level Security**: Comprehensive RLS policies control access to data based on user roles and project membership.
4. **Audit Trail**: Activity logs track all significant changes for accountability and history.
5. **Extensible Metadata**: JSONB fields allow for flexible extension of entity attributes without schema changes.
6. **Standard Table Structure**: All tables follow a consistent structure with UUID primary keys, ownership references, and timestamps.
7. **Proper Data Types**: Each column uses appropriate PostgreSQL data types for optimal performance and data integrity.
8. **Foreign Key Constraints**: Relationships are enforced at the database level with appropriate ON DELETE actions.

### Standard Table Structure

Every table in the Folio database follows this standard structure:

```sql
CREATE TABLE IF NOT EXISTS public.table_name (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Owner reference (critical for RLS)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Table-specific fields here
  -- ...
  
  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an update trigger to manage updated_at automatically
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON table_name
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
```

This structure ensures:
- Consistent UUID primary keys with automatic generation
- Clear ownership tracking for RLS implementation
- Automatic timestamp management for auditing
- Proper update triggers for maintaining data integrity

## Page-by-Page Analysis

### Auth

#### UI and Functionality Analysis
- **UI Components**: Login form, registration form, password reset
- **Key Interactions**: User authentication, account creation, password management
- **Data Elements**: User email, password, first/last name
- **Relationships**: Users to profiles

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| User Authentication | `auth.users` (Supabase) | email, password (hashed) | None - uses Supabase Auth |
| User Profile | `profiles` | id, first_name, last_name, avatar_url, role | No field for bio (shown in profile settings) |
| Session Management | Handled by Supabase Auth | | None |

#### Recommended Improvements
1. Add `bio` field to `profiles` table to store user biography
2. Add `phone` field to `profiles` for contact information
3. Consider adding `last_login_at` timestamp for security monitoring

#### RLS Policies
- Users can view/edit only their own profile
- All authenticated users can view basic profile information of other users for collaboration features

### Dashboard

#### UI and Functionality Analysis
- **UI Components**: Metrics cards, priority tasks list, activity feed, calendar
- **Key Interactions**: View overview of workspace, access quick links, view upcoming tasks
- **Data Elements**: Tasks, metrics, activities, calendar events
- **Relationships**: Tasks to projects, activities to various entities

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Priority Tasks | `tasks` | id, title, description, status, priority, due_date, project_id, assignee_id | None |
| Activity Feed | `activity_logs` | id, action, entity_type, entity_id, user_id, metadata | No specific fields for activity types shown in UI |
| Metrics | No dedicated table | | Need metrics calculation logic or storage |
| Calendar Events | No dedicated table | | Missing calendar events storage |

#### Recommended Improvements
1. Create `calendar_events` table with fields: id, title, description, start_time, end_time, all_day, user_id, project_id
2. Add `metrics` table or implement view/function for metrics calculation
3. Enhance `activity_logs` with additional fields for better filtering: `importance_level`, `requires_action`

#### RLS Policies
- Users can view tasks and activities related to projects they are members of
- All users can view company-wide metrics
- Users can only see calendar events they created or are invited to

### Assets

#### UI and Functionality Analysis
- **UI Components**: Asset grid/list view, asset details, category filters, search
- **Key Interactions**: Browse assets, view details, filter by category, search, star assets
- **Data Elements**: Asset name, type, category, expiry, owner, projects
- **Relationships**: Assets to projects, assets to categories

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Asset List/Grid | `assets` | id, name, description, type, category_id, status, expiry_date, thumbnail_url, starred, metadata | None |
| Asset Categories | `asset_categories` | id, name, slug, description | None |
| Asset-Project Relation | `asset_projects` | id, asset_id, project_id | None |
| Asset Search | Uses existing tables | | No dedicated search index |

#### Recommended Improvements
1. Add `color` field to `asset_categories` for UI display
2. Add `tags` array field to `assets` for improved searchability
3. Create index on `assets.name` and `assets.description` for faster search
4. Add `last_accessed_at` timestamp to track asset usage

#### RLS Policies
- Users can view assets related to projects they are members of
- Project owners and editors can create/edit assets
- All users can view asset categories

### Tasks

#### UI and Functionality Analysis
- **UI Components**: Kanban board, task cards, filters, search
- **Key Interactions**: Create/edit tasks, change status, assign tasks, add comments
- **Data Elements**: Task title, description, status, priority, assignee, comments
- **Relationships**: Tasks to projects, tasks to users (assignee)

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Task Board | `tasks` | id, title, description, status, priority, due_date, project_id, assignee_id | Status values in UI don't match DB (UI has 'review' status) |
| Task Comments | `task_comments` | id, task_id, content, user_id | None |
| Task Attachments | `task_attachments` | id, task_id, name, file_url, file_type, file_size, user_id | None |
| Task Filters | Uses existing tables | | No dedicated filter preferences storage |

#### Recommended Improvements
1. Standardize `tasks.status` values to match UI: 'todo', 'in_progress', 'review', 'done'
2. Add `tags` array field to `tasks` for categorization and filtering
3. Add `estimated_hours` and `actual_hours` fields for time tracking
4. Create `task_checklist_items` table for subtasks/checklist functionality

#### RLS Policies
- Project members can view tasks in their projects
- Task assignees and project editors/owners can update tasks
- Users can only edit their own comments

### Workspace

#### UI and Functionality Analysis
- **UI Components**: Document list, document editor, collaboration tools
- **Key Interactions**: Create/edit documents, collaborate in real-time, organize documents
- **Data Elements**: Document title, content, collaborators, last edited
- **Relationships**: Documents to workspaces, documents to projects

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Workspaces | `workspaces` | id, name, description, project_id, created_by | No field for workspace type or icon |
| Documents | `documents` | id, title, content, workspace_id, project_id, created_by | No fields for document type or tags |
| Document History | `document_history` | id, document_id, content, user_id | No field for version name or description |
| Collaboration | No dedicated table | | Missing real-time collaboration tracking |

#### Recommended Improvements
1. Add `icon` and `type` fields to `workspaces`
2. Add `type`, `tags`, and `last_edited_by` fields to `documents`
3. Add `version_name` and `description` to `document_history`
4. Create `document_collaborators` table to track active collaborators

#### RLS Policies
- Project members can view workspaces and documents in their projects
- Document creators and project editors/owners can edit documents
- All project members can view document history

### Portfolio

#### UI and Functionality Analysis
- **UI Components**: Portfolio item cards, metrics, filters
- **Key Interactions**: View portfolio items, track metrics, filter by type
- **Data Elements**: Item name, type, value, metrics, status
- **Relationships**: Portfolio items to projects

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Portfolio Items | `portfolio_items` | id, name, description, type, status, value, currency, metrics, project_id | No field for target values or performance indicators |
| Portfolio Metrics | Uses JSONB in portfolio_items | | No structured storage for metrics history |
| Portfolio Filters | Uses existing tables | | No saved filter preferences |

#### Recommended Improvements
1. Add `target_value` and `performance_indicator` fields to `portfolio_items`
2. Create `portfolio_metrics_history` table to track metrics changes over time
3. Add `display_order` field for custom sorting of portfolio items
4. Add `tags` array for improved categorization

#### RLS Policies
- Project members can view portfolio items in their projects
- Project owners and editors can create/edit portfolio items
- All authenticated users can view company-wide portfolio summaries

### Analytics

#### UI and Functionality Analysis
- **UI Components**: Charts, KPI cards, filters, date range selector
- **Key Interactions**: View metrics, change date ranges, export data
- **Data Elements**: Revenue, users, conversion rates, session times
- **Relationships**: Metrics to projects, metrics to time periods

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| KPI Metrics | No dedicated table | | Missing structured metrics storage |
| Charts Data | No dedicated table | | Missing time-series data storage |
| Analytics Filters | No dedicated table | | Missing saved filter preferences |

#### Recommended Improvements
1. Create `analytics_metrics` table with fields: id, name, value, previous_value, change_percentage, metric_date, project_id
2. Create `analytics_time_series` table for historical data points
3. Create `analytics_dashboards` table to allow custom dashboard creation
4. Add `user_analytics_preferences` table for saved user preferences

#### RLS Policies
- Project members can view analytics for their projects
- Admins can view all analytics
- Users can only access their own analytics preferences

### Settings

#### UI and Functionality Analysis
- **UI Components**: Profile settings, appearance settings, other setting tabs
- **Key Interactions**: Update profile, change appearance, configure settings
- **Data Elements**: User profile, company settings, preferences
- **Relationships**: Settings to users, company-wide settings

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Profile Settings | `profiles` | id, first_name, last_name, avatar_url, role | Missing bio field shown in UI |
| Company Settings | `company_settings` | id, name, logo_url, theme_color, contact_email | None |
| User Preferences | No dedicated table | | Missing user-specific preferences storage |

#### Recommended Improvements
1. Add `bio` field to `profiles` table
2. Create `user_preferences` table with fields: id, user_id, theme, language, notifications_enabled
3. Expand `company_settings` with additional fields: `timezone`, `date_format`, `currency_format`
4. Add `security_settings` table for organization-wide security policies

#### RLS Policies
- Users can view/edit only their own preferences
- Only admins can edit company settings
- All authenticated users can view company settings

### Assistant

#### UI and Functionality Analysis
- **UI Components**: Chat interface, conversation history, AI responses
- **Key Interactions**: Chat with AI, view conversation history, start new conversations
- **Data Elements**: Messages, conversations, AI responses
- **Relationships**: Conversations to users

#### Database Mapping

| UI Feature | Current Tables | Fields | Gaps/Inconsistencies |
|------------|----------------|--------|----------------------|
| Conversations | `ai_conversations` | id, title, user_id, organization_id | No field for conversation context or status |
| Messages | `ai_messages` | id, conversation_id, content, role, metadata | None |
| AI Context | No dedicated storage | | Missing structured context storage |

#### Recommended Improvements
1. Add `context`, `status`, and `pinned` fields to `ai_conversations`
2. Add `is_read` field to `ai_messages`
3. Create `ai_conversation_references` table to link conversations to entities (projects, tasks, etc.)
4. Add `ai_user_preferences` table for personalized assistant settings

#### RLS Policies
- Users can only access their own conversations and messages
- Admins can view all conversations for audit purposes
- Messages are strictly private to the conversation owner

## Row-Level Security (RLS) Policies

The Folio application implements comprehensive Row-Level Security (RLS) policies to ensure data access is properly controlled. Here's a summary of the key RLS patterns:

### Core RLS Patterns

1. **User-Based Access**
   - Users can only access their own profile data
   - Example: `auth.uid() = id` for profiles table
   - Policy naming: "Users can view their own records"

2. **Project Membership Access**
   - Users can access data for projects they are members of
   - Uses helper function: `is_project_member(project_id, roles)`
   - Policy naming: "Project members can view project records"

3. **Role-Based Access**
   - Different access levels based on user roles (admin, project owner, editor, viewer)
   - Admins have broader access rights across the application
   - Policy naming: "Admins can view all records"

4. **Entity Ownership**
   - Users who created entities have special access rights
   - Example: `created_by = auth.uid()`
   - Policy naming: "Users can update records they created"

### Standard RLS Policy Implementation

For each table, the following standard policies are implemented:

```sql
-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Users can view their own records" ON public.table_name;
DROP POLICY IF EXISTS "Users can create their own records" ON public.table_name;
DROP POLICY IF EXISTS "Users can update their own records" ON public.table_name;
DROP POLICY IF EXISTS "Users can delete their own records" ON public.table_name;

-- Create the CRUD policies
CREATE POLICY "Users can view their own records" 
ON public.table_name FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own records" 
ON public.table_name FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" 
ON public.table_name FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" 
ON public.table_name FOR DELETE
USING (auth.uid() = user_id);
```

For shared resources, additional policies are implemented:

```sql
-- Example for project-related tables
CREATE POLICY "Project members can view project records"
ON public.project_items FOR SELECT
USING (
  project_id IN (
    SELECT project_id FROM public.project_members 
    WHERE user_id = auth.uid()
  )
);
```

### Table-Specific RLS Implementation

Each table has specific RLS policies tailored to its access patterns:

1. **Core Tables (profiles, company_settings)**
   - Profiles: Users can view/edit their own profile
   - Company Settings: Only admins can modify, all users can view

2. **Project-Related Tables**
   - Projects: Members can view, owners/admins can edit
   - Project Members: Owners/admins can manage membership

3. **Content Tables (assets, tasks, documents)**
   - Access controlled by project membership
   - Edit rights determined by role (owner, editor, viewer)
   - Special cases for assignees (tasks) and collaborators (documents)

4. **Personal Data (notifications, ai_conversations)**
   - Strict user-based access control
   - Only the owner can view/edit their data

## Schema Migration Planning

To evolve the database schema effectively, we recommend the following approach:

### Migration Strategy

1. **Versioned Migrations**
   - Use timestamped migration files (already implemented)
   - Example: `20250324182100_add_check_rls_function.sql`
   - Include both "up" and "down" migration code for reversibility

2. **Validation System**
   - Continue using the implemented schema validation system
   - Validate tables against expected schemas
   - Check RLS policy enablement
   - Use the `validateDatabaseSchema` utility for automated validation

3. **Testing Framework**
   - Utilize the RLS testing system for security validation
   - Test all operations (SELECT, INSERT, UPDATE, DELETE)
   - Generate validation reports
   - Use the `testRLSPolicy` utility for comprehensive testing

### Implementation Process

For each schema change:

1. Create a new migration file with timestamp prefix
2. Include both "up" and "down" migration code
3. Update schema validation definitions
4. Run RLS tests to verify security policies
5. Document changes in this schema document

### Development Workflow

When adding a new table:

1. Follow the standard table structure with UUID, timestamps, and ownership
2. Enable RLS immediately after table creation
3. Set up the standard CRUD policies
4. Test the policies with the RLS testing utility
5. Update the schema validation utility to include the new table
6. Document the table structure and usage in this document

## Frontend Data Interaction

To ensure proper data handling in the frontend, the following patterns should be used:

### Custom Hooks for Supabase Queries

Use the `useSupabaseQuery` and `useSupabaseQuerySingle` hooks for all database interactions:

```typescript
// Example usage in a component
const { data: tasks, loading, error } = useSupabaseQuery(
  'tasks',
  (query) => query
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false }),
  [projectId]
);
```

This pattern prevents common issues like:
- Infinite render loops
- Missing error handling
- State updates after component unmounting
- Inefficient query patterns

### Anti-Patterns to Avoid

1. **Infinite Render Loops**
   - Don't call Supabase inside useEffect without proper dependencies
   - Don't set state that triggers a re-render inside useEffect without dependency management

2. **Inefficient Queries**
   - Don't fetch all columns when only a few are needed
   - Don't fetch all rows when pagination or limits can be used
   - Always use `select()` to specify only needed columns
   - Use `limit()`, `range()`, or pagination in queries

3. **Improper Error Handling**
   - Don't ignore query errors
   - Always check for errors and display appropriate messages to users

## Future Schema Evolution

As the application evolves, consider these directions for schema enhancement:

1. **Performance Optimization**
   - Add appropriate indexes on frequently queried fields
   - Consider materialized views for complex analytics queries
   - Implement query monitoring and optimization
   - Use appropriate PostgreSQL data types for each column

2. **Feature Extensions**
   - Integration with external services via new junction tables
   - Enhanced metadata capabilities through structured JSONB schemas
   - Versioning system for critical data entities
   - Enforce relationships with foreign key constraints

3. **Scalability Improvements**
   - Consider partitioning for large tables (activity_logs, analytics_data)
   - Implement archiving strategy for historical data
   - Add caching layer for frequently accessed data
   - Use appropriate ON DELETE actions for foreign keys

4. **Security Enhancements**
   - Implement row-level encryption for sensitive data
   - Add audit logging for security-critical operations
   - Enhance RLS policies with more granular controls
   - Ensure RLS is enabled on all tables

---

This document will be maintained and updated as the schema evolves. All significant changes should be documented here to maintain a comprehensive understanding of the database structure and its relationship to the application's functionality.
