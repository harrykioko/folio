
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, CommandIcon } from 'lucide-react';

interface MobileHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  return (
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
  );
};

export default MobileHeader;
