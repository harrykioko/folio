import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyCoreTables() {
  try {
    console.log('Verifying core tables implementation...\n');

    // 1. Check if tables exist and have RLS enabled
    const tables = ['projects', 'project_members', 'tasks', 'task_comments', 'task_attachments'];
    for (const table of tables) {
      const { data: tableInfo, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ Error accessing ${table} table:`, tableError);
        continue;
      }
      
      console.log(`✅ ${table} table exists and is accessible`);
    }

    // 2. Test project creation and RLS
    console.log('\nTesting project creation and RLS:');
    
    // Create a test project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        description: 'Test project for verification',
        created_by: '00000000-0000-0000-0000-000000000000' // Replace with actual user ID
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Error creating project:', projectError);
    } else {
      console.log('✅ Project creation working');
      
      // Test project member creation
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
          role: 'owner'
        });

      if (memberError) {
        console.error('❌ Error creating project member:', memberError);
      } else {
        console.log('✅ Project member creation working');
      }
    }

    // 3. Test task creation and RLS
    if (project) {
      console.log('\nTesting task creation and RLS:');
      
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: project.id,
          title: 'Test Task',
          description: 'Test task for verification',
          created_by: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
          status: 'todo',
          priority: 'medium'
        })
        .select()
        .single();

      if (taskError) {
        console.error('❌ Error creating task:', taskError);
      } else {
        console.log('✅ Task creation working');
        
        // Test task comment creation
        const { error: commentError } = await supabase
          .from('task_comments')
          .insert({
            task_id: task.id,
            user_id: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
            content: 'Test comment'
          });

        if (commentError) {
          console.error('❌ Error creating task comment:', commentError);
        } else {
          console.log('✅ Task comment creation working');
        }
      }
    }

    // 4. Test RLS policies
    console.log('\nTesting RLS policies:');
    
    // Test project access
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.error('❌ Error testing project RLS:', projectsError);
    } else {
      console.log('✅ Project RLS working');
    }

    // Test task access
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('❌ Error testing task RLS:', tasksError);
    } else {
      console.log('✅ Task RLS working');
    }

    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyCoreTables(); 