
import { useState, useEffect } from 'react';
import { useSettingsAnimation } from '@/hooks/useSettingsAnimation';
import SettingsTabs, { settingsTabs } from '@/components/settings/SettingsTabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import PlaceholderSettings from '@/components/settings/PlaceholderSettings';

export default function Settings() {
  const { isLoaded, getAnimationClass } = useSettingsAnimation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);
  
  return (
    <div className="pb-12">
      <div className="mb-8 flex items-center">
        <h1 className={`text-3xl font-bold tracking-tight ${getAnimationClass(100)}`}>Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings sidebar/tabs */}
        <SettingsTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          animationClass={getAnimationClass(200)} 
        />
        
        {/* Settings content */}
        <div className="lg:col-span-3">
          {/* Profile settings */}
          {activeTab === 'profile' && (
            <ProfileSettings animationClass={getAnimationClass(300)} />
          )}
          
          {/* Appearance settings */}
          {activeTab === 'appearance' && (
            <AppearanceSettings 
              animationClass={getAnimationClass(300)} 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
            />
          )}
          
          {/* Placeholders for other tabs */}
          {activeTab !== 'profile' && activeTab !== 'appearance' && (
            <PlaceholderSettings 
              tab={settingsTabs.find(tab => tab.id === activeTab)!} 
              animationClass={getAnimationClass(300)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
