
import { useState } from 'react';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  members: number;
  tasks: { completed: number; total: number };
}

export default function ProjectCard({
  title,
  description,
  progress,
  dueDate,
  members,
  tasks,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Progress bar color based on progress
  const getProgressColor = () => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div
      className="bg-card rounded-xl border border-border transition-all duration-300 overflow-hidden card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {description}
        </p>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor()}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Card footer with stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>{dueDate}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="w-3.5 h-3.5 mr-1" />
            <span>{members}</span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>
              {tasks.completed}/{tasks.total}
            </span>
          </div>
          
          <div className={`p-1.5 rounded-full transition-all ${
            isHovered ? 'bg-accent text-foreground' : 'text-muted-foreground'
          }`}>
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
