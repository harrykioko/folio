
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

// Command-style options representing product capabilities
const commands = [
  { name: 'launch_marketing', color: 'text-[#b967ff]' },
  { name: 'deploy_product', color: 'text-[#3a86ff]' },
  { name: 'monitor_revenue', color: 'text-[#2ecc71]' },
  { name: 'iterate_design', color: 'text-[#ff9f1c]' },
  { name: 'ship_code', color: 'text-[#ff5757]' }
];

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show elements after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <main className="relative z-10 px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
      <div className="container mx-auto max-w-screen-lg">
        <div className="text-center max-w-3xl mx-auto">
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 transition-all duration-700 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Command Center for Empire Builders
          </h1>
          <p 
            className={`text-lg text-muted-foreground mb-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Your multi-vertical SaaS portfolio, unified and amplified
          </p>
          <div 
            className={`flex justify-center transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link 
              to="/auth?signup=true" 
              className="py-3 px-6 rounded-md bg-background/25 backdrop-blur-xl border border-white/40 text-foreground font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:bg-background/30 hover:text-primary-foreground hover:translate-y-[-2px] group dark:bg-secondary/50 dark:border-white/10 dark:hover:bg-secondary/70 dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <span className="text-primary dark:text-white">Take Control</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300 text-primary dark:text-white" />
            </Link>
          </div>
        </div>
        
        {/* Terminal command console showcase */}
        <div 
          className={`flex flex-wrap justify-center gap-3 mt-10 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {commands.map((command, index) => (
            <div 
              key={index} 
              className="relative group cursor-pointer font-mono text-sm px-4 py-2 rounded bg-gradient-to-b from-[#222222] to-[#1a1a1a] text-gray-200 hover:bg-gradient-to-b hover:from-[#2a2a2a] hover:to-[#222222] transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
            >
              <Terminal size={14} className="mr-1.5 opacity-70 text-gray-400" />
              <span className="text-[#4da37c] mr-1">&gt;</span>
              <span className={`${command.color} group-hover:brightness-110`}>{command.name}</span>
              <span className="w-1.5 h-4 ml-1 bg-white/70 opacity-0 group-hover:opacity-70 animate-pulse"></span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
