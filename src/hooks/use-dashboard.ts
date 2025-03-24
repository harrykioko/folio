import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from "@/components/ui/use-toast";

// Define types for dashboard data
type Task = Tables<'tasks'>;
type Project = Tables<'projects'>;
type Asset = Tables<'assets'>;
type Activity = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  metadata: any;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
};

type Metric = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
};

// Define a more specific type for the verticals
interface Vertical {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Type for tasks returned from the database
interface TaskWithVertical extends Task {
  verticals?: Vertical | Vertical[] | null;
}

export function useDashboard() {
  const { user, currentProject } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const projectId = currentProject?.id;

  // Fetch priority tasks
  const { data: priorityTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['priorityTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          description, 
          status, 
          priority, 
          due_date,
          assignee_id,
          vertical_id,
          verticals:vertical_id (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('project_id', projectId)
        .in('priority', ['high', 'medium'])
        .in('status', ['todo', 'in-progress', 'blocked'])
        .order('due_date', { ascending: true })
        .limit(4);
      
      if (error) {
        console.error('Error fetching priority tasks:', error);
        return [];
      }
      
      return (data as TaskWithVertical[]).map(task => {
        // Extract vertical data safely with type handling
        let verticalData: Vertical | null = null;
        
        if (task.verticals) {
          if (Array.isArray(task.verticals) && task.verticals.length > 0) {
            // It's an array, take the first item
            verticalData = task.verticals[0];
          } else if (typeof task.verticals === 'object') {
            // It's already an object
            verticalData = task.verticals as Vertical;
          }
        }
          
        return {
          ...task,
          vertical: verticalData ? {
            type: verticalData.slug,
            name: verticalData.name,
            color: verticalData.color
          } : null,
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }) : 'No due date'
        };
      });
    },
    enabled: !!projectId,
  });

  // Fetch activity feed
  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['activityFeed', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching activity feed:', error);
        return [];
      }
      
      return data.map(activity => {
        // Parse metadata to determine activity type and details
        const metadata = activity.metadata || {};
        const verticalInfo = metadata.vertical || { type: 'general' };
        
        return {
          id: activity.id,
          type: activity.entity_type, // task, document, comment, etc.
          message: metadata.message || `Action performed on ${activity.entity_type}`,
          time: formatTimeAgo(activity.created_at),
          user: activity.profiles ? 
            `${activity.profiles.first_name} ${activity.profiles.last_name}` : 
            'System',
          vertical: verticalInfo.type,
          verticalName: verticalInfo.name
        };
      });
    },
    enabled: !!projectId,
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Tasks count by status
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('project_id', projectId);
      
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Calculate metrics from tasks
      const tasksCompleted = tasks?.filter(t => t.status === 'done').length || 0;
      const openIssues = tasks?.filter(t => t.status !== 'done').length || 0;
      
      // Assets count
      const { count: assetsCount, error: assetsError } = await supabase
        .from('assets')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);
      
      if (assetsError) {
        console.error('Error fetching assets count:', assetsError);
      }

      // Team utilization
      // This is a placeholder - in a real application, 
      // this might be calculated from time tracking or task assignment data
      const teamUtilization = '87%';
      
      return [
        { 
          title: 'Total Tasks', 
          value: (tasks?.length || 0).toString(), 
          change: '+2', 
          isPositive: true 
        },
        { 
          title: 'Tasks Completed', 
          value: tasksCompleted.toString(), 
          change: '+5', 
          isPositive: true 
        },
        { 
          title: 'Open Issues', 
          value: openIssues.toString(), 
          change: '-3', 
          isPositive: true 
        },
        { 
          title: 'Assets', 
          value: (assetsCount || 0).toString(), 
          change: '+2', 
          isPositive: true 
        }
      ];
    },
    enabled: !!projectId,
  });

  // Fetch quick links (documents, assets, etc. for current project)
  const { data: quickLinks, isLoading: linksLoading } = useQuery({
    queryKey: ['quickLinks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Get recent documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id, title')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(2);
      
      if (documentsError) {
        console.error('Error fetching quick link documents:', documentsError);
      }
      
      // Get recent assets
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('id, name')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(2);
      
      if (assetsError) {
        console.error('Error fetching quick link assets:', assetsError);
      }
      
      // Combine and return with appropriate icons
      const links = [
        ...(documents || []).map(doc => ({
          title: doc.title,
          icon: 'FileText',
          url: `/documents/${doc.id}`
        })),
        ...(assets || []).map(asset => ({
          title: asset.name,
          icon: 'Link',
          url: `/assets/${asset.id}`
        }))
      ];
      
      // Fill in with default links if we don't have enough
      const defaultLinks = [
        { title: 'All Tasks', icon: 'CheckCircle2', url: '/tasks' },
        { title: 'Team Members', icon: 'User', url: '/settings' }
      ];
      
      while (links.length < 4) {
        if (defaultLinks.length > 0) {
          links.push(defaultLinks.shift()!);
        } else {
          break;
        }
      }
      
      return links;
    },
    enabled: !!projectId,
  });

  // Create a new task
  const createTask = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      if (!projectId || !user?.id) {
        throw new Error('Project or user not available');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          project_id: projectId,
          created_by: user.id
        })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['priorityTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['activityFeed'] });
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Complete a task
  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'done' })
        .eq('id', taskId)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['priorityTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      
      toast({
        title: "Task completed",
        description: "Your task has been marked as complete",
      });
    },
    onError: (error) => {
      toast({
        title: "Error completing task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    priorityTasks,
    activityFeed,
    metrics,
    quickLinks,
    
    // Loading states
    isLoading: tasksLoading || activityLoading || metricsLoading || linksLoading,
    
    // Mutations
    createTask,
    completeTask
  };
}

// Helper function to format timestamps as "X time ago"
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'just now';
}
