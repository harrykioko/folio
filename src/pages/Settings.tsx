
import { useState, useEffect } from 'react';
import { Save, User, Bell, Shield, Palette, ArrowLeft, CreditCard, Globe } from 'lucide-react';
import Header from '../components/Header';

export default function Settings() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Simulate loading delay for animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
    
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);
  
  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="h-4 w-4" /> }
  ];
  
  // Animation classes
  const getAnimationClass = (delay: number) => {
    return isLoaded 
      ? `opacity-100 translate-y-0 transition-all duration-500 delay-${delay}`
      : 'opacity-0 translate-y-8';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          {/* Header with back button */}
          <div className={`mb-8 flex items-center ${getAnimationClass(100)}`}>
            <button 
              onClick={() => window.history.back()}
              className="mr-3 p-2 rounded-full hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings sidebar/tabs */}
            <div className={`${getAnimationClass(200)}`}>
              <nav className="space-y-1 sticky top-24">
                {tabs.map((tab) => (
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
            
            {/* Settings content */}
            <div className="lg:col-span-3">
              {/* Profile settings */}
              {activeTab === 'profile' && (
                <div className={`space-y-6 ${getAnimationClass(300)}`}>
                  <div className="bg-card rounded-xl border border-border p-6">
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
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="flex items-center space-x-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Appearance settings as an example of another tab */}
              {activeTab === 'appearance' && (
                <div className={`space-y-6 ${getAnimationClass(300)}`}>
                  <div className="bg-card rounded-xl border border-border p-6">
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
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="flex items-center space-x-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Placeholders for other tabs */}
              {activeTab !== 'profile' && activeTab !== 'appearance' && (
                <div className={`${getAnimationClass(300)}`}>
                  <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center py-12">
                    <h2 className="text-xl font-semibold mb-2">{tabs.find(tab => tab.id === activeTab)?.label} Settings</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      This section will contain {activeTab} settings. The content will be implemented in future updates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
