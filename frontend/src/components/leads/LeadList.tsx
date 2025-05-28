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
import { MoreHorizontal, Plus, Search, Filter, Download, Trash } from 'lucide-react';

const LeadList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Mock data for leads
  const leads = [
    { id: 1, firstName: 'Rahul', lastName: 'Sharma', company: 'Tech Solutions', phoneNumber: '+91 98765 43210', email: 'rahul@example.com', status: 'New', priority: 'High' },
    { id: 2, firstName: 'Priya', lastName: 'Patel', company: 'Global Services', phoneNumber: '+91 87654 32109', email: 'priya@example.com', status: 'Contacted', priority: 'Medium' },
    { id: 3, firstName: 'Amit', lastName: 'Kumar', company: 'Innovative Systems', phoneNumber: '+91 76543 21098', email: 'amit@example.com', status: 'Qualified', priority: 'Medium' },
    { id: 4, firstName: 'Deepa', lastName: 'Singh', company: 'Future Corp', phoneNumber: '+91 65432 10987', email: 'deepa@example.com', status: 'New', priority: 'Low' },
    { id: 5, firstName: 'Vikram', lastName: 'Mehta', company: 'Prime Industries', phoneNumber: '+91 54321 09876', email: 'vikram@example.com', status: 'Contacted', priority: 'High' },
  ];
  
  const handleDelete = (id) => {
    toast({
      title: "Lead deleted",
      description: `Lead ID ${id} has been deleted.`,
    });
  };
  
  const handleExport = () => {
    toast({
      title: "Exporting leads",
      description: "Your leads are being exported to CSV.",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button onClick={() => navigate('/leads/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
          <CardDescription>
            View, search, and manage your leads from a central location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>{lead.phoneNumber}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                        lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        lead.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.priority}
                      </span>
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
                          <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>5</strong> of <strong>5</strong> leads
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LeadList;
