
import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Copy, 
  ExternalLink, 
  File, 
  FileText, 
  Globe, 
  Image as ImageIcon, 
  Info, 
  Key, 
  MoreHorizontal, 
  Star, 
  Tag, 
  Users,
  Shield,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface AssetCardProps {
  type: 'domain' | 'document' | 'image' | 'credential' | 'repository' | 'social' | 'subscription' | 'apikey';
  title: string;
  description: string;
  date?: string;
  status?: 'active' | 'expiring' | 'expired' | 'needs-attention';
  expiryDate?: string;
  metadata?: {
    [key: string]: any;
  };
  projects?: Project[];
  thumbnail?: string;
  starred?: boolean;
  icon?: React.ReactNode;
}

export default function AssetCard({ 
  type, 
  title, 
  description, 
  date, 
  status = 'active',
  expiryDate,
  metadata = {},
  projects = [],
  thumbnail,
  starred = false,
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
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'credential':
        return <Key className="w-5 h-5" />;
      case 'repository':
        return <File className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      case 'subscription':
        return <Calendar className="w-5 h-5" />;
      case 'apikey':
        return <Key className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };
  
  // Status styles and labels
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'needs-attention':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expiring':
        return 'Expiring Soon';
      case 'expired':
        return 'Expired';
      case 'needs-attention':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  };

  // Get contextual metadata display based on asset type
  const renderMetadata = () => {
    switch (type) {
      case 'domain':
        return (
          <>
            {metadata.registrar && <span>Registrar: {metadata.registrar}</span>}
            {metadata.dns && <span>DNS: {metadata.dns}</span>}
            {metadata.autoRenew !== undefined && (
              <span>Auto-renew: {metadata.autoRenew ? 'Yes' : 'No'}</span>
            )}
          </>
        );
      
      case 'credential':
        return (
          <>
            {metadata.username && (
              <div className="flex items-center">
                <span>Username: {metadata.username}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy username</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {metadata.keyId && <span>Key ID: {metadata.keyId}</span>}
            {metadata.accessLevel && <span>Access: {metadata.accessLevel}</span>}
            {metadata.mfa !== undefined && (
              <span className="flex items-center">
                MFA: {metadata.mfa ? (
                  <><Check className="h-3 w-3 text-green-500 ml-1" /> Enabled</>
                ) : (
                  <span className="text-red-500">Disabled</span>
                )}
              </span>
            )}
          </>
        );
      
      case 'repository':
        return (
          <>
            {metadata.platform && <span>Platform: {metadata.platform}</span>}
            {metadata.language && <span>Language: {metadata.language}</span>}
            {metadata.openPRs !== undefined && <span>Open PRs: {metadata.openPRs}</span>}
            {metadata.issues !== undefined && <span>Issues: {metadata.issues}</span>}
          </>
        );
      
      case 'social':
        return (
          <>
            {metadata.handle && <span>Handle: {metadata.handle}</span>}
            {metadata.followers !== undefined && <span>Followers: {metadata.followers}</span>}
            {metadata.lastPosted && <span>Last Posted: {metadata.lastPosted}</span>}
          </>
        );
      
      case 'subscription':
        return (
          <>
            {metadata.plan && <span>Plan: {metadata.plan}</span>}
            {metadata.cost && <span>Cost: {metadata.cost}</span>}
            {metadata.billingCycle && <span>Billing: {metadata.billingCycle}</span>}
          </>
        );
      
      case 'image':
        return (
          <>
            {metadata.format && <span>Format: {metadata.format}</span>}
            {metadata.dimensions && <span>Size: {metadata.dimensions}</span>}
            {metadata.colorMode && <span>Color: {metadata.colorMode}</span>}
          </>
        );
      
      case 'document':
        return (
          <>
            {metadata.format && <span>Format: {metadata.format}</span>}
            {metadata.size && <span>Size: {metadata.size}</span>}
            {metadata.pages !== undefined && <span>Pages: {metadata.pages}</span>}
            {metadata.version && <span>Version: {metadata.version}</span>}
          </>
        );
      
      case 'apikey':
        return (
          <>
            {metadata.environment && <span>Env: {metadata.environment}</span>}
            {metadata.prefix && <span>Prefix: {metadata.prefix}***</span>}
            {metadata.permissions && <span>Permissions: {metadata.permissions}</span>}
          </>
        );
      
      default:
        return null;
    }
  };

  // Get quick action buttons based on asset type
  const renderQuickActions = () => {
    switch (type) {
      case 'domain':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://${title}`, '_blank');
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Visit
          </Button>
        );
      
      case 'repository':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open Repo
          </Button>
        );
      
      case 'credential':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy
          </Button>
        );
      
      case 'social':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open Profile
          </Button>
        );
      
      default:
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="h-3.5 w-3.5 mr-1" />
            Details
          </Button>
        );
    }
  };
  
  return (
    <div
      className="glass-panel rounded-xl border transition-all duration-300 overflow-hidden card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image thumbnail if available */}
      {thumbnail && (
        <div className="h-32 w-full bg-accent flex items-center justify-center overflow-hidden">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Colored header for non-image assets or images without thumbnails */}
      {(!thumbnail && type === 'image') && (
        <div className="h-32 w-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-purple-400" />
        </div>
      )}
      
      {/* Colored indicator stripe based on asset type */}
      {!thumbnail && type !== 'image' && (
        <div className={`h-1.5 w-full ${
          type === 'domain' ? 'bg-blue-500' :
          type === 'document' ? 'bg-green-500' :
          type === 'credential' ? 'bg-amber-500' :
          type === 'repository' ? 'bg-purple-500' :
          type === 'social' ? 'bg-pink-500' :
          type === 'subscription' ? 'bg-emerald-500' :
          type === 'apikey' ? 'bg-red-500' :
          'bg-gray-500'
        }`}></div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-md ${
              type === 'domain' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              type === 'document' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
              type === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
              type === 'credential' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
              type === 'repository' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
              type === 'social' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
              type === 'subscription' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
              type === 'apikey' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              'bg-accent'
            }`}>
              {getIcon()}
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {type}
              </span>
              <h3 className="text-base font-semibold leading-tight">{title}</h3>
            </div>
          </div>
          
          {status && (
            <Badge className={`ml-auto ${getStatusStyles()}`}>
              {getStatusLabel()}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
          {description}
        </p>
        
        {/* Project tags */}
        {projects && projects.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="flex items-center text-xs bg-accent px-2 py-0.5 rounded"
              >
                <div className={`w-2 h-2 rounded-full ${project.color} mr-1`}></div>
                <span>{project.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Contextual metadata */}
        <div className="grid grid-cols-1 gap-y-1 text-xs text-muted-foreground mb-3">
          {renderMetadata()}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            {date && (
              <div className="flex items-center mr-3">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>{date}</span>
              </div>
            )}
            
            {expiryDate && (
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {renderQuickActions()}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Star className="w-4 h-4" fill={starred ? "currentColor" : "none"} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
