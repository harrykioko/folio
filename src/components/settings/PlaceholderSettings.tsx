
import React from 'react';
import { Card } from '@/components/ui/card';
import { SettingsTab } from './SettingsTabs';

interface PlaceholderSettingsProps {
  tab: SettingsTab;
  animationClass: string;
}

const PlaceholderSettings: React.FC<PlaceholderSettingsProps> = ({ tab, animationClass }) => {
  return (
    <div className={animationClass}>
      <Card className="p-6 flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">{tab.label} Settings</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This section will contain {tab.id} settings. The content will be implemented in future updates.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderSettings;
