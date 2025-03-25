import React, { useEffect } from 'react';
import { useFormData } from '@/hooks/useFormData';
import { PolicyAwareForm } from '@/components/ui/PolicyAwareForm';

// Define the form data type with all properties as string | undefined
type ProfileFormData = {
  [K in 'fullName' | 'bio' | 'email' | 'phone' | 'location' | 'website']: string | undefined;
};

export function ProfileForm({ userId }: { userId: string }) {
  const { data, isLoading, update, isUpdating } = useFormData<ProfileFormData>({
    table: 'profiles',
    id: userId,
    select: 'full_name, bio, email, phone, location, website',
    onSuccess: (data) => {
      // Handle success
      console.log('Profile updated:', data);
    },
    onError: (error) => {
      // Handle error
      console.error('Profile update failed:', error);
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <PolicyAwareForm<ProfileFormData>
      onSubmit={async (formData) => {
        await update(formData);
      }}
      isSubmitting={isUpdating}
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
          defaultValue={data?.fullName}
          placeholder="Full Name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={data?.bio}
          placeholder="Bio"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          defaultValue={data?.email}
          placeholder="Email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          defaultValue={data?.phone}
          placeholder="Phone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          defaultValue={data?.location}
          placeholder="Location"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          defaultValue={data?.website}
          placeholder="Website"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </PolicyAwareForm>
  );
} 