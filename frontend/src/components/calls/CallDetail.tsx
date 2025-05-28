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
import { MoreHorizontal, Phone, Calendar, Clock, User, FileText, Mic, Play, Pause } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const CallDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for call details
  const callData = {
    id: 'C12345',
    leadName: 'Rahul Sharma',
    phoneNumber: '+91 98765 43210',
    campaignName: 'Insurance Renewal',
    time: '10:32 AM',
    date: '2025-05-28',
    duration: '4:12',
    status: 'Completed',
    outcome: 'Interested',
    agent: 'Agent 001',
    notes: 'Customer showed interest in the premium plan. Requested more information about coverage options.',
    transcript: [
      { speaker: 'Agent', text: 'Hello, am I speaking with Rahul Sharma?', timestamp: '00:00' },
      { speaker: 'Customer', text: 'Yes, this is Rahul speaking.', timestamp: '00:04' },
      { speaker: 'Agent', text: 'Hi Rahul, this is Agent 001 calling from ABC Insurance. I hope I\'m not disturbing you. I\'m calling regarding your insurance policy that\'s coming up for renewal next month.', timestamp: '00:07' },
      { speaker: 'Customer', text: 'Oh yes, I was expecting a call about that.', timestamp: '00:18' },
      { speaker: 'Agent', text: 'Great! We have some new premium plans that offer enhanced coverage at competitive rates. Would you be interested in hearing about them?', timestamp: '00:22' },
      { speaker: 'Customer', text: 'Yes, I would. What kind of coverage options are available?', timestamp: '00:31' },
      { speaker: 'Agent', text: 'We have three tiers of coverage. The basic plan covers...[details about plans]...and the premium plan includes all of these benefits plus international coverage.', timestamp: '00:35' },
      { speaker: 'Customer', text: 'The premium plan sounds interesting. Could you send me more information about it?', timestamp: '01:45' },
      { speaker: 'Agent', text: 'Absolutely! I\'ll send you a detailed email with all the information about our premium plan. Is your email still rahul.sharma@example.com?', timestamp: '01:50' },
      { speaker: 'Customer', text: 'Yes, that\'s correct.', timestamp: '02:01' },
      { speaker: 'Agent', text: 'Perfect. You\'ll receive the email shortly. Would you like me to schedule a follow-up call to discuss after you\'ve had a chance to review the information?', timestamp: '02:04' },
      { speaker: 'Customer', text: 'Yes, that would be helpful. Maybe next week?', timestamp: '02:15' },
      { speaker: 'Agent', text: 'How about next Tuesday at this same time?', timestamp: '02:19' },
      { speaker: 'Customer', text: 'Tuesday works for me.', timestamp: '02:24' },
      { speaker: 'Agent', text: 'Great! I\'ve scheduled our follow-up for next Tuesday at 10:30 AM. Thank you for your time today, Rahul. Have a wonderful day!', timestamp: '02:27' },
      { speaker: 'Customer', text: 'Thank you, you too.', timestamp: '02:38' },
      { speaker: 'Agent', text: 'Goodbye.', timestamp: '02:40' },
      { speaker: 'Customer', text: 'Goodbye.', timestamp: '02:42' }
    ],
    sentiment: {
      overall: 'Positive',
      segments: [
        { time: '00:00-01:00', score: 'Neutral' },
        { time: '01:00-02:00', score: 'Positive' },
        { time: '02:00-03:00', score: 'Positive' }
      ]
    },
    nextSteps: [
      { action: 'Send premium plan information', status: 'Completed' },
      { action: 'Follow-up call scheduled', status: 'Scheduled', date: '2025-06-04 10:30 AM' }
    ]
  };
  
  const handlePlayAudio = () => {
    toast({
      title: "Playing call recording",
      description: "Audio playback started.",
    });
  };
  
  const handleScheduleCallback = () => {
    toast({
      title: "Callback scheduled",
      description: `Callback for ${callData.leadName} has been scheduled.`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Call Details</h1>
          <p className="text-muted-foreground">ID: {callData.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/calls')}>
            Back to Calls
          </Button>
          <Button onClick={handlePlayAudio}>
            <Play className="mr-2 h-4 w-4" />
            Play Recording
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{callData.leadName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{callData.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Campaign:</span>
                <span>{callData.campaignName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Call Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{callData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{callData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Duration:</span>
                <span>{callData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Agent:</span>
                <span>{callData.agent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant="outline">{callData.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Result:</span>
                <Badge className={
                  callData.outcome === 'Interested' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                  callData.outcome === 'Callback' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                  'bg-gray-100 text-gray-800 hover:bg-gray-100'
                }>
                  {callData.outcome}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sentiment:</span>
                <Badge className={
                  callData.sentiment.overall === 'Positive' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                  callData.sentiment.overall === 'Neutral' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                  'bg-red-100 text-red-800 hover:bg-red-100'
                }>
                  {callData.sentiment.overall}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="actions">Actions & Next Steps</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>Call Transcript</CardTitle>
              <CardDescription>
                Complete conversation transcript with timestamps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div className="bg-primary h-2 rounded-full w-[60%]"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">2:42</span>
                </div>
                
                <div className="space-y-4">
                  {callData.transcript.map((entry, index) => (
                    <div key={index} className={`flex gap-4 ${entry.speaker === 'Agent' ? '' : 'justify-end'}`}>
                      <div className={`max-w-[80%] ${entry.speaker === 'Agent' ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-2 rounded-lg ${
                          entry.speaker === 'Agent' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p>{entry.text}</p>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>{entry.speaker}</span>
                          <span>{entry.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Export Transcript
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                AI-powered analysis of customer sentiment during the call
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Overall Sentiment</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-muted rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="font-medium text-green-600">75% Positive</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Sentiment Over Time</h3>
                  <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Sentiment timeline chart will appear here</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Key Moments</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Sentiment</TableHead>
                        <TableHead>Trigger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>00:31</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Positive
                          </Badge>
                        </TableCell>
                        <TableCell>Customer expressed interest in hearing about plans</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>01:45</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Positive
                          </Badge>
                        </TableCell>
                        <TableCell>Customer requested more information about premium plan</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>02:15</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Positive
                          </Badge>
                        </TableCell>
                        <TableCell>Customer agreed to follow-up call</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Actions & Next Steps</CardTitle>
              <CardDescription>
                Follow-up actions and scheduled activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Completed Actions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Completed By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Send premium plan information</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell>Agent 001</TableCell>
                        <TableCell>2025-05-28 11:15 AM</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Scheduled Follow-ups</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Follow-up call</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Scheduled
                          </Badge>
                        </TableCell>
                        <TableCell>Agent 001</TableCell>
                        <TableCell>2025-06-04 10:30 AM</TableCell>
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
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Reassign
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Add New Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="border rounded-lg p-4 cursor-pointer hover:border-primary flex flex-col items-center justify-center text-center">
                          <Phone className="h-8 w-8 mb-2 text-primary" />
                          <h4 className="font-medium">Schedule Call</h4>
                          <p className="text-sm text-muted-foreground">Set up a follow-up call</p>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Follow-up Call</DialogTitle>
                          <DialogDescription>
                            Set up a follow-up call with {callData.leadName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="callDate">Date</Label>
                            <Input id="callDate" type="date" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callTime">Time</Label>
                            <Input id="callTime" type="time" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callNotes">Notes</Label>
                            <Textarea id="callNotes" placeholder="Add notes about the purpose of this call" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleScheduleCallback}>Schedule Call</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary flex flex-col items-center justify-center text-center">
                      <FileText className="h-8 w-8 mb-2 text-primary" />
                      <h4 className="font-medium">Send Email</h4>
                      <p className="text-sm text-muted-foreground">Send follow-up email</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary flex flex-col items-center justify-center text-center">
                      <User className="h-8 w-8 mb-2 text-primary" />
                      <h4 className="font-medium">Assign Task</h4>
                      <p className="text-sm text-muted-foreground">Create a task for team member</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Call Notes</CardTitle>
              <CardDescription>
                Notes and observations from the call
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/10">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Agent Notes</span>
                    <span className="text-sm text-muted-foreground">Added by {callData.agent} on {callData.date}</span>
                  </div>
                  <p>{callData.notes}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newNote">Add Note</Label>
                  <Textarea id="newNote" placeholder="Add your observations or follow-up notes here..." rows={4} />
                  <Button className="mt-2">Save Note</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CallDetail;
