
import { useState } from 'react';
import { Calendar, Globe, File, Bookmark, MoreHorizontal } from 'lucide-react';

interface AssetCardProps {
  type: 'domain' | 'document' | 'subscription' | 'repository';
  title: string;
  description: string;
  date?: string;
  status?: 'active' | 'expired' | 'pending' | 'upcoming';
  icon?: React.ReactNode;
}

export default function AssetCard({ 
  type, 
  title, 
  description, 
  date, 
  status = 'active',
  icon 
}: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Default icons based on type
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'domain':
        return <Globe className="w-5 h-5" />;
      case 'document':
        return <File className="w-5 h-5" />;
      case 'subscription':
        return <Calendar className="w-5 h-5" />;
      case 'repository':
        return <Bookmark className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };
  
  // Status styles
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  return (
    <div
      className="bg-card rounded-xl border border-border transition-all duration-300 overflow-hidden card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-accent">
              {getIcon()}
            </div>
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {type}
            </span>
          </div>
          
          {status && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles()}`}>
              {status}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          {date && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>{date}</span>
            </div>
          )}
          
          <button 
            className={`p-1.5 rounded-full transition-colors ${
              isHovered 
                ? 'text-foreground bg-accent/50' 
                : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
