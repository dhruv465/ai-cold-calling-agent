import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Calendar, 
  Filter,
  Share2
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleExport = (format) => {
    toast({
      title: `Exporting as ${format}`,
      description: "Your analytics report is being generated.",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('PDF')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('CSV')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18.2%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.3% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Call Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3:42</div>
            <p className="text-xs text-muted-foreground mt-1">-0:15 from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="leads">Lead Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Call Metrics Over Time</CardTitle>
                <CardDescription>
                  Daily call volume and success rates for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Call metrics chart will appear here</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-sm">Total Calls</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Successful Calls</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Callbacks</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>
                  Distribution of call results
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/20">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Call outcomes chart will appear here</p>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Interested (18.2%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span>Callback (9.9%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Not Interested (71.9%)</span>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Call Duration</CardTitle>
                <CardDescription>
                  Average call duration by outcome
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/20">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Call duration chart will appear here</p>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div>Interested: 4:12 avg</div>
                <div>Callback: 3:45 avg</div>
                <div>Not Interested: 2:30 avg</div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Comparative analysis of campaign effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-muted/20">
              <BarChart3 className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Campaign performance chart will appear here</p>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h4 className="font-medium mb-2">Top Performing Campaigns</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Insurance Renewal Campaign</span>
                      <span className="text-sm font-medium">17.9%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '17.9%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">New Product Introduction</span>
                      <span className="text-sm font-medium">20.5%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '20.5%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Customer Feedback Survey</span>
                      <span className="text-sm font-medium">73.6%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '73.6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Comparative analysis of AI agent effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h4 className="font-medium mb-4">Agent 001 (Insurance Specialist)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">248</div>
                      <div className="text-sm text-muted-foreground">Total Calls</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">21.4%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">4.2/5</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Agent 002 (Product Specialist)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">312</div>
                      <div className="text-sm text-muted-foreground">Total Calls</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">18.9%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">4.0/5</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Agent 003 (Customer Service)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">186</div>
                      <div className="text-sm text-muted-foreground">Total Calls</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">24.2%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold">4.5/5</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Analysis</CardTitle>
              <CardDescription>
                Performance metrics by lead acquisition channel
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-muted/20">
              <PieChart className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Lead source chart will appear here</p>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h4 className="font-medium mb-2">Lead Source Effectiveness</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Website</span>
                      <span className="text-sm font-medium">22.4%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '22.4%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Referral</span>
                      <span className="text-sm font-medium">31.8%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '31.8%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Social Media</span>
                      <span className="text-sm font-medium">15.3%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '15.3%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Event</span>
                      <span className="text-sm font-medium">26.7%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '26.7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Report
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
