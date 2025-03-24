import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import BackgroundElements from '@/components/landing/BackgroundElements';
import ThemeToggle from '@/components/landing/ThemeToggle';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialRequest, setIsInitialRequest] = useState(true);
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword, updatePassword } = useAuth();
  
  // Check if we're in the reset flow with a token
  const hasResetToken = searchParams.has('token');
  
  const handleInitialReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      // Success
      toast({
        title: 'Check your email',
        description: 'We\'ve sent a password reset link to your email.',
      });
      setIsInitialRequest(false);
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) throw error;
      
      // Success
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      
      // Redirect to login
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update password. Please try again.',
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
        {/* Reset Card */}
        <div className="backdrop-blur-2xl bg-white/20 dark:bg-black/25 border border-white/30 dark:border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] p-8 animate-scale-in ring-1 ring-white/50 dark:ring-white/15">
          {/* Card Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              {hasResetToken ? 'Set new password' : 'Reset your password'}
            </h1>
            <p className="text-muted-foreground">
              {hasResetToken 
                ? 'Enter your new password below' 
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>
          
          {/* Reset Form */}
          {hasResetToken ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium block text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium block text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
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
                    <span>Update Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleInitialReset} className="space-y-5">
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
                    required
                    className="w-full px-4 py-2 bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
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
                    <span>Send Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link 
              to="/auth"
              className="text-primary/90 hover:text-primary transition-colors text-sm font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground/70 animate-fade-in">
          <p>&copy; {new Date().getFullYear()} Folio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
