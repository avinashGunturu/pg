import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Home,
  Briefcase,
  Heart,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const TenantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First fetch properties to resolve property names
        const propertiesResponse = await apiClient.post('/api/property/list', {
          ownerId: ownerId || '68a643b5430dd953da794950',
        });

        const propertiesList = propertiesResponse?.data?.data?.properties || propertiesResponse?.data?.properties || [];
        setProperties(propertiesList);
        console.log('Properties loaded:', propertiesList);

        // Then fetch tenant details
        const response = await apiClient.post('/api/tenant/list', {
          name: '',
          mobile: '',
          email: '',
          tenantId: id, // Pass the tenant ID to filter specific tenant
          ownerId: ownerId || '68a643b5430dd953da794950',
          propertyId: '',
          state: '',
          city: '',
          maritalStatus: ''
        });

        console.log('Tenant details API response:', response);

        const tenants = response?.data?.data?.tenants || response?.data?.tenants || [];
        
        if (tenants.length > 0) {
          const tenantData = tenants[0]; // Get the first (and should be only) tenant
          
          // Resolve property name from propertyId
          if (tenantData.propertyId && propertiesList.length > 0) {
            console.log('Tenant propertyId:', tenantData.propertyId);
            console.log('Available properties:', propertiesList.map(p => ({ id: p.id, _id: p._id, name: p.propertyName })));
            
            const property = propertiesList.find(p => 
              p._id === tenantData.propertyId
            );
            console.log("fined property",property);
            
            if (property) {
              tenantData.resolvedPropertyName = property.propertyName;
              console.log('Property resolved:', property.propertyName);
            } else {
              console.log('No property match found for propertyId:', tenantData.propertyId);
            }
          }
          
          setTenant(tenantData);
          console.log('Tenant data loaded with property resolved:', tenantData);
        } else {
          setError('Tenant not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load tenant details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && ownerId) {
      fetchData();
    }
  }, [id, ownerId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-500"><AlertTriangle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'EVICTED':
        return <Badge className="bg-red-500"><Shield className="h-3 w-3 mr-1" />Evicted</Badge>;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading tenant details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/tenants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Tenant</h3>
            <p className="text-gray-600 text-center">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/tenants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tenant Not Found</h3>
            <p className="text-gray-600 text-center">The requested tenant could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/tenants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">Tenant Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate(`/app/tenants/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tenant
          </Button>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <Avatar className="h-24 w-24 mx-auto md:mx-0">
              <AvatarImage src={tenant.profilePic} alt={fullName} />
              <AvatarFallback className="text-lg">
                {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 md:mt-0 text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                {getStatusBadge(tenant.status)}
                <Badge variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  Age {tenant.personalInfo?.age || 'N/A'}
                </Badge>
                <Badge variant="outline">
                  <Heart className="h-3 w-3 mr-1" />
                  {tenant.personalInfo?.maritalStatus || 'N/A'}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{tenant.contactInfo?.mobileNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{tenant.contactInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{tenant.contactInfo?.address?.city || 'N/A'}, {tenant.contactInfo?.address?.state || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-sm">{tenant.personalInfo?.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-sm">{tenant.personalInfo?.lastName || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Father's Name</label>
                <p className="text-sm">
                  {`${tenant.personalInfo?.fatherFirstName || ''} ${tenant.personalInfo?.fatherLastName || ''}`.trim() || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-sm">{tenant.personalInfo?.gender || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-sm">{formatDate(tenant.personalInfo?.dob)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Marital Status</label>
                <p className="text-sm">{tenant.personalInfo?.maritalStatus || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Mobile Number</label>
              <p className="text-sm">{tenant.contactInfo?.mobileNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Alternative Number</label>
              <p className="text-sm">{tenant.contactInfo?.alternativeNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-sm">{tenant.contactInfo?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm">
                {[
                  tenant.contactInfo?.address?.addressLine1,
                  tenant.contactInfo?.address?.addressLine2,
                  tenant.contactInfo?.address?.city,
                  tenant.contactInfo?.address?.state,
                  tenant.contactInfo?.address?.pincode
                ].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Property & Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Property & Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Property</label>
              <p className="text-sm font-medium">{tenant.resolvedPropertyName || tenant.propertyName || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Floor</label>
                <p className="text-sm">{tenant.roomDetails?.floor || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Room Number</label>
                <p className="text-sm">{tenant.roomDetails?.roomNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Room Type</label>
                <p className="text-sm">{tenant.roomDetails?.roomType || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(tenant.financials?.payPerMonth)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(tenant.financials?.deposit)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-sm">{tenant.financials?.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rent Due Date</label>
                <p className="text-sm">{formatDate(tenant.financials?.rentDueDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lease Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Lease Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Lease Start Date</label>
                <p className="text-sm">{formatDate(tenant.leaseDetails?.leaseStartDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lease End Date</label>
                <p className="text-sm">{formatDate(tenant.leaseDetails?.leaseEndDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Education & Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Education</label>
              <p className="text-sm">{tenant.education || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Designation</label>
              <p className="text-sm">{tenant.employment?.designation || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Employer</label>
              <p className="text-sm">{tenant.employment?.presentEmployedAt || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Office Contact</label>
              <p className="text-sm">{tenant.employment?.officeMobileNumber || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      {tenant.emergencyContacts && tenant.emergencyContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tenant.emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Contact {index + 1}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name: </span>
                      <span>{contact.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Relationship: </span>
                      <span>{contact.relation || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Contact: </span>
                      <span>{contact.contactNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {tenant.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{tenant.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantDetailsPage;