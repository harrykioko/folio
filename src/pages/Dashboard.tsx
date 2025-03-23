
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Clock, Filter, Users, BarChart, CalendarDays } from 'lucide-react';
import Header from '../components/Header';
import AssetCard from '../components/AssetCard';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading delay for animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Sample data for dashboard
  const recentAssets = [
    {
      type: 'domain',
      title: 'folio.app',
      description: 'Main application domain with premium DNS services',
      date: 'Expires in 10 months',
      status: 'active' as const
    },
    {
      type: 'subscription',
      title: 'OpenAI API',
      description: 'AI integration for content generation and analysis',
      date: 'Renews in 15 days',
      status: 'active' as const
    },
    {
      type: 'document',
      title: 'Business Plan 2023',
      description: 'Strategic roadmap and financial projections',
      date: 'Updated 3 days ago',
      status: 'active' as const
    },
    {
      type: 'repository',
      title: 'folio-frontend',
      description: 'React frontend repository for the main application',
      date: 'Last commit: 1 day ago',
      status: 'active' as const
    }
  ];
  
  const activeProjects = [
    {
      title: 'Dashboard Redesign',
      description: 'Improving user experience and adding new analytics features',
      progress: 75,
      dueDate: 'Oct 15, 2023',
      members: 4,
      tasks: { completed: 16, total: 20 }
    },
    {
      title: 'API Integration',
      description: 'Connecting with payment gateways and external services',
      progress: 45,
      dueDate: 'Nov 3, 2023',
      members: 2,
      tasks: { completed: 7, total: 12 }
    },
    {
      title: 'Marketing Website',
      description: 'Creating new landing pages for product launch',
      progress: 30,
      dueDate: 'Nov 10, 2023',
      members: 3,
      tasks: { completed: 5, total: 14 }
    }
  ];
  
  // Card animation classes based on loading state
  const getAnimationClass = (index: number) => {
    return isLoaded 
      ? `opacity-100 translate-y-0 transition-all duration-500 delay-${index * 100}`
      : 'opacity-0 translate-y-8';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          {/* Welcome section */}
          <section className={`mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Alex</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your projects and assets today.
            </p>
          </section>
          
          {/* Quick stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Projects', value: '8', icon: <Users className="h-5 w-5" />, change: '+2' },
              { label: 'Total Assets', value: '136', icon: <Filter className="h-5 w-5" />, change: '+12' },
              { label: 'Upcoming Renewals', value: '4', icon: <Clock className="h-5 w-5" />, change: '-1' },
              { label: 'Monthly Spending', value: '$4,250', icon: <BarChart className="h-5 w-5" />, change: '+$420' }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`bg-card rounded-xl p-5 border border-border ${getAnimationClass(index)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 rounded-md bg-accent text-foreground">
                    {stat.icon}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
            ))}
          </section>
          
          {/* Recent assets */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Recent Assets</h2>
              <Link to="/assets" className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors">
                <span>View all</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentAssets.map((asset, index) => (
                <div key={index} className={getAnimationClass(index + 4)}>
                  <AssetCard {...asset} />
                </div>
              ))}
            </div>
          </section>
          
          {/* Active projects */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              <Link to="/workspace" className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors">
                <span>View all</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeProjects.map((project, index) => (
                <div key={index} className={getAnimationClass(index + 8)}>
                  <ProjectCard {...project} />
                </div>
              ))}
              
              {/* Add project card */}
              <div className={getAnimationClass(11)}>
                <div className="bg-card rounded-xl border border-dashed border-border h-full flex flex-col items-center justify-center p-6 transition-all duration-300 hover:border-muted-foreground hover:bg-accent/50 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Add New Project</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Calendar & Upcoming */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar panel */}
            <div className={`lg:col-span-2 bg-card rounded-xl border border-border p-5 ${getAnimationClass(12)}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Calendar</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>October 2023</span>
                </div>
              </div>
              
              {/* Simple calendar placeholder - would be replaced with actual calendar component */}
              <div className="bg-accent/50 h-72 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Calendar component will be integrated here</p>
              </div>
            </div>
            
            {/* Upcoming events */}
            <div className={`bg-card rounded-xl border border-border p-5 ${getAnimationClass(13)}`}>
              <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Team Meeting', type: 'Meeting', time: 'Today, 2:00 PM', indicator: 'bg-blue-500' },
                  { title: 'Cloudflare Renewal', type: 'Subscription', time: 'Tomorrow', indicator: 'bg-yellow-500' },
                  { title: 'Project Deadline', type: 'Deadline', time: 'Oct 15, 2023', indicator: 'bg-red-500' },
                  { title: 'Quarterly Review', type: 'Meeting', time: 'Oct 30, 2023', indicator: 'bg-purple-500' }
                ].map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${event.indicator}`} />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span className="border border-border rounded-full px-2 py-0.5 mr-2">
                          {event.type}
                        </span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg p-2 flex items-center justify-center transition-colors hover:bg-accent">
                <Plus className="mr-1 h-4 w-4" />
                <span>Add Event</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
