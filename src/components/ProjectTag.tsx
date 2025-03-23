
import React from 'react';

interface ProjectTagProps {
  name: string;
  color: string;
  onClick?: () => void;
  className?: string;
}

const ProjectTag: React.FC<ProjectTagProps> = ({ 
  name, 
  color, 
  onClick, 
  className = "" 
}) => {
  return (
    <div 
      className={`flex items-center text-xs bg-accent px-2 py-0.5 rounded-full ${className} ${onClick ? 'cursor-pointer hover:bg-accent/80' : ''}`}
      onClick={onClick}
    >
      <div className={`w-2 h-2 rounded-full ${color} mr-1`}></div>
      <span>{name}</span>
    </div>
  );
};

export default ProjectTag;
