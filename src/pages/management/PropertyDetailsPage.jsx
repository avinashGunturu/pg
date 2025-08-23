import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Bed, 
  Users, 
  Calendar, 
  Star, 
  Edit, 
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch property details using the property list API
        const response = await apiClient.post('/api/property/list', {
          ownerId: ownerId || '68a643b5430dd953da794950',
          id: id
        });

        console.log('Property details response:', response);

        if (response?.data?.code === 0 && response?.data?.data?.properties?.length > 0) {
          setProperty(response.data.data.properties[0]);
        } else {
          throw new Error('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(err.message || 'Failed to fetch property details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && ownerId) {
      fetchPropertyDetails();
    }
  }, [id, ownerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading property details...</p>
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
          <Button onClick={() => navigate('/app/properties')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Property not found</p>
          <Button onClick={() => navigate('/app/properties')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER REVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeLabel = (type) => {
    const typeLabels = {
      'PG': 'Paying Guest',
      'HOSTEL': 'Hostel',
      'APARTMENT': 'Apartment',
      'HOUSE': 'House',
      'VILLA': 'Villa',
      'COLIVE': 'Co-living',
      'OTHER': 'Other'
    };
    return typeLabels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/app/properties')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{property.propertyName}</h1>
            <p className="text-gray-600">Property Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/app/properties/add?edit=true&id=${property._id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Property Status and Type */}
      <div className="flex gap-4">
        <Badge className={getStatusColor(property.propertyStatus)}>
          {property.propertyStatus}
        </Badge>
        <Badge variant="outline">
          {getPropertyTypeLabel(property.propertyType)}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.propertyDescription && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{property.propertyDescription}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Home className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{property.facilities?.totalRooms || 0}</div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">{property.facilities?.totalFloors || 0}</div>
                  <div className="text-sm text-gray-600">Total Floors</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">{property.facilities?.totalBedCapacity || 0}</div>
                  <div className="text-sm text-gray-600">Total Beds</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact & Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    {property.contactDetails?.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{property.contactDetails.phoneNumber}</span>
                      </div>
                    )}
                    {property.contactDetails?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{property.contactDetails.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        {property.propertyAddress?.addressLine1 && (
                          <p>{property.propertyAddress.addressLine1}</p>
                        )}
                        {property.propertyAddress?.addressLine2 && (
                          <p>{property.propertyAddress.addressLine2}</p>
                        )}
                        <p>
                          {property.propertyAddress?.city && `${property.propertyAddress.city}, `}
                          {property.propertyAddress?.state && `${property.propertyAddress.state} `}
                          {property.propertyAddress?.pincode && `${property.propertyAddress.pincode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Options */}
          {property.sharingOptions && property.sharingOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Sharing Options & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.sharingOptions.map((option, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{option.sharingType} Sharing</h4>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          ₹{option.monthlyRent || 0}/month
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Security Deposit:</span>
                          <span className="font-medium ml-2">₹{option.deposit || 0}</span>
                        </div>
                        {option.description && (
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="text-gray-800 mt-1">{option.description}</p>
                          </div>
                        )}
                      </div>
                      
                      {option.depositBreakdown && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="font-medium text-gray-900 mb-2">Deposit Breakdown</h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Damages:</span>
                              <span className="font-medium ml-2">₹{option.depositBreakdown.damages || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cleaning:</span>
                              <span className="font-medium ml-2">₹{option.depositBreakdown.cleaning || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Other:</span>
                              <span className="font-medium ml-2">₹{option.depositBreakdown.other || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Available Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={property.facilities?.kitchenAvailable || false}
                    readOnly
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">Kitchen Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={property.facilities?.commonAreaAvailable || false}
                    readOnly
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">Common Area Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={property.facilities?.parkingAvailable || false}
                    readOnly
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">Parking Available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          {property.availability && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Available from: {property.availability.availableFrom ? 
                        new Date(property.availability.availableFrom).toLocaleDateString() : 
                        'Not specified'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-mono text-xs">{property._id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;