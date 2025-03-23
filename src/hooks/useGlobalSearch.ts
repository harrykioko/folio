
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define types for search results
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'document' | 'task' | 'asset' | 'project' | 'person';
  url: string;
  icon?: string;
  tags?: string[];
  lastModified?: string;
}

// Mock data for demonstration
const mockResults: SearchResult[] = [
  // Documents
  {
    id: 'doc-1',
    title: 'Q3 Marketing Strategy',
    description: 'Marketing plan for the third quarter',
    category: 'document',
    url: '/workspace/documents/marketing-q3',
    lastModified: '2023-08-15',
    tags: ['marketing', 'strategy']
  },
  {
    id: 'doc-2',
    title: 'Product Roadmap 2024',
    description: 'Technical specifications and timeline',
    category: 'document',
    url: '/workspace/documents/roadmap-2024',
    lastModified: '2023-09-02',
    tags: ['product', 'development']
  },
  
  // Tasks
  {
    id: 'task-1',
    title: 'Review PR for homepage redesign',
    description: 'High priority - due tomorrow',
    category: 'task',
    url: '/tasks/t-123',
    lastModified: '2023-09-10',
    tags: ['development', 'design']
  },
  {
    id: 'task-2',
    title: 'Finalize Q4 budget',
    description: 'Awaiting finance approval',
    category: 'task',
    url: '/tasks/t-456',
    lastModified: '2023-09-05',
    tags: ['finance', 'planning']
  },
  
  // Assets
  {
    id: 'asset-1',
    title: 'Company Logo (SVG)',
    description: 'Primary brand logo in vector format',
    category: 'asset',
    url: '/assets/a-789',
    lastModified: '2023-07-22',
    tags: ['brand', 'design']
  },
  {
    id: 'asset-2',
    title: 'API Documentation',
    description: 'REST API reference guide',
    category: 'asset',
    url: '/assets/a-012',
    lastModified: '2023-08-30',
    tags: ['development', 'documentation']
  },
  
  // Projects
  {
    id: 'proj-1',
    title: 'Website Redesign',
    description: 'Modernizing the company website',
    category: 'project',
    url: '/portfolio/p-345',
    lastModified: '2023-08-14',
    tags: ['design', 'development']
  },
  {
    id: 'proj-2',
    title: 'Mobile App v2.0',
    description: 'Major feature update',
    category: 'project',
    url: '/portfolio/p-678',
    lastModified: '2023-09-01',
    tags: ['mobile', 'development']
  },
  
  // People
  {
    id: 'person-1',
    title: 'Sarah Chen',
    description: 'Lead Designer',
    category: 'person',
    url: '/team/sarah-chen',
    tags: ['design', 'leadership']
  },
  {
    id: 'person-2',
    title: 'Mark Johnson',
    description: 'Senior Developer',
    category: 'person',
    url: '/team/mark-johnson',
    tags: ['development']
  }
];

export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // This would be replaced with actual Supabase queries in a production app
  useEffect(() => {
    // For debugging
    console.log('Search query:', searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase().trim();
      console.log('Searching for:', lowerQuery);
      
      // Filter mock results based on search query
      const filteredResults = mockResults.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const descMatch = item.description?.toLowerCase().includes(lowerQuery) || false;
        const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) || false;
        
        const matches = titleMatch || descMatch || tagMatch;
        console.log(`Item: ${item.title}, Matches: ${matches}`);
        return matches;
      });
      
      console.log('Filtered results:', filteredResults);
      setResults(filteredResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Group results by category
  const groupedResults = results.reduce((groups, result) => {
    const category = result.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  return {
    searchQuery,
    setSearchQuery,
    results,
    groupedResults,
    isLoading
  };
}
