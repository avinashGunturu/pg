import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Building2,
  Users,
  Briefcase,
  Clock,
  Edit, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Heart,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Fetching employee details for ID:', id);
        
        // Fetch employee details using the employee list API
        const response = await apiClient.post('/api/employee/list', {
          employeeId: id,
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: '',
          name: '',
          mobileNumber: '',
          role: ''
        });

        console.log('📥 Employee details response:', response);

        if (response?.data?.data?.employees?.length > 0) {
          const employeeData = response.data.data.employees[0];
          console.log('✅ Employee data found:', employeeData);
          setEmployee(employeeData);
        } else {
          throw new Error('Employee not found');
        }
      } catch (err) {
        console.error('❌ Error fetching employee details:', err);
        setError(err.message || 'Failed to fetch employee details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && ownerId) {
      fetchEmployeeDetails();
    }
  }, [id, ownerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/app/employees')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Employee not found</p>
          <Button onClick={() => navigate('/app/employees')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'onLeave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'onLeave':
        return 'On Leave';
      default:
        return status;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPropertyName = () => {
    if (employee.propertyName) {
      return employee.propertyName;
    }
    if (employee.propertyId && typeof employee.propertyId === 'object') {
      return employee.propertyId.propertyName || 'Assigned Property';
    }
    return employee.propertyId ? 'Assigned Property' : 'No Assignment';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/app/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600">Employee Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/app/employees/${employee._id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        </div>
      </div>

      {/* Employee Status and Role */}
      <div className="flex gap-4">
        <Badge className={getStatusColor(employee.status)}>
          {getStatusLabel(employee.status)}
        </Badge>
        {employee.role && (
          <Badge variant="outline">
            {employee.role}
          </Badge>
        )}
        {employee.employmentType && (
          <Badge variant="secondary">
            {employee.employmentType}
          </Badge>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-gray-900">{employee.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(employee.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marital Status</label>
                  <p className="text-gray-900">{employee.maritalStatus || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-gray-900">
                      {employee.phone?.number ? 
                        `${employee.phone.countryCode || '+91'} ${employee.phone.number}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <p className="text-gray-900">{employee.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              {employee.address && (employee.address.street || employee.address.city) && (
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">
                        {[
                          employee.address.street,
                          employee.address.city,
                          employee.address.state,
                          employee.address.zipCode
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Role/Position</label>
                  <p className="text-gray-900">{employee.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employment Type</label>
                  <p className="text-gray-900">{employee.employmentType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Work Location</label>
                  <p className="text-gray-900">{employee.workLocation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Work Shift</label>
                  <p className="text-gray-900">{employee.workShift || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joining Date</label>
                  <p className="text-gray-900">{formatDate(employee.joiningDate)}</p>
                </div>
                {employee.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-gray-900">{formatDate(employee.endDate)}</p>
                  </div>
                )}
              </div>
              
              {employee.reasonForLeaving && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-600">Reason for Leaving</label>
                  <p className="text-gray-900">{employee.reasonForLeaving}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {employee.emergencyContact && (employee.emergencyContact.name || employee.emergencyContact.phone?.number) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Name</label>
                    <p className="text-gray-900">{employee.emergencyContact.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Relationship</label>
                    <p className="text-gray-900">{employee.emergencyContact.relationship || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-gray-900">
                      {employee.emergencyContact.phone?.number ? 
                        `${employee.emergencyContact.phone.countryCode || '+91'} ${employee.emergencyContact.phone.number}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{employee.emergencyContact.address || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                <AvatarFallback className="text-lg">
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                <p className="text-gray-600">{employee.role || 'Employee'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(employee.status)} size="sm">
                    {getStatusLabel(employee.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee ID:</span>
                  <span className="text-sm font-mono">{employee._id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">{getPropertyName()}</p>
                  <p className="text-sm text-gray-600">Assigned Property</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {employee.documents && employee.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employee.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{doc.type}</p>
                        {doc.documentNumber && (
                          <p className="text-xs text-gray-600">{doc.documentNumber}</p>
                        )}
                      </div>
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/app/employees/${employee._id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Employee
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;