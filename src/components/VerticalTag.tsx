
import React from 'react';

export type VerticalType = 'marketing' | 'product' | 'finance' | 'design' | 'development';

interface VerticalTagProps {
  vertical: VerticalType;
  className?: string;
}

const VerticalTag: React.FC<VerticalTagProps> = ({ vertical, className = '' }) => {
  // Color mapping for different verticals
  const colorMap: Record<VerticalType, string> = {
    marketing: 'bg-purple-100 text-purple-700 border-purple-200',
    product: 'bg-blue-100 text-blue-700 border-blue-200',
    finance: 'bg-green-100 text-green-700 border-green-200',
    design: 'bg-orange-100 text-orange-700 border-orange-200',
    development: 'bg-pink-100 text-pink-700 border-pink-200',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[vertical]} ${className}`}>
      {vertical.charAt(0).toUpperCase() + vertical.slice(1)}
    </span>
  );
};

export default VerticalTag;
