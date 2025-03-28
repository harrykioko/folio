
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CommandIcon } from 'lucide-react';

import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileMenu from './MobileMenu';
import CommandPalette from './CommandPalette';
import { navItems, commandDestinations } from '@/config/navigation';
import { Button } from './ui/button';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  
  // Handle keyboard shortcut for command palette
  useEffect(() => {
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
      <Sidebar 
        navItems={navItems} 
        setIsCommandPaletteOpen={setIsCommandPaletteOpen} 
      />
      
      {/* Mobile header */}
      <MobileHeader 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        navItems={navItems} 
      />
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <main className="flex-1 overflow-y-auto pt-20 md:pt-6">
          <div className="container px-4 md:px-6">
            {/* Global search button (visible on mobile) */}
            <div className="md:hidden flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => setIsCommandPaletteOpen(true)}
              >
                <CommandIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        setIsOpen={setIsCommandPaletteOpen} 
        commandDestinations={commandDestinations} 
      />
    </div>
  );
};

export default MainLayout;
