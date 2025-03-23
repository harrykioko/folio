
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

// Command-style options representing product capabilities
const commands = [
  { name: 'launch_marketing', color: 'text-purple-400' },
  { name: 'deploy_product', color: 'text-blue-400' },
  { name: 'monitor_revenue', color: 'text-green-400' },
  { name: 'iterate_design', color: 'text-orange-400' },
  { name: 'ship_code', color: 'text-pink-400' }
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
              className="py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(155,135,245,0.5)] hover:translate-y-[-2px] group"
            >
              <span>Take Control</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
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
              className="relative group cursor-pointer font-mono text-sm px-4 py-2 rounded bg-[#222222] text-gray-200 hover:bg-[#333333] transition-all duration-200 flex items-center"
            >
              <Terminal size={14} className="mr-1.5 opacity-70" />
              <span className="text-gray-400 mr-1">&gt;</span>
              <span className={`${command.color}`}>{command.name}</span>
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
