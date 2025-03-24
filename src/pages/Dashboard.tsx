import React, { useState } from 'react';
import { 
  Bell, Calendar, Clock, LineChart, Users, 
  CheckCircle2, ArrowUpRight, Plus, MessageCircle,
  Filter, User, Link, FileText, Database
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
import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);
  const [selectedVertical, setSelectedVertical] = useState<VerticalType | null>(null);
  
  const { user } = useAuth();
  const { 
    priorityTasks, 
    activityFeed, 
    metrics, 
    quickLinks,
    isLoading,
    createTask,
    completeTask
  } = useDashboard();
  
  // Filter activity feed based on selections
  const filteredActivities = activityFeed?.filter(activity => {
    if (selectedActivityType && activity.type !== selectedActivityType) return false;
    if (selectedVertical && activity.vertical !== selectedVertical) return false;
    return true;
  }) || [];

  // Quick access tiles
  const quickAccess = [
    { title: 'New Task', icon: CheckCircle2, color: 'bg-blue-500', action: () => {} },
    { title: 'New Document', icon: FileText, color: 'bg-green-500', action: () => {} },
    { title: 'New Asset', icon: Database, color: 'bg-purple-500', action: () => {} },
    { title: 'Ask Foley', icon: MessageCircle, color: 'bg-amber-500', action: () => {} },
  ];

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium">{user?.profile?.first_name || 'User'}</span>! Here's an overview of your workspace.
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
          <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={item.action}>
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
            {isLoading ? (
              // Loading skeletons for metrics
              Array(4).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-12" />
                  </CardContent>
                </Card>
              ))
            ) : (
              metrics?.map((metric, index) => (
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
              ))
            )}
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
              {isLoading ? (
                // Loading skeletons for tasks
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {priorityTasks?.length ? (
                    priorityTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.title}</p>
                              {task.vertical && <VerticalTag vertical={task.vertical.type as VerticalType} />}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Due {task.dueDate}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => completeTask.mutate(task.id)}
                        >
                          {completeTask.isPending && task.id === completeTask.variables ? 'Completing...' : 'Complete'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No priority tasks found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links section */}
          <h2 className="text-lg font-medium mb-4 mt-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              // Loading skeletons for quick links
              Array(4).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Skeleton className="h-10 w-10 rounded-full mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              quickLinks?.map((link, index) => {
                let IconComponent = FileText;
                if (link.icon === 'LineChart') IconComponent = LineChart;
                if (link.icon === 'Calendar') IconComponent = Calendar;
                if (link.icon === 'Link') IconComponent = Link;
                if (link.icon === 'User') IconComponent = User;
                
                return (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="bg-accent p-3 rounded-full mb-2">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-medium">{link.title}</h3>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Activity feed and Calendar */}
        <div>
          {/* Mini Calendar */}
          <h2 className="text-lg font-medium mb-4">Upcoming Deadlines</h2>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Activity Feed</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSelectedActivityType(null)}
                  className={selectedActivityType === null ? 'bg-accent' : ''}
                >
                  All Activities
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedActivityType('task')}
                  className={selectedActivityType === 'task' ? 'bg-accent' : ''}
                >
                  Tasks
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedActivityType('document')}
                  className={selectedActivityType === 'document' ? 'bg-accent' : ''}
                >
                  Documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedActivityType('comment')}
                  className={selectedActivityType === 'comment' ? 'bg-accent' : ''}
                >
                  Comments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[420px]">
                {isLoading ? (
                  // Loading skeletons for activity feed
                  <div className="p-4 space-y-4">
                    {Array(5).fill(0).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredActivities.length ? (
                  <div className="p-4 space-y-4">
                    {filteredActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`rounded-full p-2 ${
                          activity.type === 'task' ? 'bg-blue-500/10 text-blue-500' :
                          activity.type === 'document' ? 'bg-green-500/10 text-green-500' :
                          activity.type === 'comment' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {activity.type === 'task' && <CheckCircle2 className="w-4 h-4" />}
                          {activity.type === 'document' && <FileText className="w-4 h-4" />}
                          {activity.type === 'comment' && <MessageCircle className="w-4 h-4" />}
                          {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{activity.message}</p>
                            {activity.vertical && <VerticalTag vertical={activity.vertical as VerticalType} />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{activity.time}</span>
                            <span>•</span>
                            <span>{activity.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-center text-muted-foreground">No activity found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
