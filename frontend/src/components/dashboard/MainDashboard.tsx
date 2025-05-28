import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import { MainLayout } from '../layout/MainLayout';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if APIs are configured on component mount
  React.useEffect(() => {
    const checkApiConfigurations = async () => {
      try {
        // In a real implementation, this would check API configurations from the backend
        const missingConfigs = ['ElevenLabs API Key', 'Language Detection Settings'];
        
        if (missingConfigs.length > 0) {
          toast({
            title: "Configuration Required",
            description: `Please configure the following: ${missingConfigs.join(', ')}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking configurations:', error);
      }
    };
    
    checkApiConfigurations();
  }, [toast]);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Cold Calling Dashboard</h1>
          <Button onClick={() => navigate('/settings')}>Settings</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">876</div>
              <p className="text-xs text-muted-foreground mt-1">Connection rate: 70.2%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18.2%</div>
              <p className="text-xs text-muted-foreground mt-1">+2.3% from last week</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/voice-demo')}
                >
                  <span className="text-lg font-medium">Language Detection Demo</span>
                  <span className="text-xs text-muted-foreground">Test multi-lingual capabilities</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/settings')}
                >
                  <span className="text-lg font-medium">API Configuration</span>
                  <span className="text-xs text-muted-foreground">Set up ElevenLabs and other services</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/campaigns/new')}
                >
                  <span className="text-lg font-medium">Create Campaign</span>
                  <span className="text-xs text-muted-foreground">Start a new calling campaign</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/leads/import')}
                >
                  <span className="text-lg font-medium">Import Leads</span>
                  <span className="text-xs text-muted-foreground">Upload contacts from CSV</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Service health and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ElevenLabs Voice</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Not Configured
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Language Detection</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Not Configured
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Twilio Integration</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Optional
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/settings')}
                >
                  Configure Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to set up your AI cold-calling system</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="pl-2">
                  <span className="font-medium">Configure API Services</span>
                  <p className="text-sm text-muted-foreground ml-6">
                    Set up ElevenLabs for voice synthesis and language detection services in the Settings page.
                  </p>
                </li>
                
                <li className="pl-2">
                  <span className="font-medium">Import Your Leads</span>
                  <p className="text-sm text-muted-foreground ml-6">
                    Upload your contact list via CSV or manually add leads through the Leads section.
                  </p>
                </li>
                
                <li className="pl-2">
                  <span className="font-medium">Create a Campaign</span>
                  <p className="text-sm text-muted-foreground ml-6">
                    Define your campaign goals, target audience, and create call scripts.
                  </p>
                </li>
                
                <li className="pl-2">
                  <span className="font-medium">Test the System</span>
                  <p className="text-sm text-muted-foreground ml-6">
                    Use the Language Detection Demo to verify multi-lingual capabilities before launching.
                  </p>
                </li>
                
                <li className="pl-2">
                  <span className="font-medium">Launch Your Campaign</span>
                  <p className="text-sm text-muted-foreground ml-6">
                    Start your campaign and monitor results in real-time through the dashboard.
                  </p>
                </li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://github.com/dhruv465/ai-cold-calling-agent', '_blank')}>
                View Documentation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MainDashboard;
