
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle, Check } from 'lucide-react';

type AssetStatus = 'active' | 'expiring' | 'expired' | 'needs-attention';

interface AssetStatusBadgeProps {
  status: AssetStatus;
  className?: string;
  showIcon?: boolean;
}

const AssetStatusBadge: React.FC<AssetStatusBadgeProps> = ({ 
  status, 
  className = "", 
  showIcon = true 
}) => {
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

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <Check className="h-3 w-3 mr-1" />;
      case 'expiring':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'expired':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'needs-attention':
        return <Shield className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`${getStatusStyles()} ${className}`}>
      {showIcon && getStatusIcon()}
      {getStatusLabel()}
    </Badge>
  );
};

export default AssetStatusBadge;
