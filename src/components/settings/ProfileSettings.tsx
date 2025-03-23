
import React from 'react';
import { Save, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProfileSettingsProps {
  animationClass: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ animationClass }) => {
  return (
    <div className={`space-y-6 ${animationClass}`}>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        {/* Profile photo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium mb-1">Profile Photo</p>
            <p className="text-sm text-muted-foreground mb-2">This will be displayed on your profile.</p>
            <div className="flex space-x-2">
              <button className="text-sm py-1.5 px-3 bg-primary text-primary-foreground rounded-lg">
                Upload
              </button>
              <button className="text-sm py-1.5 px-3 border border-border rounded-lg">
                Remove
              </button>
            </div>
          </div>
        </div>
        
        {/* Form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <input 
                type="text" 
                defaultValue="Alex"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <input 
                type="text" 
                defaultValue="Johnson"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              defaultValue="alex@example.com"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <input 
              type="text" 
              defaultValue="Administrator"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              rows={4}
              defaultValue="Product manager and designer with 5+ years of experience in SaaS."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
