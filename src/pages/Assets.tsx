
import React, { useState } from 'react';
import { 
  Clock, 
  FileText, 
  Filter, 
  Globe, 
  Grid, 
  Image as ImageIcon, 
  Info, 
  List, 
  MoreVertical, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Asset {
  id: string;
  name: string;
  type: 'domain' | 'document' | 'image' | 'credential' | 'repository';
  category: string;
  lastUpdated: string;
  owner: string;
  starred: boolean;
  thumbnail?: string;
}

const Assets = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Sample assets data
  const assets: Asset[] = [
    {
      id: '1',
      name: 'folio.dev',
      type: 'domain',
      category: 'Domain',
      lastUpdated: '2 days ago',
      owner: 'Admin',
      starred: true,
    },
    {
      id: '2',
      name: 'Brand Guidelines',
      type: 'document',
      category: 'Document',
      lastUpdated: '1 week ago',
      owner: 'Marketing',
      starred: true,
    },
    {
      id: '3',
      name: 'Logo (Dark)',
      type: 'image',
      category: 'Brand Asset',
      lastUpdated: '1 month ago',
      owner: 'Design',
      starred: false,
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '4',
      name: 'AWS Credentials',
      type: 'credential',
      category: 'Credential',
      lastUpdated: '2 weeks ago',
      owner: 'DevOps',
      starred: false,
    },
    {
      id: '5',
      name: 'folio-main',
      type: 'repository',
      category: 'Repository',
      lastUpdated: '3 hours ago',
      owner: 'Engineering',
      starred: true,
    },
    {
      id: '6',
      name: 'Product Mockups',
      type: 'image',
      category: 'Brand Asset',
      lastUpdated: '5 days ago',
      owner: 'Design',
      starred: false,
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '7',
      name: 'apiservice.folio.dev',
      type: 'domain',
      category: 'Domain',
      lastUpdated: '1 month ago',
      owner: 'Admin',
      starred: false,
    },
    {
      id: '8',
      name: 'Partnership Agreement',
      type: 'document',
      category: 'Document',
      lastUpdated: '2 months ago',
      owner: 'Legal',
      starred: true,
    },
  ];

  // Filter assets by search term and category
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(assets.map(asset => asset.category))];

  // Helper to get icon by asset type
  const getAssetIcon = (type: Asset['type']) => {
    switch(type) {
      case 'domain': return <Globe className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'credential': return <Info className="h-5 w-5" />;
      case 'repository': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Asset Manager</h1>
          <p className="text-muted-foreground">
            Organize and access all your business assets
          </p>
        </div>
        <div className="mt-4 md:mt-0">
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

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Quick Filters</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="mr-2 h-4 w-4" />
                  Starred
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
          <div className="mb-4 flex justify-between items-center">
            <Tabs defaultValue="all" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <Card 
                  key={asset.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* If it's an image, show thumbnail */}
                  {asset.type === 'image' && asset.thumbnail && (
                    <div className="h-32 bg-accent flex items-center justify-center overflow-hidden">
                      <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* If it's not an image with thumbnail, show colored header */}
                  {!(asset.type === 'image' && asset.thumbnail) && (
                    <div className={`h-12 ${
                      asset.type === 'domain' ? 'bg-blue-500' :
                      asset.type === 'document' ? 'bg-green-500' :
                      asset.type === 'credential' ? 'bg-amber-500' :
                      asset.type === 'repository' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${
                          asset.type === 'domain' ? 'bg-blue-100 text-blue-600' :
                          asset.type === 'document' ? 'bg-green-100 text-green-600' :
                          asset.type === 'image' ? 'bg-purple-100 text-purple-600' :
                          asset.type === 'credential' ? 'bg-amber-100 text-amber-600' :
                          asset.type === 'repository' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'
                        } flex items-center justify-center mr-3`}>
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground">{asset.category}</p>
                        </div>
                      </div>
                      <div className="flex">
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{asset.lastUpdated}</span>
                      </div>
                      <span>{asset.owner}</span>
                    </div>
                  </CardContent>
                </Card>
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
                        <div className={`w-10 h-10 rounded-full ${
                          asset.type === 'domain' ? 'bg-blue-100 text-blue-600' :
                          asset.type === 'document' ? 'bg-green-100 text-green-600' :
                          asset.type === 'image' ? 'bg-purple-100 text-purple-600' :
                          asset.type === 'credential' ? 'bg-amber-100 text-amber-600' :
                          asset.type === 'repository' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'
                        } flex items-center justify-center mr-4`}>
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="mr-3">{asset.category}</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{asset.lastUpdated}</span>
                          </div>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assets;
