
import React from 'react';
import { 
  Bell, Calendar, Clock, LineChart, Users, 
  CheckCircle2, ArrowUpRight, Plus, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  // Sample activity feed data
  const activityFeed = [
    { id: 1, type: 'task', message: 'Marketing campaign assets ready for review', time: '10 minutes ago', user: 'Sarah Chen' },
    { id: 2, type: 'document', message: 'Q3 Financial Report updated', time: '1 hour ago', user: 'Mark Johnson' },
    { id: 3, type: 'comment', message: 'New comment on Product Roadmap', time: '3 hours ago', user: 'Emily Wong' },
    { id: 4, type: 'meeting', message: 'Team Sync scheduled for tomorrow', time: '5 hours ago', user: 'System' },
  ];

  // Sample priority tasks
  const priorityTasks = [
    { id: 1, title: 'Review Q4 marketing budget', dueDate: 'Today', priority: 'high' },
    { id: 2, title: 'Finalize partnership agreement', dueDate: 'Tomorrow', priority: 'high' },
    { id: 3, title: 'Prepare for investor meeting', dueDate: 'Sep 15', priority: 'medium' },
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

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your workspace.
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
        {/* Metrics section */}
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
                        <p className="font-medium">{task.title}</p>
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
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Activity Feed</CardTitle>
              <CardDescription>Recent updates across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      {activity.type === 'task' && <CheckCircle2 className="w-4 h-4" />}
                      {activity.type === 'document' && <Calendar className="w-4 h-4" />}
                      {activity.type === 'comment' && <MessageCircle className="w-4 h-4" />}
                      {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>: {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
