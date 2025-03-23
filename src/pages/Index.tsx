import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Layers, Database, Cloud, Shield, 
  ChevronLeft, ChevronRight, ExternalLink, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import VerticalTag from '@/components/VerticalTag';

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode for founders
    return localStorage.getItem('theme') === 'dark';
  });
  
  useEffect(() => {
    // Apply dark mode to HTML element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    // Show elements after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Inspirational quotes for carousel
  const inspirationalQuotes = [
    {
      quote: "Build ventures that matter, or don't build at all.",
      author: "Founder's Mantra"
    },
    {
      quote: "Vision without execution is hallucination.",
      author: "Thomas Edison"
    },
    {
      quote: "The best way to predict the future is to create it.",
      author: "Peter Drucker"
    },
    {
      quote: "Move fast and build things that last.",
      author: "Builder's Code"
    },
    {
      quote: "What we do in life echoes in eternity.",
      author: "Marcus Aurelius"
    }
  ];
  
  // Product verticals represented in the platform
  const verticals = [
    { name: 'marketing', color: 'from-purple-600 to-indigo-600' },
    { name: 'product', color: 'from-blue-600 to-sky-600' },
    { name: 'finance', color: 'from-green-600 to-emerald-600' },
    { name: 'design', color: 'from-orange-600 to-amber-600' },
    { name: 'development', color: 'from-pink-600 to-rose-600' }
  ];
  
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background element - more edgy and modern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 blur-3xl"></div>
        <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-900/20 to-violet-900/20 blur-3xl"></div>
        
        {/* Subtle data visualization elements in background */}
        <svg className="absolute top-1/4 right-1/4 w-64 h-64 opacity-5" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="0.2" />
          <path d="M30,30 L70,70 M30,70 L70,30" stroke="currentColor" strokeWidth="0.2" />
        </svg>
        
        <svg className="absolute bottom-1/4 left-1/4 w-48 h-48 opacity-5" viewBox="0 0 100 100">
          <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.3" fill="none" />
        </svg>
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">Folio</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link 
                to="/auth" 
                className="py-2.5 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section - more impactful and energizing */}
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
              className={`flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link 
                to="/auth?signup=true" 
                className="py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <span>Take Control</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                to="/auth" 
                className="py-3 px-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Sign In
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
      
      {/* Inspirational quotes carousel */}
      <section className="relative z-10 px-4 py-16 bg-accent/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-screen-lg">
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {inspirationalQuotes.map((item, index) => (
                <CarouselItem key={index}>
                  <Card className="border-none shadow-none bg-transparent">
                    <div className="p-1">
                      <blockquote className="text-center">
                        <p className="text-xl md:text-2xl font-serif italic mb-4 text-foreground">
                          "{item.quote}"
                        </p>
                        <footer className="text-muted-foreground">
                          — {item.author}
                        </footer>
                      </blockquote>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="relative inset-auto mx-2" />
              <CarouselNext className="relative inset-auto mx-2" />
            </div>
          </Carousel>
        </div>
      </section>
      
      {/* Simplified call to action */}
      <section className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-screen-lg">
          <div className="bg-card dark:bg-slate-900/60 rounded-2xl p-8 md:p-12 border border-border shadow-sm">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Start Building Your Empire Today
              </h2>
              <p className="text-muted-foreground mb-8">
                Join the founders who are scaling multi-vertical SaaS businesses faster and more efficiently.
              </p>
              <Link 
                to="/auth?signup=true" 
                className="inline-flex items-center space-x-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Minimalist footer */}
      <footer className="relative z-10 px-4 py-8 border-t border-border">
        <div className="container mx-auto max-w-screen-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">Folio</div>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Folio. Built for builders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
