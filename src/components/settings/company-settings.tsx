import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { CompanySettings } from '@/hooks/use-auth';

interface CompanySettingsFormProps {
  initialData?: CompanySettings | null;
}

export function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
  const { companySettings, updateCompanySettings } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || companySettings?.name || '',
    logo_url: initialData?.logo_url || companySettings?.logo_url || '',
    primary_color: initialData?.primary_color || companySettings?.primary_color || '#3498db',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear status messages when form is edited
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { success, error } = await updateCompanySettings(formData);
      if (error) {
        throw error;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Company Settings</h3>
        <p className="text-sm text-gray-500">
          Update your company information and branding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Company Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="logo_url" className="block text-sm font-medium">
            Logo URL
          </label>
          <input
            id="logo_url"
            name="logo_url"
            type="url"
            value={formData.logo_url || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isLoading}
            placeholder="https://example.com/logo.png"
          />
          {formData.logo_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Preview:</p>
              <img 
                src={formData.logo_url} 
                alt="Company logo preview" 
                className="h-12 mt-1 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="primary_color" className="block text-sm font-medium">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              value={formData.primary_color}
              onChange={handleChange}
              className="h-10 w-10 border rounded"
              disabled={isLoading}
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={handleChange}
              name="primary_color"
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
              placeholder="#3498db"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded">
            Company settings updated successfully!
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
