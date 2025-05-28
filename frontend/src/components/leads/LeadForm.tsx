import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';

const LeadForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [leadData, setLeadData] = React.useState({
    firstName: '',
    lastName: '',
    company: '',
    phoneNumber: '',
    email: '',
    source: 'manual',
    notes: '',
    tags: [],
    priority: 'medium',
    assignedTo: '',
    doNotCall: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeadData({
      ...leadData,
      [name]: value
    });
  };

  const handleCheckboxChange = (name, checked) => {
    setLeadData({
      ...leadData,
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
        title: "Lead created successfully",
        description: `${leadData.firstName} ${leadData.lastName} has been added to your leads.`,
      });
      
      navigate('/leads');
    } catch (error) {
      toast({
        title: "Error creating lead",
        description: "There was a problem creating the lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Lead</h1>
        <Button variant="outline" onClick={() => navigate('/leads')}>
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="additional">Additional Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Enter the basic contact details for this lead.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={leadData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={leadData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={leadData.company}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      value={leadData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={leadData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="doNotCall" 
                    checked={leadData.doNotCall}
                    onCheckedChange={(checked) => handleCheckboxChange('doNotCall', checked)}
                  />
                  <Label htmlFor="doNotCall">Do Not Call (DND)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Add more details about this lead to improve targeting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source</Label>
                  <select 
                    id="source" 
                    name="source" 
                    value={leadData.source}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority" 
                    name="priority" 
                    value={leadData.priority}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <select 
                    id="assignedTo" 
                    name="assignedTo" 
                    value={leadData.assignedTo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    <option value="agent1">Agent 001 (Insurance Specialist)</option>
                    <option value="agent2">Agent 002 (Product Specialist)</option>
                    <option value="agent3">Agent 003 (Customer Service)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    value={leadData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/leads')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
