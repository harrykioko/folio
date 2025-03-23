
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VerticalTag from '@/components/VerticalTag';

// Product verticals represented in the platform
const verticals = [
  { name: 'marketing', color: 'from-purple-600 to-indigo-600' },
  { name: 'product', color: 'from-blue-600 to-sky-600' },
  { name: 'finance', color: 'from-green-600 to-emerald-600' },
  { name: 'design', color: 'from-orange-600 to-amber-600' },
  { name: 'development', color: 'from-pink-600 to-rose-600' }
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
        
        {/* Vertical tags showcase */}
        <div 
          className={`flex flex-wrap justify-center gap-3 mt-10 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {verticals.map((vertical, index) => (
            <div key={index} className="relative group cursor-pointer">
              <VerticalTag vertical={vertical.name as any} className="text-sm px-3 py-1" />
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
