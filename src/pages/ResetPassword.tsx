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
import { AuthLoadingState } from '@/components/ui/AuthLoadingState';
import { AuthError } from '@/types/errors';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialRequest, setIsInitialRequest] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { success, error } = await resetPassword(email);
      if (!success) throw new AuthError(error?.message || 'Failed to send reset email');
      
      setIsSuccess(true);
      setIsInitialRequest(false);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { success, error } = await updatePassword(newPassword);
      if (!success) throw new AuthError(error?.message || 'Failed to update password');
      
      setIsSuccess(true);
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AuthLoadingState message={isInitialRequest ? "Sending reset email..." : "Updating password..."} />;
  }

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
        <div className="bg-card/50 backdrop-blur-lg rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isInitialRequest ? 'Reset Password' : 'Update Password'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isInitialRequest 
                ? 'Enter your email to receive a password reset link'
                : 'Enter your new password'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-muted-foreground">
                {isInitialRequest
                  ? 'Check your email for the password reset link.'
                  : 'Your password has been updated successfully.'}
              </p>
              {!isInitialRequest && (
                <p className="text-sm text-muted-foreground">
                  Redirecting to login...
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={isInitialRequest ? handleResetRequest : handlePasswordUpdate} className="space-y-4">
              {isInitialRequest ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    <span>{isInitialRequest ? 'Sending...' : 'Updating...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{isInitialRequest ? 'Send Reset Link' : 'Update Password'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
