import React, { useState } from 'react';
import { Bell, Calendar, ChevronRight, Clock, Folder, LineChart, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectCard from '@/components/ProjectCard';
import AssetCard from '@/components/AssetCard';

interface AssetCardProps {
  type: "domain" | "document" | "subscription" | "repository";
  title: string;
  description: string;
  date: string;
  status: "active" | "inactive" | "pending";
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Define the project data
  const projectsData = [
    {
      title: "Marketing Campaign",
      description: "Launch the summer marketing campaign to increase brand awareness.",
      progress: 60,
      dueDate: "July 20, 2024",
      members: 5,
      tasks: { completed: 8, total: 12 },
    },
    {
      title: "Product Development",
      description: "Develop new features for the Folio platform based on user feedback.",
      progress: 35,
      dueDate: "August 15, 2024",
      members: 8,
      tasks: { completed: 5, total: 15 },
    },
    {
      title: "Customer Onboarding",
      description: "Improve the customer onboarding process to reduce churn rate.",
      progress: 80,
      dueDate: "September 1, 2024",
      members: 3,
      tasks: { completed: 10, total: 10 },
    },
  ];

  // Define the assets data
  const assetsData = [
    {
      type: "domain" as const,
      title: "folio.dev",
      description: "Primary domain for Folio platform",
      date: "Renews in 304 days",
      status: "active" as const
    },
    {
      type: "document" as const,
      title: "Partnership Agreement",
      description: "Legal contract with API partners",
      date: "Updated 3 days ago",
      status: "active" as const
    },
    {
      type: "subscription" as const,
      title: "Supabase Enterprise",
      description: "Database and authentication platform",
      date: "Renews in 41 days",
      status: "active" as const
    },
    {
      type: "repository" as const,
      title: "folio-main",
      description: "Main repository for the Folio platform",
      date: "Updated today",
      status: "active" as const
    }
  ];

  return (
    <div className="container py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress, identify opportunities, and stay informed.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>This Week</span>
            <ChevronRight className="w-4 h-4 ml-2 opacity-70" />
          </Button>
          <Button size="sm">
            <Bell className="w-4 h-4 mr-2" />
            <span>Notifications</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Traffic</CardTitle>
              <CardDescription>Real-time data of website traffic and user engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart className="h-48 w-full" />
            </CardContent>
            <CardFooter>
              <Clock className="w-4 h-4 mr-2" />
              Updated 5 minutes ago
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Detailed analytics of user behavior and engagement metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-48 w-full" />
            </CardContent>
            <CardFooter>
              <Clock className="w-4 h-4 mr-2" />
              Updated 10 minutes ago
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetsData.map((asset, index) => (
              <AssetCard key={index} {...asset} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
