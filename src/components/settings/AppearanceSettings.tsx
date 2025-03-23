
import React from 'react';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AppearanceSettingsProps {
  animationClass: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ 
  animationClass, 
  isDarkMode, 
  setIsDarkMode 
}) => {
  return (
    <div className={`space-y-6 ${animationClass}`}>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        
        <div className="space-y-6">
          {/* Theme selection */}
          <div>
            <p className="font-medium mb-3">Theme</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  !isDarkMode 
                    ? 'border-primary bg-accent/50' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setIsDarkMode(false)}
              >
                <div className="bg-white border border-slate-200 rounded-md p-2 mb-2">
                  <div className="h-2 w-1/2 bg-slate-200 rounded mb-1"></div>
                  <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                </div>
                <div className="text-center font-medium text-sm">Light</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isDarkMode 
                    ? 'border-primary bg-accent/50' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setIsDarkMode(true)}
              >
                <div className="bg-slate-800 border border-slate-700 rounded-md p-2 mb-2">
                  <div className="h-2 w-1/2 bg-slate-600 rounded mb-1"></div>
                  <div className="h-2 w-3/4 bg-slate-600 rounded"></div>
                </div>
                <div className="text-center font-medium text-sm">Dark</div>
              </div>
              
              <div className="border border-border hover:border-muted-foreground rounded-lg p-4 cursor-pointer transition-all">
                <div className="bg-gradient-to-r from-white to-slate-800 border border-slate-300 rounded-md p-2 mb-2">
                  <div className="h-2 w-1/2 bg-slate-400 rounded mb-1"></div>
                  <div className="h-2 w-3/4 bg-slate-400 rounded"></div>
                </div>
                <div className="text-center font-medium text-sm">System</div>
              </div>
            </div>
          </div>
          
          {/* Sidebar position */}
          <div>
            <p className="font-medium mb-3">Sidebar Position</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-primary bg-accent/50 rounded-lg p-4 cursor-pointer">
                <div className="flex h-12 border border-slate-300 rounded">
                  <div className="w-1/4 bg-slate-200 h-full rounded-l"></div>
                  <div className="w-3/4 p-2">
                    <div className="h-2 w-1/2 bg-slate-200 rounded mb-1"></div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="text-center font-medium text-sm mt-2">Left</div>
              </div>
              
              <div className="border border-border hover:border-muted-foreground rounded-lg p-4 cursor-pointer">
                <div className="flex h-12 border border-slate-300 rounded">
                  <div className="w-3/4 p-2">
                    <div className="h-2 w-1/2 bg-slate-200 rounded mb-1"></div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-1/4 bg-slate-200 h-full rounded-r"></div>
                </div>
                <div className="text-center font-medium text-sm mt-2">Right</div>
              </div>
            </div>
          </div>
          
          {/* Density */}
          <div>
            <p className="font-medium mb-3">Density</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="density-compact" 
                  name="density" 
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                />
                <label htmlFor="density-compact" className="ml-2 text-sm">Compact</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="density-normal" 
                  name="density" 
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                  defaultChecked
                />
                <label htmlFor="density-normal" className="ml-2 text-sm">Normal</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="density-comfortable" 
                  name="density" 
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                />
                <label htmlFor="density-comfortable" className="ml-2 text-sm">Comfortable</label>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
