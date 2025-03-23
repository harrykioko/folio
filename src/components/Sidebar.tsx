
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CommandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types/navigation';

interface SidebarProps {
  navItems: NavItem[];
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, setIsCommandPaletteOpen }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
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
  );
};

export default Sidebar;
