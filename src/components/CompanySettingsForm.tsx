import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PolicyAwareForm } from '@/components/ui/PolicyAwareForm';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { PolicyError } from '@/types/errors';

interface CompanySettingsFormData {
  name: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export function CompanySettingsForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CompanySettingsFormData) => {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);
    try {
      // First, check if the user has permission to update company settings
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      if (userRole.role !== 'admin' && userRole.role !== 'manager') {
        throw new Error('You do not have permission to update company settings');
      }

      // Update company settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', user.app_metadata.company_id);

      if (updateError) throw updateError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error: PolicyError) => {
    // Handle specific error cases
    if (error.code === 'ACCESS_DENIED') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Company Settings</h1>
      
      <PolicyAwareForm<CompanySettingsFormData>
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSuccess={() => navigate('/dashboard')}
        onError={handleError}
        className="space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Company Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter company description"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select an industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Company Size
          </label>
          <select
            id="size"
            name="size"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
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
            placeholder="Enter company website"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address (Optional)
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter company address"
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
            placeholder="Enter company phone number"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email (Optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter company email"
          />
        </div>
      </PolicyAwareForm>
    </div>
  );
} 