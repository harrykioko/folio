
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CommandIcon } from 'lucide-react';

import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileMenu from './MobileMenu';
import CommandPalette from './CommandPalette';
import { navItems, commandDestinations } from '@/config/navigation';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
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
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
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
