
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '@/types/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navItems: NavItem[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, setIsOpen, navItems }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  if (!isOpen) return null;
  
  return (
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
            onClick={() => setIsOpen(false)}
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
  );
};

export default MobileMenu;
