
import React, { useState } from 'react';
import { 
  Clock, 
  Edit3, 
  File, 
  FileText, 
  Filter, 
  FolderKanban, 
  Grid, 
  Image as ImageIcon, 
  List, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Share2, 
  Star, 
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Document {
  id: string;
  title: string;
  type: 'doc' | 'spreadsheet' | 'presentation' | 'image' | 'folder';
  lastEdited: string;
  collaborators: number;
  isFavorite: boolean;
  tags?: string[];
}

const Workspace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  
  // Sample documents data
  const documents: Document[] = [
    {
      id: '1',
      title: 'Q3 Marketing Strategy',
      type: 'doc',
      lastEdited: '2 hours ago',
      collaborators: 5,
      isFavorite: true,
      tags: ['Marketing', 'Strategy']
    },
    {
      id: '2',
      title: 'Product Roadmap 2023-2024',
      type: 'spreadsheet',
      lastEdited: '1 day ago',
      collaborators: 8,
      isFavorite: true,
      tags: ['Product', 'Planning']
    },
    {
      id: '3',
      title: 'Investor Presentation',
      type: 'presentation',
      lastEdited: '3 days ago',
      collaborators: 3,
      isFavorite: false,
      tags: ['Finance', 'Presentation']
    },
    {
      id: '4',
      title: 'Brand Guidelines',
      type: 'doc',
      lastEdited: '1 week ago',
      collaborators: 2,
      isFavorite: false,
      tags: ['Design', 'Brand']
    },
    {
      id: '5',
      title: 'Project Timeline',
      type: 'spreadsheet',
      lastEdited: '5 days ago',
      collaborators: 6,
      isFavorite: true,
      tags: ['Project', 'Planning']
    },
    {
      id: '6',
      title: 'Team Meeting Notes',
      type: 'doc',
      lastEdited: '2 days ago',
      collaborators: 10,
      isFavorite: false,
      tags: ['Team', 'Meeting']
    },
    {
      id: '7',
      title: 'Competitive Analysis',
      type: 'spreadsheet',
      lastEdited: '4 days ago',
      collaborators: 4,
      isFavorite: false,
      tags: ['Research', 'Strategy']
    },
    {
      id: '8',
      title: 'Website Mockups',
      type: 'image',
      lastEdited: '6 days ago',
      collaborators: 3,
      isFavorite: true,
      tags: ['Design', 'Website']
    },
    {
      id: '9',
      title: 'Design Assets',
      type: 'folder',
      lastEdited: '1 week ago',
      collaborators: 5,
      isFavorite: false,
      tags: ['Design', 'Assets']
    },
  ];

  // Filter documents based on search term and active tab
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'recent') return matchesSearch;
    if (activeTab === 'starred') return matchesSearch && doc.isFavorite;
    if (activeTab === 'docs') return matchesSearch && doc.type === 'doc';
    if (activeTab === 'spreadsheets') return matchesSearch && doc.type === 'spreadsheet';
    
    return matchesSearch;
  });

  // Helper to get icon by document type
  const getDocumentIcon = (type: Document['type']) => {
    switch(type) {
      case 'doc': return <FileText className="h-5 w-5" />;
      case 'spreadsheet': return <Grid className="h-5 w-5" />;
      case 'presentation': return <List className="h-5 w-5" />;
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'folder': return <FolderKanban className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="container px-4 md:px-6 h-[calc(100vh-7rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Workspace Hub</h1>
          <p className="text-muted-foreground">
            Create, collaborate, and manage your documents
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        {/* Navigation sidebar */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={30}>
          <div className="h-full p-4 flex flex-col">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Workspaces</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Personal
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Team
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Projects
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Workspace
                </Button>
              </div>
            </div>
            
            <h3 className="text-sm font-medium mb-2">Views</h3>
            <div className="space-y-1">
              <Button 
                variant={activeTab === 'recent' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('recent')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Recent
              </Button>
              <Button 
                variant={activeTab === 'starred' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('starred')}
              >
                <Star className="mr-2 h-4 w-4" />
                Starred
              </Button>
              <Button 
                variant={activeTab === 'shared' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('shared')}
              >
                <Users className="mr-2 h-4 w-4" />
                Shared with me
              </Button>
              <Button 
                variant={activeTab === 'docs' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('docs')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Documents
              </Button>
              <Button 
                variant={activeTab === 'spreadsheets' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('spreadsheets')}
              >
                <Grid className="mr-2 h-4 w-4" />
                Spreadsheets
              </Button>
            </div>
            
            <div className="mt-auto pt-6">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Content area */}
        <ResizablePanel defaultSize={75}>
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-medium capitalize">
                {activeTab === 'recent' ? 'Recent Documents' :
                 activeTab === 'starred' ? 'Starred Documents' :
                 activeTab === 'shared' ? 'Shared with Me' :
                 activeTab === 'docs' ? 'Documents' :
                 activeTab === 'spreadsheets' ? 'Spreadsheets' : 'All Documents'}
              </h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        {/* Document preview area */}
                        <div className={`h-32 ${
                          doc.type === 'doc' ? 'bg-blue-50' :
                          doc.type === 'spreadsheet' ? 'bg-green-50' :
                          doc.type === 'presentation' ? 'bg-amber-50' :
                          doc.type === 'image' ? 'bg-purple-50' :
                          'bg-gray-50'
                        } flex items-center justify-center`}>
                          <div className={`w-16 h-16 rounded-lg ${
                            doc.type === 'doc' ? 'bg-blue-100 text-blue-600' :
                            doc.type === 'spreadsheet' ? 'bg-green-100 text-green-600' :
                            doc.type === 'presentation' ? 'bg-amber-100 text-amber-600' :
                            doc.type === 'image' ? 'bg-purple-100 text-purple-600' :
                            doc.type === 'folder' ? 'bg-gray-100 text-gray-600' : ''
                          } flex items-center justify-center`}>
                            {getDocumentIcon(doc.type)}
                          </div>
                        </div>
                        
                        {/* Document details */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">{doc.title}</h3>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Edited {doc.lastEdited}</span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle favorite logic would go here
                                }}
                              >
                                <Star className="h-4 w-4" fill={doc.isFavorite ? "currentColor" : "none"} />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Open
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500">
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {doc.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-accent px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Collaborators */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(3, doc.collaborators) }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs border-2 border-background"
                                >
                                  {['A', 'B', 'C'][i]}
                                </div>
                              ))}
                              {doc.collaborators > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                  +{doc.collaborators - 3}
                                </div>
                              )}
                            </div>
                            
                            <Button variant="ghost" size="sm" className="h-7">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg ${
                              doc.type === 'doc' ? 'bg-blue-100 text-blue-600' :
                              doc.type === 'spreadsheet' ? 'bg-green-100 text-green-600' :
                              doc.type === 'presentation' ? 'bg-amber-100 text-amber-600' :
                              doc.type === 'image' ? 'bg-purple-100 text-purple-600' :
                              doc.type === 'folder' ? 'bg-gray-100 text-gray-600' : ''
                            } flex items-center justify-center mr-4`}>
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{doc.title}</h3>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Edited {doc.lastEdited}</span>
                                {doc.tags && doc.tags.length > 0 && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{doc.tags.join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(3, doc.collaborators) }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs border-2 border-background"
                                >
                                  {['A', 'B', 'C'][i]}
                                </div>
                              ))}
                              {doc.collaborators > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                  +{doc.collaborators - 3}
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                            >
                              <Star className="h-4 w-4" fill={doc.isFavorite ? "currentColor" : "none"} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Workspace;
