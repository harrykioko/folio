
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Search, 
  FileText, 
  CheckSquare, 
  Database, 
  Briefcase, 
  Users,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Badge } from '@/components/ui/badge';

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

// Map for category icons
const categoryIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  asset: <Database className="h-4 w-4" />,
  project: <Briefcase className="h-4 w-4" />,
  person: <Users className="h-4 w-4" />
};

// Map for category titles
const categoryTitles: Record<string, string> = {
  document: 'Documents',
  task: 'Tasks',
  asset: 'Assets',
  project: 'Projects',
  person: 'People'
};

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  setIsOpen,
  commandDestinations
}) => {
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    groupedResults, 
    isLoading 
  } = useGlobalSearch();
  
  const navItems = commandDestinations.filter(item => 
    !['New Task', 'New Document', 'User Profile'].includes(item.name)
  );

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, setSearchQuery]);

  const handleNavigate = (url: string) => {
    navigate(url);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 glass-command border-none shadow-lg">
        <Command className="rounded-lg backdrop-blur-xl bg-background/40 border-none">
          <div className="flex items-center border-b px-3 border-border/20">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input 
              placeholder="Search for documents, tasks, assets, projects, or people..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2 opacity-70" />}
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            {searchQuery === '' ? (
              <>
                <Command.Group heading="Pages" className="px-2 py-1.5">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.path}
                      onSelect={() => handleNavigate(item.path)}
                      className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                
                <Command.Group heading="Actions" className="px-2 py-1.5">
                  <Command.Item
                    onSelect={() => handleNavigate('/tasks/new')}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Create New Task</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleNavigate('/workspace/new')}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Create New Document</span>
                  </Command.Item>
                </Command.Group>
              </>
            ) : (
              <>
                <Command.Empty>
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm text-muted-foreground">No results found.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for something else.</p>
                  </div>
                </Command.Empty>
                
                {Object.keys(groupedResults).map((category) => (
                  <Command.Group 
                    key={category} 
                    heading={categoryTitles[category] || category}
                    className="px-2 py-1.5"
                  >
                    {groupedResults[category].map((result) => (
                      <Command.Item
                        key={result.id}
                        onSelect={() => handleNavigate(result.url)}
                        className="flex items-start gap-2 px-2 py-2 rounded-md text-sm hover:bg-primary/10 aria-selected:bg-primary/10"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="mt-0.5">
                            {categoryIcons[category]}
                          </div>
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{result.title}</span>
                              <ArrowRight className="h-3 w-3 opacity-50" />
                            </div>
                            {result.description && (
                              <span className="text-xs text-muted-foreground">{result.description}</span>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {result.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="px-1 py-0 text-[10px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
                
                {Object.keys(groupedResults).length > 0 && (
                  <div className="px-4 py-2 text-xs text-center text-muted-foreground border-t border-border/20 mt-2">
                    Press <kbd className="px-1 bg-muted rounded">Enter</kbd> to navigate to the selected result
                  </div>
                )}
              </>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
