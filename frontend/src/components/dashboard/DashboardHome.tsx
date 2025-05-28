import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '../ui/use-toast';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const stats = {
    totalCalls: 1248,
    successfulConnections: 876,
    callbackRequests: 124,
    conversionRate: 18.2,
    averageCallDuration: '3:42',
    activeAgents: 5
  };
  
  const recentCalls = [
    { id: 'C12345', name: 'Rahul Sharma', time: '10:32 AM', status: 'Completed', outcome: 'Interested' },
    { id: 'C12346', name: 'Priya Patel', time: '10:15 AM', status: 'Completed', outcome: 'Callback' },
    { id: 'C12347', name: 'Amit Kumar', time: '9:58 AM', status: 'Completed', outcome: 'Not Interested' },
    { id: 'C12348', name: 'Deepa Singh', time: '9:45 AM', status: 'Completed', outcome: 'Interested' },
    { id: 'C12349', name: 'Vikram Mehta', time: '9:30 AM', status: 'Completed', outcome: 'Not Interested' }
  ];
  
  const handleConfigCheck = () => {
    // In a real implementation, this would check if APIs are configured
    toast({
      title: "Configuration Check",
      description: "Some API configurations are missing. Please visit the settings page to configure them.",
      variant: "destructive",
    });
    
    navigate('/settings');
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleConfigCheck}>Check Configuration</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.successfulConnections}</div>
            <p className="text-xs text-muted-foreground mt-1">Connection rate: {(stats.successfulConnections / stats.totalCalls * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.3% from last week</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Call Performance</CardTitle>
            <CardDescription>Overview of call metrics for the current week</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Call metrics chart will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Latest call activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalls.map(call => (
                <div key={call.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{call.name}</p>
                    <p className="text-sm text-muted-foreground">{call.time} - {call.outcome}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    call.outcome === 'Interested' ? 'bg-green-100 text-green-800' : 
                    call.outcome === 'Callback' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {call.outcome}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/calls')}>
              View All Calls
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="leads">Lead Sources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Currently running call campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Insurance Renewal Campaign</p>
                      <p className="text-sm text-muted-foreground">458 calls • 82 conversions</p>
                    </div>
                    <div className="text-sm">17.9% conversion</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Product Introduction</p>
                      <p className="text-sm text-muted-foreground">312 calls • 64 conversions</p>
                    </div>
                    <div className="text-sm">20.5% conversion</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Customer Feedback Survey</p>
                      <p className="text-sm text-muted-foreground">276 calls • 203 responses</p>
                    </div>
                    <div className="text-sm">73.6% response rate</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/campaigns')}>
                  Manage Campaigns
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="agents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>AI agent performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Agent 001 (Insurance Specialist)</p>
                      <p className="text-sm text-muted-foreground">248 calls • 21.4% conversion</p>
                    </div>
                    <div className="text-sm">4.2/5 rating</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Agent 002 (Product Specialist)</p>
                      <p className="text-sm text-muted-foreground">312 calls • 18.9% conversion</p>
                    </div>
                    <div className="text-sm">4.0/5 rating</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Agent 003 (Customer Service)</p>
                      <p className="text-sm text-muted-foreground">186 calls • 24.2% conversion</p>
                    </div>
                    <div className="text-sm">4.5/5 rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Performance by lead acquisition channel</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Lead source chart will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardHome;
