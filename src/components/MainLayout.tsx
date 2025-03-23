
import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderKanban, 
  Database, 
  CheckSquare, 
  BarChart3, 
  Bot, 
  Settings, 
  Search, 
  Command as CommandIcon, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Define sidebar navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Workspace', path: '/workspace', icon: FolderKanban },
    { name: 'Assets', path: '/assets', icon: Database },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];
  
  // Command palette destinations
  const commandDestinations = [
    ...navItems,
    { name: 'New Task', path: '/tasks/new', icon: CheckSquare },
    { name: 'New Document', path: '/workspace/new', icon: FolderKanban },
    { name: 'User Profile', path: '/profile', icon: Settings },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Handle keyboard shortcut for command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-card">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <span className="text-xl font-semibold">Folio</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md 
                    ${isActive(item.path) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  <item.icon 
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive(item.path) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`} 
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-border p-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <span className="flex items-center">
                <CommandIcon className="mr-2 h-4 w-4" />
                Command
              </span>
              <span className="text-xs text-muted-foreground">⌘K</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border w-full bg-background">
        <span className="text-xl font-semibold">Folio</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <CommandIcon className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background z-50 border-b border-border animate-fade-in">
          <nav className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md 
                  ${isActive(item.path) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon 
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive(item.path) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`} 
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Command Palette */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <DialogContent className="sm:max-w-[550px] p-0">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input 
                placeholder="Type a command or search..." 
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              <Command.Empty>No results found.</Command.Empty>
              
              <Command.Group heading="Pages">
                {navItems.map((item) => (
                  <Command.Item
                    key={item.path}
                    onSelect={() => {
                      window.location.href = item.path;
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
              
              <Command.Group heading="Actions">
                <Command.Item
                  onSelect={() => {
                    window.location.href = '/tasks/new';
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Create New Task</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    window.location.href = '/workspace/new';
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  <FolderKanban className="h-4 w-4" />
                  <span>Create New Document</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;
