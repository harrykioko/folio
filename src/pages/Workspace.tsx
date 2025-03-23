
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import Header from '../components/Header';
import ProjectCard from '../components/ProjectCard';

export default function Workspace() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    // Simulate loading delay for animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Sample projects data
  const projects = [
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
    },
    {
      title: 'Mobile Application',
      description: 'Developing the iOS and Android companion app',
      progress: 60,
      dueDate: 'Dec 5, 2023',
      members: 5,
      tasks: { completed: 24, total: 36 }
    },
    {
      title: 'Documentation',
      description: 'Creating comprehensive user documentation and guides',
      progress: 90,
      dueDate: 'Oct 22, 2023',
      members: 2,
      tasks: { completed: 18, total: 20 }
    },
    {
      title: 'AI Integration',
      description: 'Adding intelligent features using OpenAI API',
      progress: 15,
      dueDate: 'Jan 15, 2024',
      members: 3,
      tasks: { completed: 3, total: 18 }
    }
  ];
  
  // Sort projects based on current sort order
  const sortedProjects = [...projects].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.progress - b.progress 
      : b.progress - a.progress;
  });
  
  // Animation classes
  const getAnimationClass = (index: number) => {
    return isLoaded 
      ? `opacity-100 translate-y-0 transition-all duration-500 delay-${index * 50}`
      : 'opacity-0 translate-y-8';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          {/* Header section */}
          <section className={`mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace</h1>
                <p className="text-muted-foreground">
                  Manage your active projects and collaborations.
                </p>
              </div>
              <button className="sm:self-start flex items-center space-x-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="h-5 w-5" />
                <span>New Project</span>
              </button>
            </div>
          </section>
          
          {/* Search and filters */}
          <section className={`mb-6 ${getAnimationClass(1)}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2.5 border border-input rounded-lg hover:bg-accent transition-colors">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <button 
                  className={`p-2.5 border rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-accent border-primary text-foreground' 
                      : 'border-input hover:bg-accent text-muted-foreground'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-5 w-5" />
                </button>
                
                <button 
                  className={`p-2.5 border rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-accent border-primary text-foreground' 
                      : 'border-input hover:bg-accent text-muted-foreground'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-5 w-5" />
                </button>
                
                <button 
                  className="p-2.5 border border-input rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' 
                    ? <SortAsc className="h-5 w-5 text-muted-foreground" />
                    : <SortDesc className="h-5 w-5 text-muted-foreground" />
                  }
                </button>
              </div>
            </div>
          </section>
          
          {/* Projects grid */}
          <section>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedProjects.map((project, index) => (
                  <div key={index} className={getAnimationClass(index + 2)}>
                    <ProjectCard {...project} />
                  </div>
                ))}
                
                {/* Add project card */}
                <div className={getAnimationClass(sortedProjects.length + 2)}>
                  <div className="bg-card rounded-xl border border-dashed border-border h-full flex flex-col items-center justify-center p-6 transition-all duration-300 hover:border-muted-foreground hover:bg-accent/50 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Add New Project</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProjects.map((project, index) => (
                  <div 
                    key={index} 
                    className={`bg-card rounded-xl border border-border p-4 transition-all hover:shadow-sm ${getAnimationClass(index + 2)}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Progress</div>
                          <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                project.progress >= 75 ? 'bg-green-500' :
                                project.progress >= 50 ? 'bg-blue-500' :
                                project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                          <div className="text-sm font-medium">{project.dueDate}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Tasks</div>
                          <div className="text-sm font-medium">
                            {project.tasks.completed}/{project.tasks.total}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add project in list view */}
                <div className={getAnimationClass(sortedProjects.length + 2)}>
                  <div className="bg-card rounded-xl border border-dashed border-border p-4 flex items-center justify-center h-16 transition-all duration-300 hover:border-muted-foreground hover:bg-accent/50 cursor-pointer">
                    <Plus className="h-5 w-5 mr-2 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Add New Project</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
