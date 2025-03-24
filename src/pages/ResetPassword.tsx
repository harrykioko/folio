import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import BackgroundElements from '@/components/landing/BackgroundElements';
import ThemeToggle from '@/components/landing/ThemeToggle';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialRequest, setIsInitialRequest] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword, updatePassword, user } = useAuth();
  
  // Check if we're in the reset flow with a token
  const tokenFromUrl = searchParams.get('token') || null;
  const typeFromUrl = searchParams.get('type') || null;
  const hasResetToken = !!tokenFromUrl && typeFromUrl === 'recovery';
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !hasResetToken) {
      navigate('/dashboard');
    }
  }, [user, navigate, hasResetToken]);

  // Password validation
  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // At least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { 
        isValid: false, 
        message: 'Password must include at least one uppercase letter, one lowercase letter, and one number' 
      };
    }
    
    return { isValid: true };
  };
  
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate email isn't empty
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      toast({
        title: 'Email required',
        description: 'Please enter your email address to reset your password.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error } = await resetPassword(email);
      
      if (!success && error) throw error;
      
      // Success
      setIsSuccess(true);
      setIsInitialRequest(false);
      toast({
        title: 'Check your email',
        description: 'We\'ve sent a password reset link to your email.',
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to send reset email. Please try again.');
      toast({
        title: 'Reset failed',
        description: error?.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setErrorMessage(validation.message || 'Password does not meet security requirements');
      toast({
        title: 'Invalid password',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error } = await updatePassword(newPassword);
      
      if (!success) throw error;
      
      // Success
      setIsSuccess(true);
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to update password. Please try again.');
      toast({
        title: 'Update failed',
        description: error?.message || 'Failed to update password. Please try again.',
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
              {isSuccess 
                ? 'Success!' 
                : hasResetToken 
                  ? 'Set new password' 
                  : 'Reset your password'}
            </h1>
            <p className="text-muted-foreground">
              {isSuccess 
                ? hasResetToken 
                  ? 'Your password has been updated' 
                  : 'Check your email for reset instructions'
                : hasResetToken 
                  ? 'Enter your new password below' 
                  : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success state */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center text-muted-foreground">
                {hasResetToken 
                  ? 'Your password has been successfully updated. You will be redirected to the login page shortly...' 
                  : 'We\'ve sent a reset link to your email address. Please check your inbox and follow the instructions.'}
              </p>
              <Button onClick={() => navigate('/auth')} variant="ghost" className="mt-4">
                Return to login
              </Button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={hasResetToken ? handlePasswordUpdate : handleResetRequest} className="animate-fade-in">
              {hasResetToken ? (
                /* Password Reset Form */
                <>
                  <div className="mb-4">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="mt-1"
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="mt-1"
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Password must be at least 8 characters and include uppercase, lowercase, and numbers
                    </p>
                  </div>
                </>
              ) : (
                /* Email Request Form */
                <div className="mb-6">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full mb-4" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {hasResetToken ? 'Update Password' : 'Send Reset Link'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
              
              <div className="text-center mt-6">
                <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
