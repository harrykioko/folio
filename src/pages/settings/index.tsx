import { useState } from 'react';
import { CompanySettingsForm } from '@/components/settings/company-settings';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
  const { companySettings } = useAuth();
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'account', label: 'Account' },
    { id: 'projects', label: 'Projects' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2 text-left rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow">
          {activeTab === 'company' && (
            <CompanySettingsForm initialData={companySettings} />
          )}
          
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-sm text-gray-500">
                  Update your personal account information.
                </p>
              </div>
              
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Account settings coming soon.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Project Settings</h3>
                <p className="text-sm text-gray-500">
                  Manage global project settings.
                </p>
              </div>
              
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Project settings coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
