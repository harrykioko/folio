
import React, { useState } from 'react';
import { 
  Bell, Calendar, Clock, LineChart, Users, 
  CheckCircle2, ArrowUpRight, Plus, MessageCircle,
  Filter, User, Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VerticalTag, { VerticalType } from '@/components/VerticalTag';

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);
  const [selectedVertical, setSelectedVertical] = useState<VerticalType | null>(null);
  
  // Sample user info
  const user = {
    name: 'Alex Johnson',
    role: 'Product Manager',
  };

  // Sample activity feed data
  const activityFeed = [
    { id: 1, type: 'task', message: 'Marketing campaign assets ready for review', time: '10 minutes ago', user: 'Sarah Chen', vertical: 'marketing' as VerticalType },
    { id: 2, type: 'document', message: 'Q3 Financial Report updated', time: '1 hour ago', user: 'Mark Johnson', vertical: 'finance' as VerticalType },
    { id: 3, type: 'comment', message: 'New comment on Product Roadmap', time: '3 hours ago', user: 'Emily Wong', vertical: 'product' as VerticalType },
    { id: 4, type: 'meeting', message: 'Team Sync scheduled for tomorrow', time: '5 hours ago', user: 'System', vertical: 'development' as VerticalType },
  ];

  // Sample priority tasks with added vertical info
  const priorityTasks = [
    { id: 1, title: 'Review Q4 marketing budget', dueDate: 'Today', priority: 'high', vertical: 'marketing' as VerticalType },
    { id: 2, title: 'Finalize partnership agreement', dueDate: 'Tomorrow', priority: 'high', vertical: 'finance' as VerticalType },
    { id: 3, title: 'Prepare for investor meeting', dueDate: 'Sep 15', priority: 'medium', vertical: 'finance' as VerticalType },
    { id: 4, title: 'Review product prototype', dueDate: 'Sep 18', priority: 'medium', vertical: 'product' as VerticalType },
  ];

  // Sample quick links
  const quickLinks = [
    { title: 'Product Roadmap', icon: LineChart, url: '/workspace' },
    { title: 'Marketing Calendar', icon: Calendar, url: '/workspace' },
    { title: 'Design Assets', icon: Link, url: '/assets' },
    { title: 'Team Directory', icon: User, url: '/settings' },
  ];

  // Sample metrics data
  const metrics = [
    { title: 'Active Projects', value: '12', change: '+2', isPositive: true },
    { title: 'Tasks Completed', value: '48', change: '+5', isPositive: true },
    { title: 'Open Issues', value: '8', change: '-3', isPositive: true },
    { title: 'Team Utilization', value: '87%', change: '+2%', isPositive: true },
  ];

  // Quick access tiles
  const quickAccess = [
    { title: 'New Task', icon: CheckCircle2, color: 'bg-blue-500' },
    { title: 'New Document', icon: Calendar, color: 'bg-green-500' },
    { title: 'Schedule Meeting', icon: Users, color: 'bg-purple-500' },
    { title: 'Ask Assistant', icon: MessageCircle, color: 'bg-amber-500' },
  ];

  // Filter activity feed based on selections
  const filteredActivities = activityFeed.filter(activity => {
    if (selectedActivityType && activity.type !== selectedActivityType) return false;
    if (selectedVertical && activity.vertical !== selectedVertical) return false;
    return true;
  });

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium">{user.name}</span>! Here's an overview of your workspace.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="mr-2">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Today</span>
          </Button>
          <Button size="sm">
            <Bell className="w-4 h-4 mr-2" />
            <span>Notifications</span>
          </Button>
        </div>
      </div>

      {/* Quick access section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickAccess.map((item, index) => (
          <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className={`${item.color} text-white p-2 rounded-lg mr-4`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metrics and Priority Tasks */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <div className={`text-xs mt-1 flex items-center ${
                    metric.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change}
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Priority tasks */}
          <h2 className="text-lg font-medium mb-4">Priority Tasks</h2>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md">Tasks Requiring Attention</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{task.title}</p>
                          <VerticalTag vertical={task.vertical} />
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Due {task.dueDate}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links section - NEW */}
          <h2 className="text-lg font-medium mb-4 mt-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-accent p-3 rounded-full mb-2">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium">{link.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column: Activity feed and Calendar */}
        <div>
          {/* Mini Calendar - NEW */}
          <h2 className="text-lg font-medium mb-4">Upcoming Deadlines</h2>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>
          
          {/* Activity feed with filtering */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedActivityType(null)}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedActivityType('task')}>
                  Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedActivityType('document')}>
                  Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedActivityType('comment')}>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedActivityType('meeting')}>
                  Meetings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge 
              variant={selectedVertical === null ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedVertical(null)}
            >
              All Verticals
            </Badge>
            <Badge 
              variant={selectedVertical === 'marketing' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedVertical('marketing')}
            >
              Marketing
            </Badge>
            <Badge 
              variant={selectedVertical === 'product' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedVertical('product')}
            >
              Product
            </Badge>
            <Badge 
              variant={selectedVertical === 'finance' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedVertical('finance')}
            >
              Finance
            </Badge>
            <Badge 
              variant={selectedVertical === 'development' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedVertical('development')}
            >
              Development
            </Badge>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Activity Feed</CardTitle>
              <CardDescription>Recent updates across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          {activity.type === 'task' && <CheckCircle2 className="w-4 h-4" />}
                          {activity.type === 'document' && <Calendar className="w-4 h-4" />}
                          {activity.type === 'comment' && <MessageCircle className="w-4 h-4" />}
                          {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium">{activity.user}</span>
                            <VerticalTag vertical={activity.vertical} />
                          </div>
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No activities match your filter criteria
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
