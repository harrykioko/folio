import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PolicyAwareForm } from '@/components/ui/PolicyAwareForm';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { PolicyError } from '@/types/errors';

interface ProfileFormData {
  fullName: string;
  bio: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
}

export function ProfileForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: ProfileFormData) => {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update user metadata to mark profile as complete
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_complete: true }
      });

      if (updateError) throw updateError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error: PolicyError) => {
    // Handle specific error cases
    if (error.code === 'ACCESS_DENIED') {
      navigate('/auth');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      
      <PolicyAwareForm<ProfileFormData>
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSuccess={() => navigate('/dashboard')}
        onError={handleError}
        className="space-y-4"
      >
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location (Optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your location"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website (Optional)
          </label>
          <input
            type="url"
            id="website"
            name="website"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your website URL"
          />
        </div>
      </PolicyAwareForm>
    </div>
  );
} 