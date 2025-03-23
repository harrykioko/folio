
import React from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  // Sample portfolio data
  const portfolioItems = [
    {
      id: 1,
      name: 'Marketing Platform',
      description: 'Automated campaign management and analytics',
      status: 'healthy',
      progress: 78,
      activeUsers: 342,
      growth: '+12%',
      nextMilestone: 'Feature Release',
      daysToMilestone: 12
    },
    {
      id: 2,
      name: 'Customer Portal',
      description: 'Self-service dashboard for clients',
      status: 'warning',
      progress: 45,
      activeUsers: 1205,
      growth: '+5%',
      nextMilestone: 'Beta Launch',
      daysToMilestone: 30
    },
    {
      id: 3,
      name: 'Analytics Engine',
      description: 'Real-time data processing and visualization',
      status: 'healthy',
      progress: 92,
      activeUsers: 87,
      growth: '+18%',
      nextMilestone: 'V2 Release',
      daysToMilestone: 5
    },
    {
      id: 4,
      name: 'Internal Tools',
      description: 'Employee productivity suite',
      status: 'critical',
      progress: 33,
      activeUsers: 56,
      growth: '-2%',
      nextMilestone: 'Infrastructure Upgrade',
      daysToMilestone: 2
    },
    {
      id: 5,
      name: 'Mobile Application',
      description: 'iOS and Android client app',
      status: 'healthy',
      progress: 67,
      activeUsers: 2730,
      growth: '+22%',
      nextMilestone: 'App Store Submission',
      daysToMilestone: 8
    },
    {
      id: 6,
      name: 'Integration APIs',
      description: 'Third-party connection services',
      status: 'warning',
      progress: 51,
      activeUsers: 138,
      growth: '+7%',
      nextMilestone: 'Documentation Update',
      daysToMilestone: 15
    }
  ];

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  // Helper for growth indicator color
  const getGrowthColor = (growth: string) => {
    return growth.startsWith('+') ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio Overview</h1>
          <p className="text-muted-foreground">
            Track progress and performance across all products
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            Filter
          </Button>
          <Button>
            Add Product
          </Button>
        </div>
      </div>

      {/* Portfolio metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">6</div>
            <p className="text-sm text-muted-foreground">Active Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">4,558</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <div className="text-xs mt-1 flex items-center text-green-500">
              +345 this month
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">78%</div>
            <p className="text-sm text-muted-foreground">Avg. Health Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Upcoming Milestones</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(item.status)}`}></div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStatusColor(item.status)}`} 
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Active Users</div>
                    <div className="font-medium">{item.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Growth</div>
                    <div className={`font-medium flex items-center ${getGrowthColor(item.growth)}`}>
                      {item.growth}
                      {item.growth.startsWith('+') ? (
                        <TrendingUp className="ml-1 w-3 h-3" />
                      ) : (
                        <TrendingUp className="ml-1 w-3 h-3 transform rotate-180" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{item.nextMilestone} in {item.daysToMilestone} days</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  Details
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
