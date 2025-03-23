
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CommandIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavItem, SidebarState } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  navItems: NavItem[];
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, setIsCommandPaletteOpen }) => {
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    expanded: true
  });
  
  // Check for saved sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState) {
      setSidebarState(JSON.parse(savedState));
    }
  }, []);
  
  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-state', JSON.stringify(sidebarState));
  }, [sidebarState]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleSidebar = () => {
    setSidebarState(prev => ({ expanded: !prev.expanded }));
  };
  
  return (
    <div 
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-20 transition-all duration-300 ease-in-out",
        sidebarState.expanded ? "md:w-64" : "md:w-20"
      )}
    >
      <div className="flex-1 flex flex-col min-h-0 backdrop-blur-md bg-card/80 border-r border-border/60 shadow-lg">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className={cn(
            "flex items-center flex-shrink-0 px-4 mb-5",
            sidebarState.expanded ? "justify-between" : "justify-center"
          )}>
            {sidebarState.expanded && <span className="text-xl font-semibold">Folio</span>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarState.expanded ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  sidebarState.expanded ? "justify-start" : "justify-center",
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary backdrop-blur-sm" 
                    : "text-muted-foreground hover:bg-accent/40 hover:backdrop-blur-sm hover:text-foreground"
                )}
                title={!sidebarState.expanded ? item.name : undefined}
              >
                <item.icon 
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    sidebarState.expanded ? "mr-3" : "mr-0",
                    isActive(item.path) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {sidebarState.expanded && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border/60 p-4">
          <Button 
            variant="outline" 
            className={cn(
              "flex items-center backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all",
              sidebarState.expanded ? "w-full justify-between" : "w-full justify-center"
            )}
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <span className="flex items-center">
              <CommandIcon className={cn(
                "h-4 w-4",
                sidebarState.expanded ? "mr-2" : "mr-0"
              )} />
              {sidebarState.expanded && "Command"}
            </span>
            {sidebarState.expanded && <span className="text-xs text-muted-foreground">⌘K</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
