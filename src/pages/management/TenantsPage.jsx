import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Mail, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setTenants([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          property: 'Sunset Apartments',
          unit: 'A101',
          leaseStart: '2023-01-15',
          leaseEnd: '2024-01-14',
          status: 'Active',
          paymentStatus: 'Paid',
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '(555) 234-5678',
          property: 'Oakwood Residences',
          unit: 'B205',
          leaseStart: '2023-03-01',
          leaseEnd: '2024-02-29',
          status: 'Active',
          paymentStatus: 'Paid',
        },
        {
          id: 3,
          name: 'Michael Chen',
          email: 'mchen@example.com',
          phone: '(555) 345-6789',
          property: 'Riverside Condos',
          unit: 'C103',
          leaseStart: '2023-05-15',
          leaseEnd: '2024-05-14',
          status: 'Active',
          paymentStatus: 'Late',
        },
        {
          id: 4,
          name: 'Emily Rodriguez',
          email: 'emily.r@example.com',
          phone: '(555) 456-7890',
          property: 'Pine Street Houses',
          unit: 'House 3',
          leaseStart: '2023-02-01',
          leaseEnd: '2024-01-31',
          status: 'Active',
          paymentStatus: 'Paid',
        },
        {
          id: 5,
          name: 'David Wilson',
          email: 'dwilson@example.com',
          phone: '(555) 567-8901',
          property: 'Maple Court',
          unit: 'D404',
          leaseStart: '2023-06-01',
          leaseEnd: '2023-11-30',
          status: 'Notice Given',
          paymentStatus: 'Paid',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id) => {
    // In a real application, this would be an API call
    setTenants(tenants.filter(tenant => tenant.id !== id));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'Notice Given':
        return <Badge className="bg-amber-500">Notice Given</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'Late':
        return <Badge className="bg-red-500">Late</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <Button as={Link} to="/tenants/add">
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Tenant List</CardTitle>
              <CardDescription>Manage your tenants and leases</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tenants..."
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
              <p>Loading tenants...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Tenant</div>
                <div className="col-span-2">Property / Unit</div>
                <div className="col-span-2">Lease Period</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredTenants.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No tenants found matching your search.
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="grid grid-cols-12 p-4 border-t items-center">
                    <div className="col-span-3 font-medium">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div>{tenant.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {tenant.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div>{tenant.property}</div>
                      <div className="text-sm text-muted-foreground">Unit: {tenant.unit}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">
                        {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(tenant.status)}
                    </div>
                    <div className="col-span-2">
                      {getPaymentStatusBadge(tenant.paymentStatus)}
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
                            <Link to={`/tenants/${tenant.id}`} className="cursor-pointer w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/tenants/${tenant.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/tenants/${tenant.id}/lease`} className="cursor-pointer w-full">
                              Manage Lease
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/tenants/${tenant.id}/payments`} className="cursor-pointer w-full">
                              Payment History
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(tenant.id)}
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
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(tenants.map(tenant => tenant.property)).size} properties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lease Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter(tenant => {
                const leaseEnd = new Date(tenant.leaseEnd);
                const today = new Date();
                const diffTime = leaseEnd - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30 && diffDays > 0;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leases expiring in the next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {tenants.filter(tenant => tenant.paymentStatus === 'Late').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tenants with late payments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantsPage;