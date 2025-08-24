import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRound, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Mail, Phone, BadgeCheck, Loader2, Building2, User } from 'lucide-react';
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

const EmployeesPage = () => {
  const { ownerId } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyId: '',
    name: '',
    mobileNumber: '',
    role: ''
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0,
    departmentBreakdown: {}
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        
        // Prepare filter data for API
        const filterData = {
          propertyId: filters.propertyId || '',
          ownerId: ownerId || '68a643b5430dd953da794950',
          name: filters.name || '',
          mobileNumber: filters.mobileNumber || '',
          role: filters.role || ''
        };
        
        console.log('Fetching employees with filters:', filterData);
        
        const response = await apiClient.post('/api/employee/list', filterData);
        console.log('Employee API response:', response);
        
        let employees = response?.data?.data?.employees || response?.data?.employees;
        
        if (Array.isArray(employees)) {
          // Map API response to the format expected by the UI
          const mappedEmployees = employees.map(emp => {
            console.log('🏢 Processing employee:', emp.firstName, emp.lastName);
            console.log('🏢 Employee property data:', { propertyId: emp.propertyId, propertyName: emp.propertyName });
            
            // Handle property reference with enhanced logic
            let propertyName = 'No Assignment';
            
            // Priority 1: Use propertyName field directly if available
            if (emp.propertyName) {
              propertyName = emp.propertyName;
              console.log('🏢 Using direct propertyName:', propertyName);
            }
            // Priority 2: If propertyId is populated object
            else if (emp.propertyId && typeof emp.propertyId === 'object' && emp.propertyId.propertyName) {
              propertyName = emp.propertyId.propertyName;
              console.log('🏢 Using propertyId.propertyName:', propertyName);
            }
            // Priority 3: If propertyId is string, lookup from properties list
            else if (emp.propertyId && typeof emp.propertyId === 'string') {
              const property = properties.find(p => p._id === emp.propertyId);
              propertyName = property ? property.propertyName : 'Assigned Property';
              console.log('🏢 Looked up property from ID:', { propertyId: emp.propertyId, found: !!property, propertyName });
            }
            
            return {
              id: emp._id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email || 'N/A',
              phone: emp.phone?.number ? `${emp.phone.countryCode || '+91'} ${emp.phone.number}` : 'N/A',
              position: emp.role || 'No Role Assigned',
              department: emp.department || 'General',
              joinDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A',
              status: emp.status === 'active' ? 'Active' : emp.status === 'onLeave' ? 'On Leave' : 'Inactive',
              // Enhanced property information
              propertyName: propertyName,
              propertyId: typeof emp.propertyId === 'object' ? emp.propertyId._id : emp.propertyId,
              properties: propertyName !== 'No Assignment' ? [propertyName] : [],
              hasPropertyAssignment: propertyName !== 'No Assignment',
              avatar: null,
              gender: emp.gender,
              address: emp.address,
              emergencyContact: emp.emergencyContact,
              employmentType: emp.employmentType,
              workLocation: emp.workLocation,
              workShift: emp.workShift,
              rawData: emp // Store the raw data for editing
            };
          });
          
          setEmployees(mappedEmployees);
          
          // Calculate stats
          const totalEmps = mappedEmployees.length;
          const activeEmps = mappedEmployees.filter(emp => emp.status === 'Active').length;
          const onLeaveEmps = mappedEmployees.filter(emp => emp.status === 'On Leave').length;
          
          // Calculate department breakdown
          const departmentBreakdown = mappedEmployees.reduce((acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
            return acc;
          }, {});
          
          setStats({
            totalEmployees: totalEmps,
            activeEmployees: activeEmps,
            onLeaveEmployees: onLeaveEmps,
            departmentBreakdown
          });
        } else {
          console.log('No employees found or invalid response format');
          setEmployees([]);
          setStats({
            totalEmployees: 0,
            activeEmployees: 0,
            onLeaveEmployees: 0,
            departmentBreakdown: {}
          });
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Set fallback empty state
        setEmployees([]);
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          onLeaveEmployees: 0,
          departmentBreakdown: {}
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (ownerId) {
      fetchEmployees();
    }
  }, [ownerId, filters]);

  // Fetch properties for filter dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await apiClient.post('/api/property/list', { 
          ownerId: ownerId || '68a643b5430dd953da794950' 
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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      propertyId: '',
      name: '',
      mobileNumber: '',
      role: ''
    });
  };

  const handleDelete = (id) => {
    const employee = employees.find(emp => emp.id === id);
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      setDeleteLoading(true);
      console.log('🗑️ Deleting employee:', employeeToDelete.id);
      
      // Call the delete API
      const response = await apiClient.post('/api/employee/delete', {
        employeeId: employeeToDelete.id
      });
      
      console.log('✅ Delete API response:', response);
      
      if (response?.data && (response.data.code === 0 || response.data.success)) {
        console.log('🎉 Employee deleted successfully!');
        
        // Remove from local state
        const newEmployees = employees.filter(employee => employee.id !== employeeToDelete.id);
        setEmployees(newEmployees);
        
        // Update stats
        const totalEmps = newEmployees.length;
        const activeEmps = newEmployees.filter(emp => emp.status === 'Active').length;
        const onLeaveEmps = newEmployees.filter(emp => emp.status === 'On Leave').length;
        
        const departmentBreakdown = newEmployees.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          totalEmployees: totalEmps,
          activeEmployees: activeEmps,
          onLeaveEmployees: onLeaveEmps,
          departmentBreakdown
        });
        
        // Close confirmation modal and show success
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
        setShowDeleteSuccess(true);
      } else {
        throw new Error(response?.data?.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('❌ Error deleting employee:', error);
      setDeleteErrorMessage(error.message || 'Failed to delete employee. Please try again.');
      setShowDeleteConfirm(false);
      setShowDeleteError(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'On Leave':
      case 'onLeave':
        return <Badge className="bg-amber-500 text-white">On Leave</Badge>;
      case 'Inactive':
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white">{status}</Badge>;
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
        <Button onClick={() => navigate('/app/employees/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards at the top */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {Object.keys(stats.departmentBreakdown).length} departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {stats.onLeaveEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Employees currently on leave
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.totalEmployees - stats.activeEmployees - stats.onLeaveEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Not currently working
            </p>
          </CardContent>
        </Card>
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filter Section */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyFilter">Property</Label>
                  <div className="relative">
                    <select
                      id="propertyFilter"
                      value={filters.propertyId}
                      onChange={(e) => handleFilterChange('propertyId', e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="">All Properties</option>
                      {properties.map((property) => (
                        <option key={property._id} value={property._id}>
                          {property.propertyName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nameFilter">Name</Label>
                  <Input
                    id="nameFilter"
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneFilter">Mobile Number</Label>
                  <Input
                    id="phoneFilter"
                    type="text"
                    placeholder="Search by phone..."
                    value={filters.mobileNumber}
                    onChange={(e) => handleFilterChange('mobileNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleFilter">Role</Label>
                  <Input
                    id="roleFilter"
                    type="text"
                    placeholder="Search by role..."
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading employees...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Assigned Property</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {employees.length === 0 ? (
                    <div>
                      <UserRound className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No employees found</p>
                      <p>Start by adding your first employee to the system.</p>
                      <Button asChild className="mt-4">
                        <Link to="/app/employees/add">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Employee
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No employees match your search</p>
                      <p>Try adjusting your search terms or filters.</p>
                    </div>
                  )}
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
                          <Link 
                            to={`/app/employees/${employee.id}`}
                            className="hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {employee.name}
                          </Link>
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
                      {employee.hasPropertyAssignment ? (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{employee.propertyName}</span>
                            <span className="text-xs text-muted-foreground">Assigned Property</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">No Assignment</span>
                        </div>
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
                            <Link to={`/app/employees/${employee.id}`} className="cursor-pointer w-full">
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/employees/${employee.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem asChild>
                            <Link to={`/app/employees/${employee.id}/assignments`} className="cursor-pointer w-full">
                              Manage Assignments
                            </Link>
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem asChild>
                            <Link to={`/app/employees/${employee.id}/performance`} className="cursor-pointer w-full">
                              Performance
                            </Link>
                          </DropdownMenuItem> */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Employee
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Employee Deleted
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              The employee has been successfully removed from the system.
            </p>
            <Button
              onClick={() => setShowDeleteSuccess(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Delete Error Modal */}
      {showDeleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <UserRound className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Failed
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {deleteErrorMessage}
            </p>
            <Button
              onClick={() => {
                setShowDeleteError(false);
                setDeleteErrorMessage('');
              }}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;