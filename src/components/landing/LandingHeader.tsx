
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
              className="py-2.5 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
