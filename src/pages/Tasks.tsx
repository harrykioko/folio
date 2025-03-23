
import React, { useState } from 'react';
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
  Users 
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

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  tags: string[];
}

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  // Sample tasks data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Review Q4 marketing budget',
      description: 'Analyze campaign performance and adjust allocations',
      status: 'todo',
      priority: 'high',
      dueDate: '2023-09-15',
      assignee: 'Sarah Chen',
      tags: ['Finance', 'Marketing']
    },
    {
      id: '2',
      title: 'Finalize partnership agreement',
      description: 'Complete legal review and sign documents',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2023-09-20',
      assignee: 'Mark Johnson',
      tags: ['Legal', 'Partnership']
    },
    {
      id: '3',
      title: 'Prepare investor presentation',
      description: 'Create slides for upcoming funding round',
      status: 'review',
      priority: 'medium',
      dueDate: '2023-09-25',
      assignee: 'Emily Wong',
      tags: ['Finance', 'Presentation']
    },
    {
      id: '4',
      title: 'Update product roadmap',
      description: 'Incorporate feedback from customer interviews',
      status: 'done',
      priority: 'medium',
      dueDate: '2023-09-10',
      assignee: 'David Kim',
      tags: ['Product', 'Planning']
    },
    {
      id: '5',
      title: 'Redesign landing page',
      description: 'Implement new branding and improve conversion',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2023-09-30',
      assignee: 'Lisa Park',
      tags: ['Design', 'Marketing']
    },
    {
      id: '6',
      title: 'Fix authentication bug',
      description: 'Resolve issue with social login flows',
      status: 'review',
      priority: 'high',
      dueDate: '2023-09-12',
      assignee: 'Michael Rodriguez',
      tags: ['Engineering', 'Bug']
    },
    {
      id: '7',
      title: 'Analyze competitor offerings',
      description: 'Research features and pricing of main competitors',
      status: 'todo',
      priority: 'low',
      dueDate: '2023-09-28',
      assignee: 'Taylor Swift',
      tags: ['Research', 'Strategy']
    },
    {
      id: '8',
      title: 'Create onboarding sequence',
      description: 'Design and implement email flow for new users',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2023-09-22',
      assignee: 'John Lee',
      tags: ['Marketing', 'Email']
    }
  ];

  // Filter tasks by search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'all' || task.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    'todo': filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    'review': filteredTasks.filter(task => task.status === 'review'),
    'done': filteredTasks.filter(task => task.status === 'done')
  };

  // Helper function for priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

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
          <Button>
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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Marketing</DropdownMenuItem>
              <DropdownMenuItem>Engineering</DropdownMenuItem>
              <DropdownMenuItem>Design</DropdownMenuItem>
              <DropdownMenuItem>Finance</DropdownMenuItem>
              <DropdownMenuItem>Legal</DropdownMenuItem>
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
              {Array.from(new Set(tasks.map(task => task.assignee))).map(assignee => (
                <DropdownMenuItem key={assignee}>{assignee}</DropdownMenuItem>
              ))}
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
              
              {tasksByStatus['todo'].map(task => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              
              {tasksByStatus['in-progress'].map(task => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              
              {tasksByStatus['review'].map(task => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              
              {tasksByStatus['done'].map(task => (
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
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="w-full">
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-full ${getPriorityColor(task.priority)} mr-3`}></div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span>{task.assignee}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'review' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status === 'todo' ? 'To Do' :
                           task.status === 'in-progress' ? 'In Progress' :
                           task.status === 'review' ? 'Review' : 'Done'}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Change Priority
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="w-full">
          <div className="flex items-center justify-center h-96 bg-accent/50 rounded-lg">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Calendar View</h3>
              <p className="text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
