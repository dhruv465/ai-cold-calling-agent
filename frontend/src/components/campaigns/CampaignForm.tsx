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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Mic, Play, Save, Upload, X } from 'lucide-react';

const CampaignForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [campaignData, setCampaignData] = React.useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetLeads: [],
    script: '',
    voiceId: 'default',
    language: 'english',
    callbackStrategy: 'auto',
    maxAttempts: 3,
    isActive: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({
      ...campaignData,
      [name]: value
    });
  };

  const handleSwitchChange = (name, checked) => {
    setCampaignData({
      ...campaignData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Campaign created successfully",
        description: `${campaignData.name} has been created and is ready to start.`,
      });
      
      navigate('/campaigns');
    } catch (error) {
      toast({
        title: "Error creating campaign",
        description: "There was a problem creating the campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestVoice = () => {
    toast({
      title: "Testing voice",
      description: "Playing sample of selected voice...",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="script">Call Script</TabsTrigger>
            <TabsTrigger value="targeting">Lead Targeting</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Define the basic information for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={campaignData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Insurance Promotion"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={campaignData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose and goals of this campaign"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input 
                      id="startDate" 
                      name="startDate" 
                      type="date"
                      value={campaignData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input 
                      id="endDate" 
                      name="endDate" 
                      type="date"
                      value={campaignData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="isActive" 
                    checked={campaignData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Activate campaign immediately after creation</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="script">
            <Card>
              <CardHeader>
                <CardTitle>Call Script</CardTitle>
                <CardDescription>
                  Create the script that will be used by the AI agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="script">Script Content *</Label>
                  <Textarea 
                    id="script" 
                    name="script" 
                    value={campaignData.script}
                    onChange={handleInputChange}
                    placeholder="Enter your call script here. Use variables like {{lead.name}} to personalize the conversation."
                    rows={10}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Use variables like {{lead.name}}, {{lead.company}}, etc. to personalize the script.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Primary Language</Label>
                    <select 
                      id="language" 
                      name="language" 
                      value={campaignData.language}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="tamil">Tamil</option>
                      <option value="telugu">Telugu</option>
                      <option value="bengali">Bengali</option>
                      <option value="marathi">Marathi</option>
                      <option value="gujarati">Gujarati</option>
                      <option value="kannada">Kannada</option>
                      <option value="malayalam">Malayalam</option>
                      <option value="punjabi">Punjabi</option>
                      <option value="urdu">Urdu</option>
                      <option value="odia">Odia</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voiceId">Voice Selection</Label>
                    <div className="flex gap-2">
                      <select 
                        id="voiceId" 
                        name="voiceId" 
                        value={campaignData.voiceId}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="default">Default Voice</option>
                        <option value="male_professional">Male Professional</option>
                        <option value="female_professional">Female Professional</option>
                        <option value="male_friendly">Male Friendly</option>
                        <option value="female_friendly">Female Friendly</option>
                      </select>
                      <Button type="button" variant="outline" onClick={handleTestVoice}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Script
                  </Button>
                  <Button type="button" variant="outline">
                    <Mic className="mr-2 h-4 w-4" />
                    Record Script
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="targeting">
            <Card>
              <CardHeader>
                <CardTitle>Lead Targeting</CardTitle>
                <CardDescription>
                  Select which leads to include in this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Lead Selection Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <h3 className="font-medium mb-2">All Leads</h3>
                      <p className="text-sm text-muted-foreground">Target all available leads in the system</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary border-primary bg-primary/5">
                      <h3 className="font-medium mb-2">Filter Leads</h3>
                      <p className="text-sm text-muted-foreground">Target leads based on specific criteria</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <h3 className="font-medium mb-2">Manual Selection</h3>
                      <p className="text-sm text-muted-foreground">Individually select leads to include</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="font-medium">Filter Criteria</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <select 
                      id="source" 
                      name="source" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Any Source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social">Social Media</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select 
                        id="priority" 
                        name="priority" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Any Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Lead Status</Label>
                      <select 
                        id="status" 
                        name="status" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Any Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="button" variant="outline">
                      Apply Filters
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Selected Leads</h3>
                    <span className="text-sm text-muted-foreground">450 leads selected</span>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-muted/20 h-32 flex items-center justify-center">
                    <p className="text-muted-foreground">Lead preview will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure additional options for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="callbackStrategy">Callback Strategy</Label>
                    <select 
                      id="callbackStrategy" 
                      name="callbackStrategy" 
                      value={campaignData.callbackStrategy}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="auto">Automatic (AI decides)</option>
                      <option value="always">Always schedule callback</option>
                      <option value="never">Never schedule callback</option>
                      <option value="manual">Manual approval required</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Maximum Call Attempts</Label>
                    <Input 
                      id="maxAttempts" 
                      name="maxAttempts" 
                      type="number"
                      min="1"
                      max="10"
                      value={campaignData.maxAttempts}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="font-medium mb-2">Call Scheduling</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input 
                        id="startTime" 
                        name="startTime" 
                        type="time"
                        defaultValue="09:00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input 
                        id="endTime" 
                        name="endTime" 
                        type="time"
                        defaultValue="18:00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 mt-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="flex flex-col items-center">
                        <Label htmlFor={`day-${day}`} className="mb-2">{day}</Label>
                        <Switch id={`day-${day}`} defaultChecked={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day)} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="font-medium mb-2">Compliance Settings</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="dndCheck" defaultChecked />
                    <Label htmlFor="dndCheck">Check DND registry before calling</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="recordCalls" defaultChecked />
                    <Label htmlFor="recordCalls">Record calls for quality and training</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="complianceScript" defaultChecked />
                    <Label htmlFor="complianceScript">Include compliance disclaimer in script</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/campaigns')}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button">Create Campaign</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Campaign</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to create this campaign? {campaignData.isActive ? "It will be activated immediately." : "It will be saved as inactive."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
