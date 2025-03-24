import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useProjects } from './use-projects';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Task = Tables<'tasks'>;
export type TaskComment = Tables<'task_comments'>;
export type TaskAttachment = Tables<'task_attachments'>;

interface TasksState {
  tasks: Task[] | null;
  selectedTask: Task | null;
  taskComments: Record<string, TaskComment[]>;
  taskAttachments: Record<string, TaskAttachment[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useTasks() {
  const { user } = useAuth();
  const { currentProject } = useProjects();
  const [state, setState] = useState<TasksState>({
    tasks: null,
    selectedTask: null,
    taskComments: {},
    taskAttachments: {},
    isLoading: false,
    error: null,
  });

  // Fetch all tasks for the current project
  const fetchTasks = useCallback(async () => {
    if (!user || !currentProject) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to:profiles!tasks_assigned_to_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          created_by:profiles!tasks_created_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('project_id', currentProject.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        tasks,
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
  }, [user, currentProject]);

  // Fetch comments for a specific task
  const fetchTaskComments = useCallback(async (taskId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: comments, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        taskComments: {
          ...prev.taskComments,
          [taskId]: comments || [],
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

  // Fetch attachments for a specific task
  const fetchTaskAttachments = useCallback(async (taskId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: attachments, error } = await supabase
        .from('task_attachments')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        taskAttachments: {
          ...prev.taskAttachments,
          [taskId]: attachments || [],
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

  // Create a new task
  const createTask = async (
    title: string,
    description: string,
    assigneeId?: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    status: 'todo' | 'in_progress' | 'review' | 'done' = 'todo',
    dueDate?: string,
    tags: string[] = []
  ) => {
    if (!user || !currentProject) {
      return { data: null, error: new Error('User not authenticated or no project selected') };
    }

    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          assigned_to: assigneeId,
          priority,
          status,
          due_date: dueDate,
          project_id: currentProject.id,
          created_by: user.id,
          tags,
        })
        .select(`
          *,
          assigned_to:profiles!tasks_assigned_to_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          created_by:profiles!tasks_created_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        tasks: [...(prev.tasks || []), task],
      }));

      return { data: task, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          assigned_to:profiles!tasks_assigned_to_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          created_by:profiles!tasks_created_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        tasks: prev.tasks?.map(task => 
          task.id === id ? data : task
        ) || null,
        selectedTask: prev.selectedTask?.id === id 
          ? data 
          : prev.selectedTask,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        tasks: prev.tasks?.filter(task => task.id !== id) || null,
        selectedTask: prev.selectedTask?.id === id ? null : prev.selectedTask,
        // Remove task comments and attachments from state
        taskComments: {
          ...prev.taskComments,
          [id]: undefined,
        },
        taskAttachments: {
          ...prev.taskAttachments,
          [id]: undefined,
        },
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Add a comment to a task
  const addTaskComment = async (taskId: string, content: string) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          content,
          user_id: user.id,
        })
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        taskComments: {
          ...prev.taskComments,
          [taskId]: [...(prev.taskComments[taskId] || []), comment],
        },
      }));

      return { data: comment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Delete a task comment
  const deleteTaskComment = async (commentId: string, taskId: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        taskComments: {
          ...prev.taskComments,
          [taskId]: prev.taskComments[taskId]?.filter(comment => comment.id !== commentId) || [],
        },
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Add an attachment to a task
  const addTaskAttachment = async (
    taskId: string,
    file: File,
    name?: string,
    description?: string
  ) => {
    if (!user || !currentProject) {
      return { data: null, error: new Error('User not authenticated or no project selected') };
    }

    try {
      // Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `projects/${currentProject.id}/tasks/${taskId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      // Create attachment record
      const { data: attachment, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          name: name || file.name,
          description,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          url: publicUrl,
          user_id: user.id,
        })
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        taskAttachments: {
          ...prev.taskAttachments,
          [taskId]: [...(prev.taskAttachments[taskId] || []), attachment],
        },
      }));

      return { data: attachment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Delete a task attachment
  const deleteTaskAttachment = async (attachmentId: string, taskId: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      // First get the attachment to find the file path
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage if file_path exists
      if (attachment?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('attachments')
          .remove([attachment.file_path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue even if storage deletion fails
        }
      }

      // Delete the attachment record
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        taskAttachments: {
          ...prev.taskAttachments,
          [taskId]: prev.taskAttachments[taskId]?.filter(
            attachment => attachment.id !== attachmentId
          ) || [],
        },
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Set the selected task
  const selectTask = (task: Task | null) => {
    setState(prev => ({
      ...prev,
      selectedTask: task,
    }));

    // If selecting a task, load its comments and attachments
    if (task) {
      fetchTaskComments(task.id);
      fetchTaskAttachments(task.id);
    }
  };

  // Filter tasks by status
  const filterTasksByStatus = (status: string | string[]) => {
    if (!state.tasks) return [];
    
    const statusArray = Array.isArray(status) ? status : [status];
    return state.tasks.filter(task => statusArray.includes(task.status));
  };

  // Filter tasks by assignee
  const filterTasksByAssignee = (assigneeId: string) => {
    if (!state.tasks) return [];
    return state.tasks.filter(task => task.assigned_to === assigneeId);
  };

  // Filter tasks by priority
  const filterTasksByPriority = (priority: string | string[]) => {
    if (!state.tasks) return [];
    
    const priorityArray = Array.isArray(priority) ? priority : [priority];
    return state.tasks.filter(task => priorityArray.includes(task.priority));
  };

  // Load tasks when component mounts or project changes
  useEffect(() => {
    if (user && currentProject) {
      fetchTasks();
    } else {
      setState({
        tasks: null,
        selectedTask: null,
        taskComments: {},
        taskAttachments: {},
        isLoading: false,
        error: null,
      });
    }
  }, [user, currentProject, fetchTasks]);

  // Setup realtime subscription for tasks
  useEffect(() => {
    if (!user || !currentProject) return;

    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `project_id=eq.${currentProject.id}`
        }, 
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    // Subscribe to task comment changes if a task is selected
    let commentsSubscription;
    let attachmentsSubscription;
    
    if (state.selectedTask) {
      commentsSubscription = supabase
        .channel('task-comments-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'task_comments',
            filter: `task_id=eq.${state.selectedTask.id}`
          }, 
          () => {
            fetchTaskComments(state.selectedTask!.id);
          }
        )
        .subscribe();
        
      attachmentsSubscription = supabase
        .channel('task-attachments-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'task_attachments',
            filter: `task_id=eq.${state.selectedTask.id}`
          }, 
          () => {
            fetchTaskAttachments(state.selectedTask!.id);
          }
        )
        .subscribe();
    }

    return () => {
      tasksSubscription.unsubscribe();
      if (commentsSubscription) commentsSubscription.unsubscribe();
      if (attachmentsSubscription) attachmentsSubscription.unsubscribe();
    };
  }, [user, currentProject, state.selectedTask, fetchTasks, fetchTaskComments, fetchTaskAttachments]);

  return {
    tasks: state.tasks,
    selectedTask: state.selectedTask,
    comments: state.selectedTask ? state.taskComments[state.selectedTask.id] || [] : [],
    attachments: state.selectedTask ? state.taskAttachments[state.selectedTask.id] || [] : [],
    isLoading: state.isLoading,
    error: state.error,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    deleteTaskComment,
    addTaskAttachment,
    deleteTaskAttachment,
    selectTask,
    filterTasksByStatus,
    filterTasksByAssignee,
    filterTasksByPriority,
  };
}
