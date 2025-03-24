# Supabase Best Practices: Database Structure, RLS, and Testing

This document outlines best practices for working with Supabase in our multi-vertical SaaS project, with a focus on database structure, Row Level Security (RLS), and testing methodologies.

## Database Table Structure

### Table Creation Standards

Every table should follow these structural standards:

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

### Checklist for New Tables

- ✅ Each table has a UUID primary key with default generator
- ✅ Each table includes a `user_id` for ownership (with foreign key constraint)
- ✅ Each table has `created_at` and `updated_at` timestamp fields
- ✅ Add an update trigger to automatically manage `updated_at`
- ✅ Use appropriate data types for each column
- ✅ Consider adding appropriate indexes for frequently queried columns
- ✅ Enable RLS on the table immediately after creation

## Row Level Security (RLS)

### RLS Policies Template

After creating any table, immediately enable RLS and set up the standard CRUD policies:

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

### Special RLS Cases

#### Shared Resources

For resources that can be shared among multiple users:

```sql
-- Example for a "team_members" table
CREATE POLICY "Users can view teams they belong to"
ON public.team_members FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.team_members 
  WHERE team_id = public.team_members.team_id
));
```

#### Admin Access

If you need to grant admin users special access:

```sql
-- Admin can view all records
CREATE POLICY "Admins can view all records"
ON public.table_name FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);
```

### RLS Policy Naming Convention

Use consistent naming for policies:
- `Users can [action] their own [resource]`
- `Team members can [action] shared [resource]`
- `Admins can [action] all [resource]`

## Frontend Data Interaction Patterns

### Custom Hooks for Supabase Queries

To prevent infinite render loops, always use a custom hook pattern:

```javascript
// useSupabaseQuery.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabaseQuery(tableName, queryFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Allow for custom query building or use default
        let query;
        if (typeof queryFn === 'function') {
          query = queryFn(supabase.from(tableName));
        } else {
          query = supabase.from(tableName).select('*');
        }
        
        const { data: result, error: queryError } = await query;
        
        if (queryError) throw queryError;
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error(`Error fetching data from ${tableName}:`, err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
```

### Usage Example

```javascript
// In a component file
const { data: tasks, loading, error } = useSupabaseQuery(
  'tasks',
  (query) => query.select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  [userId]
);
```

## Testing Database and RLS

### RLS Testing Utility

Create a testing utility to verify your RLS policies are working as expected:

```javascript
// rlsTester.js
export const testRLSPolicy = async (supabase, tableName) => {
  console.log(`Testing RLS for ${tableName}...`);
  const results = {};
  
  // Test SELECT
  try {
    const { data: selectData, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    results.select = {
      success: !selectError,
      message: selectError ? selectError.message : 'Success'
    };
  } catch (err) {
    results.select = {
      success: false,
      message: err.message
    };
  }
  
  // Get current user ID
  const user = supabase.auth.user();
  if (!user) {
    console.error('No authenticated user found');
    results.overall = 'Failed - No authenticated user';
    return results;
  }
  
  // Test INSERT with minimal data
  try {
    // Add test fields based on table
    let testData = { user_id: user.id };
    
    // Add required fields based on table
    switch(tableName) {
      case 'company_settings':
        testData.company_name = 'Test Company';
        break;
      case 'tasks':
        testData.title = 'Test Task';
        testData.status = 'pending';
        break;
      // Add cases for other tables
      default:
        testData.name = 'Test Entry';
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from(tableName)
      .insert([testData])
      .select();
    
    results.insert = {
      success: !insertError,
      message: insertError ? insertError.message : 'Success',
      insertedId: insertData && insertData[0] ? insertData[0].id : null
    };
      
    // If insert succeeded, test UPDATE and DELETE on the new row
    if (!insertError && insertData && insertData[0]) {
      const insertedId = insertData[0].id;
      
      // Test UPDATE
      try {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', insertedId);
          
        results.update = {
          success: !updateError,
          message: updateError ? updateError.message : 'Success'
        };
      } catch (err) {
        results.update = {
          success: false,
          message: err.message
        };
      }
      
      // Test DELETE
      try {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', insertedId);
          
        results.delete = {
          success: !deleteError,
          message: deleteError ? deleteError.message : 'Success'
        };
      } catch (err) {
        results.delete = {
          success: false,
          message: err.message
        };
      }
    }
  } catch (err) {
    results.insert = {
      success: false,
      message: err.message
    };
  }
  
  // Determine overall result
  const allTests = Object.values(results).filter(r => typeof r === 'object');
  const allPassed = allTests.every(test => test.success);
  results.overall = allPassed ? 'Passed' : 'Failed';
  
  return results;
};
```

### Schema Validation Utility

Create a utility to validate your database schema:

```javascript
// dbValidator.js
export const validateDatabaseSchema = async (supabase) => {
  console.log('Validating database schema...');
  
  // Define expected tables and their required columns
  const tables = [
    {
      name: 'company_settings',
      requiredColumns: ['id', 'user_id', 'company_name', 'logo_url', 'created_at', 'updated_at']
    },
    {
      name: 'tasks',
      requiredColumns: ['id', 'user_id', 'title', 'description', 'status', 'created_at', 'updated_at']
    },
    // Add other tables as needed
  ];
  
  const issues = [];
  
  for (const table of tables) {
    console.log(`Checking table: ${table.name}`);
    
    // Check if table exists
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        issues.push(`Table '${table.name}' does not exist or has incorrect structure`);
      } else {
        issues.push(`Error checking table '${table.name}': ${error.message}`);
      }
    } else {
      console.log(`Table '${table.name}' exists`);
      
      // Check if RLS is enabled - requires an RPC function
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('check_rls_enabled', { table_name: table.name });
        
      if (rlsError) {
        issues.push(`Error checking RLS for '${table.name}': ${rlsError.message}`);
      } else if (!rlsData) {
        issues.push(`RLS is not enabled for '${table.name}'`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};
```

## Common Anti-Patterns to Avoid

### Frontend Anti-Patterns

1. **Infinite Render Loops**
   - ❌ Don't call Supabase inside useEffect without dependencies
   - ❌ Don't set state that triggers a re-render inside useEffect without proper dependency management
   - ✅ Always use our custom hooks or provide proper dependency arrays

2. **Inefficient Queries**
   - ❌ Don't fetch all columns when you only need a few
   - ❌ Don't fetch all rows when you can paginate or limit
   - ✅ Use `select()` to specify only needed columns
   - ✅ Use `limit()`, `range()`, or pagination in your queries

3. **Improper Error Handling**
   - ❌ Don't ignore query errors
   - ✅ Always check for errors and display appropriate messages to users
   
### Database Anti-Patterns

1. **Missing RLS Policies**
   - ❌ Don't create tables without RLS enabled
   - ✅ Always enable RLS and create appropriate policies immediately

2. **Inappropriate Column Types**
   - ❌ Don't use TEXT for boolean values or numbers
   - ❌ Don't use TIMESTAMP WITHOUT TIME ZONE
   - ✅ Use appropriate PostgreSQL data types

3. **Missing Foreign Keys**
   - ❌ Don't create relationships without enforcing them at the database level
   - ✅ Use REFERENCES constraints with appropriate ON DELETE actions

## Development Workflow

### When Adding a New Page

1. Identify required database tables for the page
2. Create or update tables with proper structure
3. Enable RLS and set up appropriate policies
4. Test RLS policies with the testing utility
5. Create frontend components using the custom hook pattern
6. Implement data fetching and error handling
7. Verify no infinite loops are created

### When Adding a New Table

1. Follow the table creation standard
2. Enable RLS immediately
3. Set up the standard CRUD policies
4. Test the policies with the testing utility
5. Update the schema validation utility to include the new table
6. Document the table structure and usage

## Troubleshooting Common Issues

### RLS Policy Errors

If you encounter errors like "new row violates row-level security policy":

1. Check that the user is authenticated
2. Verify the user_id in the inserted/updated data matches auth.uid()
3. Test the policy with the RLS testing utility
4. Check for typos in policy definitions

### Infinite Render Loops

If you encounter "Maximum update depth exceeded":

1. Check your useEffect dependencies
2. Make sure you're using our custom hooks
3. Verify that your state updates aren't triggering additional renders
4. Consider using useCallback for functions passed as dependencies

## Database Management Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
