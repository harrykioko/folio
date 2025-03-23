
import React from 'react';
import { Rocket, Code, Network, Blueprint, Capital } from 'lucide-react';
import { motion } from 'framer-motion';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, color }) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${color}`}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm mb-2">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </motion.div>
  );
};

export default function BuildingIcons() {
  const icons = [
    { 
      icon: <Rocket className="h-6 w-6" />, 
      label: "Growth", 
      color: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 text-purple-700 dark:text-purple-300" 
    },
    { 
      icon: <Blueprint className="h-6 w-6" />, 
      label: "Strategy", 
      color: "bg-gradient-to-br from-blue-500/10 to-sky-500/10 hover:from-blue-500/20 hover:to-sky-500/20 text-blue-700 dark:text-blue-300" 
    },
    { 
      icon: <Network className="h-6 w-6" />, 
      label: "Scale", 
      color: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 text-green-700 dark:text-green-300" 
    },
    { 
      icon: <Code className="h-6 w-6" />, 
      label: "Execution", 
      color: "bg-gradient-to-br from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 text-pink-700 dark:text-pink-300" 
    },
    { 
      icon: <Capital className="h-6 w-6" />, 
      label: "Funding", 
      color: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-700 dark:text-orange-300" 
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-10">
      {icons.map((icon, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
        >
          <IconButton icon={icon.icon} label={icon.label} color={icon.color} />
        </motion.div>
      ))}
    </div>
  );
}
