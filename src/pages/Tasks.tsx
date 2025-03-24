import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Filter, 
  Flag, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Tag, 
  Users,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useTasks, Task } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useProjects } from '@/hooks/use-projects';

interface TaskWithAssigneeAndTags extends Task {
  assigned_to?: {
    first_name: string;
    last_name: string;
  };
  tags?: string[];
}

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const { 
    tasks, 
    isLoading, 
    error, 
    createTask, 
    updateTask
  } = useTasks();
  const { toast } = useToast();
  const { currentProject } = useProjects();

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter tasks by search term and status
  const filteredTasks = tasks ? tasks.filter((task: TaskWithAssigneeAndTags) => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'all' || task.status === activeStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    'todo': filteredTasks.filter((task: TaskWithAssigneeAndTags) => task.status === 'todo'),
    'in-progress': filteredTasks.filter((task: TaskWithAssigneeAndTags) => task.status === 'in_progress'),
    'review': filteredTasks.filter((task: TaskWithAssigneeAndTags) => task.status === 'review'),
    'done': filteredTasks.filter((task: TaskWithAssigneeAndTags) => task.status === 'done')
  };

  // Helper function for priority color
  const getPriorityColor = (priority: string | null) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  // Get assignee name
  const getAssigneeName = (task: TaskWithAssigneeAndTags) => {
    if (!task.assigned_to) return 'Unassigned';
    return `${task.assigned_to.first_name} ${task.assigned_to.last_name}`;
  };

  // Handle new task creation (simplified for now)
  const handleCreateTask = () => {
    createTask(
      "New Task", 
      "Add description here", 
      undefined, 
      'medium', 
      'todo', 
      undefined, 
      []
    ).then(() => {
      toast({
        title: "Task created",
        description: "A new task has been created successfully.",
      });
    }).catch(error => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    });
  };

  // Handle status change (drag and drop would be implemented later)
  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
    updateTask(taskId, { status: newStatus })
      .then(() => {
        toast({
          title: "Task updated",
          description: "Task status has been updated successfully.",
        });
      })
      .catch(error => {
        toast({
          title: "Error updating task",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28 mt-4 md:mt-0" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              <Skeleton className="h-6 w-40 mb-4" />
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <Skeleton key={cardIndex} className="h-48 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Task Board</h1>
          <p className="text-muted-foreground">
            Organize and track your team's work
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button onClick={handleCreateTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveStatus('all')}>
            <Filter className="h-4 w-4 mr-2" />
            {activeStatus === 'all' ? 'All Tasks' : 'Filter'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Dynamic tags from tasks */}
              {Array.from(new Set(tasks?.flatMap((task: TaskWithAssigneeAndTags) => task.tags || []) || []))
                .filter(Boolean)
                .map(tag => (
                  <DropdownMenuItem key={tag}>{tag}</DropdownMenuItem>
                ))}
              {(!tasks || tasks.length === 0) && <DropdownMenuItem>No tags found</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assignee
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {tasks && tasks.length > 0 ? (
                Array.from(new Set(tasks
                  .filter((task: TaskWithAssigneeAndTags) => task.assigned_to)
                  .map((task: TaskWithAssigneeAndTags) => `${task.assigned_to.first_name} ${task.assigned_to.last_name}`)))
                  .map(assignee => (
                    <DropdownMenuItem key={assignee}>{assignee}</DropdownMenuItem>
                  ))
              ) : (
                <DropdownMenuItem>No assignees found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* To Do Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                  To Do
                  <span className="ml-2 text-xs text-muted-foreground">({tasksByStatus['todo'].length})</span>
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tasksByStatus['todo'].length > 0 ? (
                tasksByStatus['todo'].map((task: TaskWithAssigneeAndTags) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(task.tags || []).map(tag => (
                          <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        <span>{getAssigneeName(task)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks to show
                </div>
              )}
            </div>

            {/* In Progress Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  In Progress
                  <span className="ml-2 text-xs text-muted-foreground">({tasksByStatus['in-progress'].length})</span>
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tasksByStatus['in-progress'].length > 0 ? (
                tasksByStatus['in-progress'].map((task: TaskWithAssigneeAndTags) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(task.tags || []).map(tag => (
                          <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        <span>{getAssigneeName(task)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks to show
                </div>
              )}
            </div>

            {/* Review Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                  Review
                  <span className="ml-2 text-xs text-muted-foreground">({tasksByStatus['review'].length})</span>
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tasksByStatus['review'].length > 0 ? (
                tasksByStatus['review'].map((task: TaskWithAssigneeAndTags) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(task.tags || []).map(tag => (
                          <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        <span>{getAssigneeName(task)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks to show
                </div>
              )}
            </div>

            {/* Done Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Done
                  <span className="ml-2 text-xs text-muted-foreground">({tasksByStatus['done'].length})</span>
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tasksByStatus['done'].length > 0 ? (
                tasksByStatus['done'].map((task: TaskWithAssigneeAndTags) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow opacity-80">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {task.title}
                        </h4>
                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(task.tags || []).map(tag => (
                          <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        <span>{getAssigneeName(task)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks to show
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          {/* List View implementation */}
          <div className="rounded-md border">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task: TaskWithAssigneeAndTags, index) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 ${
                    index !== filteredTasks.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span className="flex items-center mr-3">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(task.due_date)}
                        </span>
                        <span className="flex items-center mr-3">
                          <Users className="h-3 w-3 mr-1" />
                          {getAssigneeName(task)}
                        </span>
                        <span className="capitalize">
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        // Would typically open a detail/edit modal
                        toast({
                          title: "Action",
                          description: `Viewing task details for ${task.title}`,
                        });
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'todo')}>
                          Mark as Todo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'review')}>
                          Mark as Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'done')}>
                          Mark as Done
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No tasks match your filter criteria
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="border rounded-md p-6 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-1">Calendar View Coming Soon</h3>
            <p>This feature is currently under development.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
