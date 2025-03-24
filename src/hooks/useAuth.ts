import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export type AuthError = {
  message: string;
};

export type ProfileData = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
};

export function useAuth() {
  // Create a Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string
  );
  
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Get the current session and user on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setError(null);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to sign in' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profileData?: ProfileData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Step 2: Create the user profile if profile data is provided
      if (profileData && authData.user) {
        // Use the RPC function we created in our migration
        const { error: profileError } = await supabase.rpc('create_profile', {
          profile_data: {
            id: authData.user.id,
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            avatar_url: profileData.avatar_url || null,
            bio: profileData.bio || null,
            phone: profileData.phone || null,
            role: 'member',
            created_at: new Date().toISOString(),
          }
        });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // We don't throw here to avoid blocking the sign-up process
          // The profile can be completed later
        }
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account.',
      });
      
      return { success: true, user: authData.user };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to sign up' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to sign out' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link.',
      });
      
      return { success: true };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to send password reset email' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      
      return { success: true };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to update password' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileData) => {
    if (!user) {
      setError({ message: 'User not authenticated' });
      return { success: false, error: { message: 'User not authenticated' } };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return { success: true };
    } catch (err: any) {
      setError({ message: err.message || 'Failed to update profile' });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}
