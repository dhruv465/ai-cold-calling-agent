import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { MoreHorizontal, Phone, Calendar, Clock, User, FileText } from 'lucide-react';
import { Badge } from '../ui/badge';

const CallList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Mock data for calls
  const calls = [
    { 
      id: 'C12345', 
      leadName: 'Rahul Sharma', 
      phoneNumber: '+91 98765 43210', 
      campaignName: 'Insurance Renewal',
      time: '10:32 AM', 
      date: '2025-05-28',
      duration: '4:12',
      status: 'Completed', 
      outcome: 'Interested',
      agent: 'Agent 001'
    },
    { 
      id: 'C12346', 
      leadName: 'Priya Patel', 
      phoneNumber: '+91 87654 32109', 
      campaignName: 'Insurance Renewal',
      time: '10:15 AM', 
      date: '2025-05-28',
      duration: '3:45',
      status: 'Completed', 
      outcome: 'Callback',
      agent: 'Agent 002'
    },
    { 
      id: 'C12347', 
      leadName: 'Amit Kumar', 
      phoneNumber: '+91 76543 21098', 
      campaignName: 'New Product Introduction',
      time: '9:58 AM', 
      date: '2025-05-28',
      duration: '2:30',
      status: 'Completed', 
      outcome: 'Not Interested',
      agent: 'Agent 001'
    },
    { 
      id: 'C12348', 
      leadName: 'Deepa Singh', 
      phoneNumber: '+91 65432 10987', 
      campaignName: 'New Product Introduction',
      time: '9:45 AM', 
      date: '2025-05-28',
      duration: '5:18',
      status: 'Completed', 
      outcome: 'Interested',
      agent: 'Agent 003'
    },
    { 
      id: 'C12349', 
      leadName: 'Vikram Mehta', 
      phoneNumber: '+91 54321 09876', 
      campaignName: 'Customer Feedback Survey',
      time: '9:30 AM', 
      date: '2025-05-28',
      duration: '3:22',
      status: 'Completed', 
      outcome: 'Not Interested',
      agent: 'Agent 002'
    },
  ];
  
  const handleDelete = (id) => {
    toast({
      title: "Call record deleted",
      description: `Call record ${id} has been deleted.`,
    });
  };
  
  const handleScheduleCallback = (id, leadName) => {
    toast({
      title: "Callback scheduled",
      description: `Callback for ${leadName} has been scheduled.`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Call Records</h1>
        <Button onClick={() => navigate('/calls/new')}>
          <Phone className="mr-2 h-4 w-4" />
          New Call
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>
            View and manage your recent call activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Today</Button>
              <Button variant="outline">This Week</Button>
              <Button variant="outline">This Month</Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{call.leadName}</div>
                        <div className="text-xs text-muted-foreground">{call.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{call.campaignName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{call.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <Badge className={
                        call.outcome === 'Interested' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                        call.outcome === 'Callback' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                        'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }>
                        {call.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{call.agent}</span>
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
                          <DropdownMenuItem onClick={() => navigate(`/calls/${call.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/calls/${call.id}/transcript`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View transcript
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleScheduleCallback(call.id, call.leadName)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule callback
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(call.id)} className="text-red-600">
                            Delete record
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>5</strong> of <strong>25</strong> calls
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CallList;
