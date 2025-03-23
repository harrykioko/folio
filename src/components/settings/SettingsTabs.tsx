
import React from 'react';
import { User, Bell, Shield, Palette, CreditCard, Globe } from 'lucide-react';

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const settingsTabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Globe className="h-4 w-4" /> }
];

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  animationClass: string;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, setActiveTab, animationClass }) => {
  return (
    <div className={animationClass}>
      <nav className="space-y-1 lg:sticky lg:top-10">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-accent text-foreground' 
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsTabs;
