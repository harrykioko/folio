
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function LandingHeader() {
  return (
    <header className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">Folio</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              to="/auth" 
              className="py-2.5 px-5 rounded-md bg-background/15 backdrop-blur-md border border-white/30 text-foreground font-medium transition-all duration-300 hover:bg-background/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
