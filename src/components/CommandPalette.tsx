
import React from 'react';
import { Command } from 'cmdk';
import { Search, CheckSquare, FolderKanban } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type CommandDestination = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  commandDestinations: CommandDestination[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  setIsOpen,
  commandDestinations
}) => {
  const navItems = commandDestinations.filter(item => 
    !['New Task', 'New Document', 'User Profile'].includes(item.name)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 glass-panel border-none shadow-lg">
        <Command className="rounded-lg backdrop-blur-xl bg-background/40 border-none">
          <div className="flex items-center border-b px-3 border-border/20">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input 
              placeholder="Type a command or search..." 
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty>No results found.</Command.Empty>
            
            <Command.Group heading="Pages" className="px-2 py-1.5">
              {navItems.map((item) => (
                <Command.Item
                  key={item.path}
                  onSelect={() => {
                    window.location.href = item.path;
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
            
            <Command.Group heading="Actions" className="px-2 py-1.5">
              <Command.Item
                onSelect={() => {
                  window.location.href = '/tasks/new';
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Create New Task</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  window.location.href = '/workspace/new';
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
              >
                <FolderKanban className="h-4 w-4" />
                <span>Create New Document</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
