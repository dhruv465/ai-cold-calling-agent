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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { MoreHorizontal, Plus, Play, Pause, Phone, Calendar } from 'lucide-react';

const CampaignList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for campaigns
  const campaigns = [
    { 
      id: 1, 
      name: 'Insurance Renewal Campaign', 
      status: 'Active', 
      startDate: '2025-05-01', 
      endDate: '2025-06-30',
      totalLeads: 500,
      completedCalls: 458,
      successRate: 17.9,
      isActive: true
    },
    { 
      id: 2, 
      name: 'New Product Introduction', 
      status: 'Active', 
      startDate: '2025-05-15', 
      endDate: '2025-07-15',
      totalLeads: 350,
      completedCalls: 312,
      successRate: 20.5,
      isActive: true
    },
    { 
      id: 3, 
      name: 'Customer Feedback Survey', 
      status: 'Active', 
      startDate: '2025-05-10', 
      endDate: '2025-06-10',
      totalLeads: 300,
      completedCalls: 276,
      successRate: 73.6,
      isActive: true
    },
    { 
      id: 4, 
      name: 'Seasonal Promotion', 
      status: 'Draft', 
      startDate: '2025-06-01', 
      endDate: '2025-07-31',
      totalLeads: 450,
      completedCalls: 0,
      successRate: 0,
      isActive: false
    },
    { 
      id: 5, 
      name: 'Loyalty Program', 
      status: 'Completed', 
      startDate: '2025-04-01', 
      endDate: '2025-05-15',
      totalLeads: 600,
      completedCalls: 600,
      successRate: 22.3,
      isActive: false
    }
  ];
  
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = !currentStatus;
    toast({
      title: newStatus ? "Campaign activated" : "Campaign paused",
      description: `Campaign ID ${id} has been ${newStatus ? "activated" : "paused"}.`,
    });
  };
  
  const handleDelete = (id) => {
    toast({
      title: "Campaign deleted",
      description: `Campaign ID ${id} has been deleted.`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Currently running call campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.filter(c => c.status === 'Active').map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${(campaign.completedCalls / campaign.totalLeads) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {campaign.completedCalls}/{campaign.totalLeads}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{campaign.successRate}%</TableCell>
                        <TableCell>{campaign.endDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={campaign.isActive} 
                              onCheckedChange={(checked) => handleToggleStatus(campaign.id, !checked)}
                            />
                            <span className={campaign.isActive ? "text-green-600" : "text-muted-foreground"}>
                              {campaign.isActive ? "Running" : "Paused"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Campaigns</CardTitle>
              <CardDescription>
                Campaigns that are not yet active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Planned Start</TableHead>
                      <TableHead>Total Leads</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.filter(c => c.status === 'Draft').map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>{campaign.startDate}</TableCell>
                        <TableCell>{campaign.startDate}</TableCell>
                        <TableCell>{campaign.totalLeads}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Campaigns</CardTitle>
              <CardDescription>
                Campaigns that have finished running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Total Calls</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.filter(c => c.status === 'Completed').map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>{campaign.startDate} to {campaign.endDate}</TableCell>
                        <TableCell>{campaign.completedCalls}</TableCell>
                        <TableCell>{campaign.successRate}%</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}/analytics`)}>
                                View analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule follow-up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>
                Complete list of all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            campaign.status === 'Draft' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </TableCell>
                        <TableCell>{campaign.startDate} to {campaign.endDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${(campaign.completedCalls / campaign.totalLeads) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {Math.round((campaign.completedCalls / campaign.totalLeads) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{campaign.successRate}%</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                View details
                              </DropdownMenuItem>
                              {campaign.status !== 'Completed' && (
                                <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'Active' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(campaign.id, campaign.isActive)}>
                                  {campaign.isActive ? (
                                    <>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="mr-2 h-4 w-4" />
                                      Resume
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'Draft' && (
                                <DropdownMenuItem>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignList;
