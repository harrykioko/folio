
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Database, Cloud, Shield } from 'lucide-react';

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show elements after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Features list
  const features = [
    {
      icon: <Layers />,
      title: 'Asset Management',
      description: 'Centralize all business assets in one secure location with powerful organization features.'
    },
    {
      icon: <Database />,
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with your team on documents, projects and tasks.'
    },
    {
      icon: <Cloud />,
      title: 'Unified Dashboard',
      description: 'Get a complete overview of your business with customizable analytics and metrics.'
    },
    {
      icon: <Shield />,
      title: 'Security-First Design',
      description: 'Enterprise-grade security with role-based access controls and full audit logging.'
    }
  ];
  
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/20 dark:to-indigo-900/10 blur-3xl opacity-70 animate-spin-slow" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/10 blur-3xl opacity-70 animate-spin-slow" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-semibold tracking-tight">Folio</span>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </nav>
              <Link 
                to="/auth" 
                className="text-sm py-2.5 px-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <main className="relative z-10 px-4 pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Unified Management Platform for Business Growth
            </h1>
            <p 
              className={`text-lg md:text-xl text-muted-foreground mb-8 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Centralize your assets, collaborate with your team, and make data-driven decisions all in one elegant platform.
            </p>
            <div 
              className={`flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link 
                to="/auth?signup=true" 
                className="py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
              <a 
                href="#features" 
                className="py-3 px-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          
          {/* Dashboard preview */}
          <div 
            className={`relative mt-16 md:mt-24 rounded-xl overflow-hidden border border-border shadow-lg transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div className="pt-8">
              {/* Placeholder for dashboard image - replace with actual dashboard preview */}
              <div className="bg-card aspect-[16/9] w-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">Folio Dashboard</div>
                  <p className="text-muted-foreground">Beautiful and functional unified workspace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Features section */}
      <section id="features" className="relative z-10 px-4 py-24 bg-accent">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-muted-foreground">
              Folio combines all the tools you need to manage your business effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-background rounded-xl p-6 border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-screen-xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to Streamline Your Business?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join Folio today and experience a new level of operational efficiency.
              </p>
              <Link 
                to="/auth?signup=true" 
                className="inline-flex items-center space-x-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-border">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-semibold mb-2">Folio</div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Folio. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
