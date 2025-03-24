import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import BackgroundElements from '@/components/landing/BackgroundElements';
import ThemeToggle from '@/components/landing/ThemeToggle';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignIn) {
        const { success, error } = await signIn(email, password);
        if (!success) throw error;
        
        // Success
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate('/dashboard');
      } else {
        const { success, error } = await signUp(email, password, firstName, lastName);
        if (!success) throw error;
        
        // Success
        toast({
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
        });
        setIsSignIn(true);
      }
    } catch (error: any) {
      toast({
        title: 'Authentication error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background relative overflow-hidden">
      {/* Background elements */}
      <BackgroundElements />
      
      {/* Top navigation */}
      <div className="absolute top-0 left-0 w-full p-4 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">
            Folio
          </Link>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="w-full max-w-md mx-auto px-6 z-10">
        {/* Auth Card - Enhanced glassmorphic effect with more transparency in dark mode */}
        <div className="backdrop-blur-2xl bg-white/20 dark:bg-black/25 border border-white/30 dark:border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] p-8 animate-scale-in ring-1 ring-white/50 dark:ring-white/15">
          {/* Card Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              {isSignIn ? 'Welcome back!' : 'Create account'}
            </h1>
            <p className="text-muted-foreground">
              {isSignIn ? 'Sign in to your account' : 'Sign up for a new account'}
            </p>
          </div>
          
          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium block text-foreground">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                  required
                />
              </div>
            </div>
            
            {!isSignIn && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium block text-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                      required={!isSignIn}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium block text-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                      required={!isSignIn}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-sm font-medium block text-foreground">
                  Password
                </Label>
                {isSignIn && (
                  <Link to="/reset-password" className="text-sm text-primary/90 hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg pr-10 focus:ring-2 focus:ring-primary/50 text-foreground"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg font-medium transition-all backdrop-blur-sm border border-primary/30 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignIn ? 'Sign in' : 'Create account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
            
            {/* Removed the "or" divider here */}
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-primary/90 hover:text-primary transition-colors text-sm font-medium"
              >
                {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground/70 animate-fade-in">
          <p>&copy; {new Date().getFullYear()} Folio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
