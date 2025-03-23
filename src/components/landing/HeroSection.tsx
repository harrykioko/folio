
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BuildingIcons from './BuildingIcons';
import { motion } from 'framer-motion';

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
          <motion.h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 transition-all duration-700 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            Command Center for Empire Builders
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Your multi-vertical SaaS portfolio, unified and amplified
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link 
              to="/auth?signup=true" 
              className="group py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Take Control</span>
              <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/auth" 
              className="py-3 px-6 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
        
        {/* Empire Building Icons */}
        <BuildingIcons />
      </div>
    </main>
  );
}
