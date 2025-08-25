import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Mail, Phone, BadgeCheck, Loader2, Building2, User, Home, Calendar, DollarSign } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const TenantsPage = () => {
  const { ownerId } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    mobile: '',
    email: '',
    tenantId: '',
    propertyId: '',
    state: '',
    city: '',
    maritalStatus: ''
  });
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    pendingTenants: 0,
    inactiveTenants: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Fetch tenants from API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        
        // Prepare filter data for API
        const filterData = {
          name: filters.name || '',
          mobile: filters.mobile || '',
          email: filters.email || '',
          tenantId: filters.tenantId || '',
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: filters.propertyId || '',
          state: filters.state || '',
          city: filters.city || '',
          maritalStatus: filters.maritalStatus || ''
        };
        
        console.log('Fetching tenants with filters:', filterData);
        
        const response = await apiClient.post('/api/tenant/list', filterData);
        console.log('Tenant API response:', response);
        
        let tenants = response?.data?.data?.tenants || response?.data?.tenants || [];
        
        if (Array.isArray(tenants)) {
          // Map API response to the format expected by the UI
          const mappedTenants = tenants.map(tenant => {
            console.log('🏠 Processing tenant:', tenant.personalInfo?.firstName, tenant.personalInfo?.lastName);
            
            // Handle property reference
            let propertyName = 'No Property Assigned';
            if (tenant.propertyName) {
              propertyName = tenant.propertyName;
            } else if (tenant.propertyId && typeof tenant.propertyId === 'object' && tenant.propertyId.propertyName) {
              propertyName = tenant.propertyId.propertyName;
            } else if (tenant.propertyId && typeof tenant.propertyId === 'string') {
              const property = properties.find(p => p._id === tenant.propertyId);
              propertyName = property ? property.propertyName : 'Property Assigned';
            }

            return {
              id: tenant._id,
              name: `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim(),
              email: tenant.contactInfo?.email || 'N/A',
              phone: tenant.contactInfo?.mobileNumber || 'N/A',
              propertyName: propertyName,
              roomNumber: tenant.roomDetails?.roomNumber || 'N/A',
              floor: tenant.roomDetails?.floor || 'N/A',
              roomType: tenant.roomDetails?.roomType || 'N/A',
              monthlyRent: tenant.financials?.payPerMonth || 0,
              deposit: tenant.financials?.deposit || 0,
              leaseStart: tenant.leaseDetails?.leaseStartDate ? new Date(tenant.leaseDetails.leaseStartDate).toLocaleDateString() : 'N/A',
              leaseEnd: tenant.leaseDetails?.leaseEndDate ? new Date(tenant.leaseDetails.leaseEndDate).toLocaleDateString() : 'N/A',
              status: tenant.status || 'PENDING',
              maritalStatus: tenant.personalInfo?.maritalStatus || 'N/A',
              age: tenant.personalInfo?.age || 'N/A',
              city: tenant.contactInfo?.address?.city || 'N/A',
              state: tenant.contactInfo?.address?.state || 'N/A',
              emergencyContacts: tenant.emergencyContacts || [],
              profilePic: tenant.profilePic || null,
              rawData: tenant // Store the raw data for editing
            };
          });
          
          setTenants(mappedTenants);
          
          // Calculate stats
          const totalTenants = mappedTenants.length;
          const activeTenants = mappedTenants.filter(tenant => tenant.status === 'ACTIVE').length;
          const pendingTenants = mappedTenants.filter(tenant => tenant.status === 'PENDING').length;
          const inactiveTenants = mappedTenants.filter(tenant => tenant.status === 'INACTIVE').length;
          
          setStats({
            totalTenants,
            activeTenants,
            pendingTenants,
            inactiveTenants
          });
        } else {
          console.log('No tenants found or invalid response format');
          setTenants([]);
          setStats({
            totalTenants: 0,
            activeTenants: 0,
            pendingTenants: 0,
            inactiveTenants: 0
          });
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        setTenants([]);
        setStats({
          totalTenants: 0,
          activeTenants: 0,
          pendingTenants: 0,
          inactiveTenants: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (ownerId) {
      fetchTenants();
    }
  }, [ownerId, filters, properties]);

  // Fetch properties for filter dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await apiClient.post('/api/property/list', { 
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: '',
          location: '',
          propertyName: '',
          propertyCategory: ''
        });
        if (response?.data?.data?.properties) {
          setProperties(response.data.data.properties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    
    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      mobile: '',
      email: '',
      tenantId: '',
      propertyId: '',
      state: '',
      city: '',
      maritalStatus: ''
    });
  };

  const handleDelete = async (tenantId) => {
    try {
      setDeleteLoading(true);
      
      // Call delete API (you'll need to implement this endpoint)
      await apiClient.delete('/api/tenant/delete', {
        data: { tenantId }
      });
      
      // Remove from local state
      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
      setShowDeleteConfirm(false);
      setTenantToDelete(null);
      setShowDeleteSuccess(true);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setDeleteErrorMessage(error.message || 'Failed to delete tenant');
      setShowDeleteError(true);
      setTimeout(() => setShowDeleteError(false), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'EVICTED':
        return <Badge className="bg-red-500">Evicted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <Button onClick={() => navigate('/app/tenants/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : 'Total registered tenants'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <BadgeCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeTenants}</div>
            <p className="text-xs text-muted-foreground">
              Currently active leases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tenants</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingTenants}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Tenants</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactiveTenants}</div>
            <p className="text-xs text-muted-foreground">
              Inactive or moved out
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>Manage your tenants and lease agreements</CardDescription>
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Filter by name"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="Filter by mobile"
                    value={filters.mobile}
                    onChange={(e) => handleFilterChange('mobile', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Filter by email"
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Property</Label>
                  <select
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md"
                    value={filters.propertyId}
                    onChange={(e) => handleFilterChange('propertyId', e.target.value)}
                  >
                    <option value="">All Properties</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.propertyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="Filter by city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    placeholder="Filter by state"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <select
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md"
                    value={filters.maritalStatus}
                    onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No tenants found</h3>
              <p className="text-gray-600 mb-4">
                {tenants.length === 0 
                  ? "You haven't added any tenants yet." 
                  : "No tenants match your search criteria."
                }
              </p>
              {tenants.length === 0 && (
                <Button onClick={() => navigate('/app/tenants/add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tenant
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium text-sm">
                <div className="col-span-3">Tenant</div>
                <div className="col-span-2">Property & Room</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Lease Period</div>
                <div className="col-span-2">Rent & Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="grid grid-cols-12 p-4 border-t items-center hover:bg-gray-50">
                  <div className="col-span-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={tenant.profilePic} alt={tenant.name} />
                        <AvatarFallback>
                          {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-gray-600">
                          Age: {tenant.age} | {tenant.maritalStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{tenant.propertyName}</div>
                        <div className="text-xs text-gray-600">
                          Floor {tenant.floor}, Room {tenant.roomNumber}
                        </div>
                        <div className="text-xs text-blue-600">{tenant.roomType}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{tenant.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {tenant.city}, {tenant.state}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm">
                      <div>{tenant.leaseStart}</div>
                      <div className="text-gray-600">to {tenant.leaseEnd}</div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium">{formatCurrency(tenant.monthlyRent)}/mo</span>
                      </div>
                      <div>{getStatusBadge(tenant.status)}</div>
                    </div>
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
                          <Link to={`/app/tenants/${tenant.id}`} className="cursor-pointer w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/app/tenants/${tenant.id}/edit`} className="cursor-pointer w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem asChild>
                          <Link to={`/app/tenants/${tenant.id}/lease`} className="cursor-pointer w-full">
                            Manage Lease
                          </Link>
                        </DropdownMenuItem> */}
                        <DropdownMenuItem asChild>
                          <Link to={`/app/tenants/${tenant.id}/payments`} className="cursor-pointer w-full">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Payment History
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Tenant</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {tenantToDelete?.name}? This action cannot be undone.
            </p>
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTenantToDelete(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(tenantToDelete.id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-600 mb-4">Tenant has been deleted successfully.</p>
            <Button 
              onClick={() => {
                setShowDeleteSuccess(false);
                window.location.reload();
              }}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showDeleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-600 mb-4">{deleteErrorMessage}</p>
            <Button onClick={() => setShowDeleteError(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsPage;