import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRound, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Mail, Phone, BadgeCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setEmployees([
        {
          id: 1,
          name: 'Robert Johnson',
          email: 'robert.j@pgmanagement.com',
          phone: '(555) 123-7890',
          position: 'Property Manager',
          department: 'Management',
          joinDate: '2020-03-15',
          status: 'Active',
          properties: ['Sunset Apartments', 'Oakwood Residences'],
          avatar: null,
        },
        {
          id: 2,
          name: 'Maria Garcia',
          email: 'maria.g@pgmanagement.com',
          phone: '(555) 234-8901',
          position: 'Maintenance Supervisor',
          department: 'Maintenance',
          joinDate: '2021-01-10',
          status: 'Active',
          properties: ['Riverside Condos', 'Pine Street Houses', 'Maple Court'],
          avatar: null,
        },
        {
          id: 3,
          name: 'James Wilson',
          email: 'james.w@pgmanagement.com',
          phone: '(555) 345-9012',
          position: 'Leasing Agent',
          department: 'Sales',
          joinDate: '2022-05-20',
          status: 'Active',
          properties: ['Sunset Apartments', 'Oakwood Residences', 'Riverside Condos'],
          avatar: null,
        },
        {
          id: 4,
          name: 'Patricia Lee',
          email: 'patricia.l@pgmanagement.com',
          phone: '(555) 456-0123',
          position: 'Accountant',
          department: 'Finance',
          joinDate: '2021-08-05',
          status: 'Active',
          properties: [],
          avatar: null,
        },
        {
          id: 5,
          name: 'Thomas Brown',
          email: 'thomas.b@pgmanagement.com',
          phone: '(555) 567-1234',
          position: 'Maintenance Technician',
          department: 'Maintenance',
          joinDate: '2022-02-15',
          status: 'On Leave',
          properties: ['Pine Street Houses', 'Maple Court'],
          avatar: null,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id) => {
    // In a real application, this would be an API call
    setEmployees(employees.filter(employee => employee.id !== id));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'On Leave':
        return <Badge className="bg-amber-500">On Leave</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <Button as={Link} to="/employees/add">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>Manage your staff and assignments</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employees..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading employees...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Properties</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No employees found matching your search.
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div key={employee.id} className="grid grid-cols-12 p-4 border-t items-center">
                    <div className="col-span-3 font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-2">
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{employee.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {employee.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {employee.position}
                    </div>
                    <div className="col-span-2">
                      {employee.department}
                    </div>
                    <div className="col-span-2">
                      {employee.properties.length > 0 ? (
                        <div>
                          <span>{employee.properties[0]}</span>
                          {employee.properties.length > 1 && (
                            <span className="text-xs text-muted-foreground"> +{employee.properties.length - 1} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No assignments</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(employee.status)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}`} className="cursor-pointer w-full">
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}/assignments`} className="cursor-pointer w-full">
                              Manage Assignments
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}/performance`} className="cursor-pointer w-full">
                              Performance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(employees.map(employee => employee.department)).size} departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(employee => employee.department === 'Maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maintenance staff (largest department)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employee Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {employees.filter(employee => employee.status === 'On Leave').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Employees currently on leave
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeesPage;