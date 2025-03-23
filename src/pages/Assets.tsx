
import React, { useState } from 'react';
import { 
  Calendar,
  Clock, 
  FileText, 
  Filter, 
  Globe, 
  Grid, 
  Image as ImageIcon, 
  Info, 
  Key,
  List, 
  MoreVertical, 
  Plus, 
  Search, 
  Shield,
  SlidersHorizontal, 
  Star,
  Tag,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import AssetCard from '@/components/AssetCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'domain' | 'document' | 'image' | 'credential' | 'repository' | 'social' | 'subscription' | 'apikey';
  category: string;
  lastUpdated: string;
  owner: string;
  starred: boolean;
  thumbnail?: string;
  status?: 'active' | 'expiring' | 'expired' | 'needs-attention';
  expiryDate?: string;
  projects?: string[];
  description: string;
  metadata?: {
    [key: string]: any;
  };
}

const Assets = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Sample projects data
  const projects: Project[] = [
    { id: '1', name: 'Folio Platform', color: 'bg-blue-500' },
    { id: '2', name: 'Client Portal', color: 'bg-green-500' },
    { id: '3', name: 'Analytics Dashboard', color: 'bg-purple-500' },
    { id: '4', name: 'Documentation Site', color: 'bg-amber-500' },
  ];

  // Enhanced sample assets data
  const assets: Asset[] = [
    {
      id: '1',
      name: 'folio.dev',
      type: 'domain',
      category: 'Domains & Web Assets',
      lastUpdated: '2 days ago',
      owner: 'Admin',
      starred: true,
      status: 'active',
      expiryDate: '2025-05-15',
      projects: ['1', '4'],
      description: 'Main product domain',
      metadata: {
        registrar: 'Namecheap',
        dns: 'Cloudflare',
        hosting: 'Vercel',
        autoRenew: true
      }
    },
    {
      id: '2',
      name: 'Brand Guidelines',
      type: 'document',
      category: 'Brand Assets',
      lastUpdated: '1 week ago',
      owner: 'Marketing',
      starred: true,
      status: 'active',
      projects: ['1', '2', '3', '4'],
      description: 'Official brand guidelines document',
      metadata: {
        format: 'PDF',
        size: '8.5 MB',
        pages: 24,
        version: '2.1'
      }
    },
    {
      id: '3',
      name: 'Logo (Dark)',
      type: 'image',
      category: 'Brand Assets',
      lastUpdated: '1 month ago',
      owner: 'Design',
      starred: false,
      thumbnail: 'https://via.placeholder.com/150',
      status: 'active',
      projects: ['1', '2'],
      description: 'Dark version of the company logo',
      metadata: {
        format: 'SVG/PNG',
        dimensions: '1024x1024',
        colorMode: 'CMYK'
      }
    },
    {
      id: '4',
      name: 'AWS Access Keys',
      type: 'credential',
      category: 'Credentials & Access',
      lastUpdated: '2 weeks ago',
      owner: 'DevOps',
      starred: false,
      status: 'expiring',
      expiryDate: '2023-11-15',
      projects: ['1', '3'],
      description: 'Production environment access keys',
      metadata: {
        username: 'folio-prod-admin',
        keyId: 'AKIA************',
        accessLevel: 'Admin',
        mfa: true
      }
    },
    {
      id: '5',
      name: 'folio-main',
      type: 'repository',
      category: 'Development Resources',
      lastUpdated: '3 hours ago',
      owner: 'Engineering',
      starred: true,
      status: 'active',
      projects: ['1'],
      description: 'Main product code repository',
      metadata: {
        platform: 'GitHub',
        language: 'TypeScript',
        branches: 15,
        openPRs: 3,
        issues: 8
      }
    },
    {
      id: '6',
      name: 'Product Mockups',
      type: 'image',
      category: 'Brand Assets',
      lastUpdated: '5 days ago',
      owner: 'Design',
      starred: false,
      thumbnail: 'https://via.placeholder.com/150',
      status: 'active',
      projects: ['1', '2'],
      description: 'UI mockups for new features',
      metadata: {
        format: 'Figma',
        pages: 12,
        components: 45
      }
    },
    {
      id: '7',
      name: 'api.folio.dev',
      type: 'domain',
      category: 'Domains & Web Assets',
      lastUpdated: '1 month ago',
      owner: 'Admin',
      starred: false,
      status: 'needs-attention',
      expiryDate: '2024-02-10',
      projects: ['1', '3'],
      description: 'API domain for service endpoints',
      metadata: {
        registrar: 'Namecheap',
        dns: 'Cloudflare',
        hosting: 'AWS Route 53',
        autoRenew: false
      }
    },
    {
      id: '8',
      name: 'Partnership Agreement',
      type: 'document',
      category: 'Documents',
      lastUpdated: '2 months ago',
      owner: 'Legal',
      starred: true,
      status: 'active',
      projects: ['1'],
      description: 'Legal partnership agreement document',
      metadata: {
        format: 'PDF',
        size: '3.2 MB',
        signatories: ['CEO', 'Partner CEO'],
        effectiveDate: '2023-05-01'
      }
    },
    {
      id: '9',
      name: 'Stripe API Key',
      type: 'apikey',
      category: 'Development Resources',
      lastUpdated: '1 month ago',
      owner: 'Engineering',
      starred: false,
      status: 'active',
      projects: ['1', '2'],
      description: 'Payment processing integration key',
      metadata: {
        environment: 'Production',
        prefix: 'sk_live_',
        permissions: 'Full access',
        created: '2023-04-12'
      }
    },
    {
      id: '10',
      name: 'Twitter Account',
      type: 'social',
      category: 'Social Media Accounts',
      lastUpdated: '2 days ago',
      owner: 'Marketing',
      starred: true,
      status: 'active',
      projects: ['1'],
      description: 'Official company Twitter account',
      metadata: {
        handle: '@folioofficial',
        followers: 5240,
        lastPosted: '1 day ago',
        engagement: '3.2%'
      }
    },
    {
      id: '11',
      name: 'Adobe Creative Cloud',
      type: 'subscription',
      category: 'Subscriptions & Services',
      lastUpdated: '15 days ago',
      owner: 'Design',
      starred: false,
      status: 'expiring',
      expiryDate: '2023-12-01',
      projects: ['1', '2', '3', '4'],
      description: 'Design team software subscription',
      metadata: {
        plan: 'Team Enterprise',
        seats: 5,
        cost: '$249.99/month',
        billingCycle: 'Annual'
      }
    },
  ];

  // Comprehensive category structure
  const categories = [
    { id: 'all', name: 'All Categories', icon: <Grid className="h-4 w-4" /> },
    { id: 'domains', name: 'Domains & Web Assets', icon: <Globe className="h-4 w-4" /> },
    { id: 'social', name: 'Social Media Accounts', icon: <Users className="h-4 w-4" /> },
    { id: 'development', name: 'Development Resources', icon: <FileText className="h-4 w-4" /> },
    { id: 'brand', name: 'Brand Assets', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'credentials', name: 'Credentials & Access', icon: <Key className="h-4 w-4" /> },
    { id: 'documents', name: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'subscriptions', name: 'Subscriptions & Services', icon: <Calendar className="h-4 w-4" /> },
  ];

  // Helper function to get category by ID
  const getCategoryByID = (id: string) => {
    return categories.find(cat => cat.id === id) || categories[0];
  };

  // Filter assets by search term, category, and selected projects
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
                           asset.category === getCategoryByID(activeCategory).name;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'starred' && asset.starred) ||
                      (activeTab === 'domains' && asset.type === 'domain') ||
                      (activeTab === 'documents' && asset.type === 'document') ||
                      (activeTab === 'images' && asset.type === 'image') ||
                      (activeTab === 'expiring' && asset.status === 'expiring') ||
                      (activeTab === 'attention' && asset.status === 'needs-attention');
    
    // Filter by selected projects if any are selected
    const matchesProjects = selectedProjects.length === 0 || 
                           (asset.projects && asset.projects.some(p => selectedProjects.includes(p)));
    
    return matchesSearch && matchesCategory && matchesTab && matchesProjects;
  });

  // Helper to get project by ID
  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  // Toggle project selection
  const toggleProjectSelection = (id: string) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(p => p !== id));
    } else {
      setSelectedProjects([...selectedProjects, id]);
    }
  };

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Asset Manager</h1>
          <p className="text-muted-foreground">
            Organize and access all your business assets
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="glass-panel">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Projects</h3>
              <div className="space-y-1">
                {projects.map((project) => (
                  <Button 
                    key={project.id}
                    variant={selectedProjects.includes(project.id) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => toggleProjectSelection(project.id)}
                  >
                    <div className={`w-3 h-3 rounded-full ${project.color} mr-2`}></div>
                    {project.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Quick Filters</h3>
              <div className="space-y-1">
                <Button 
                  variant={activeTab === 'starred' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('starred')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </Button>
                <Button 
                  variant={activeTab === 'expiring' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('expiring')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Expiring Soon
                </Button>
                <Button 
                  variant={activeTab === 'attention' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('attention')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Needs Attention
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Recently Updated
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets content */}
        <div className="flex-1">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <Tabs defaultValue="all" className="w-full md:w-auto" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="expiring">Expiring</TabsTrigger>
                <TabsTrigger value="attention">Attention</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected filters display */}
          {(selectedProjects.length > 0 || activeTab !== 'all' || activeCategory !== 'all' || searchTerm) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filters:</span>
              
              {selectedProjects.length > 0 && selectedProjects.map(projectId => {
                const project = getProjectById(projectId);
                return project ? (
                  <Badge key={project.id} variant="outline" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                    {project.name}
                    <button 
                      className="ml-1 hover:text-destructive" 
                      onClick={() => toggleProjectSelection(project.id)}
                    >
                      ×
                    </button>
                  </Badge>
                ) : null;
              })}
              
              {activeCategory !== 'all' && (
                <Badge variant="outline">
                  {getCategoryByID(activeCategory).name}
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setActiveCategory('all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {activeTab !== 'all' && (
                <Badge variant="outline">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setActiveTab('all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="outline">
                  Search: "{searchTerm}"
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setSelectedProjects([]);
                  setActiveCategory('all');
                  setActiveTab('all');
                  setSearchTerm('');
                }}
              >
                Clear All
              </Button>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-280px)]">
            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <ContextMenu key={asset.id}>
                    <ContextMenuTrigger>
                      <AssetCard
                        type={asset.type}
                        title={asset.name}
                        description={asset.description}
                        date={asset.lastUpdated}
                        status={asset.status}
                        expiryDate={asset.expiryDate}
                        metadata={asset.metadata}
                        projects={asset.projects?.map(id => getProjectById(id)).filter(Boolean) as Project[]}
                        thumbnail={asset.thumbnail}
                        starred={asset.starred}
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem>
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Edit Asset
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <Star className="h-4 w-4 mr-2" fill={asset.starred ? "currentColor" : "none"} />
                        {asset.starred ? "Remove from Starred" : "Add to Starred"}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem>
                        <Tag className="h-4 w-4 mr-2" />
                        Manage Tags
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="text-destructive focus:text-destructive">
                        Delete Asset
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg ${
                            asset.type === 'domain' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            asset.type === 'document' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            asset.type === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                            asset.type === 'credential' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                            asset.type === 'repository' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            asset.type === 'social' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
                            asset.type === 'subscription' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            asset.type === 'apikey' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          } flex items-center justify-center mr-4`}>
                            {asset.type === 'domain' && <Globe className="h-5 w-5" />}
                            {asset.type === 'document' && <FileText className="h-5 w-5" />}
                            {asset.type === 'image' && <ImageIcon className="h-5 w-5" />}
                            {asset.type === 'credential' && <Key className="h-5 w-5" />}
                            {asset.type === 'repository' && <FileText className="h-5 w-5" />}
                            {asset.type === 'social' && <Users className="h-5 w-5" />}
                            {asset.type === 'subscription' && <Calendar className="h-5 w-5" />}
                            {asset.type === 'apikey' && <Key className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{asset.name}</h3>
                              {asset.status && (
                                <Badge className={`ml-2 ${
                                  asset.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  asset.status === 'expiring' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                  asset.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {asset.status === 'active' ? 'Active' : 
                                  asset.status === 'expiring' ? 'Expiring Soon' : 
                                  asset.status === 'expired' ? 'Expired' : 
                                  'Needs Attention'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span className="mr-3">{asset.category}</span>
                              <Clock className="w-3 h-3 mr-1" />
                              <span className="mr-3">{asset.lastUpdated}</span>
                              {asset.expiryDate && (
                                <>
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>Expires: {new Date(asset.expiryDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                            {asset.projects && asset.projects.length > 0 && (
                              <div className="flex flex-wrap mt-1 gap-1">
                                {asset.projects.map(projectId => {
                                  const project = getProjectById(projectId);
                                  return project ? (
                                    <div key={project.id} className="flex items-center text-xs">
                                      <div className={`w-2 h-2 rounded-full ${project.color} mr-1`}></div>
                                      <span>{project.name}</span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{asset.owner}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className="h-4 w-4" fill={asset.starred ? "currentColor" : "none"} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="h-4 w-4 mr-2" />
                                Manage Tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
      </div>
    </div>
  );
};

export default Assets;
