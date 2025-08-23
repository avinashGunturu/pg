import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  CreditCard, 
  Camera,
  Edit,
  Save,
  X,
  CheckCircle2,
  Building,
  FileText,
  Calendar,
  Lock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import API_CONFIG from '@/config/api';

// Form validation schema based on owner schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  alternativeNumber: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters').max(6, 'Pincode must be exactly 6 characters'),
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactMobile: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

const ProfilePage = () => {
  const { user, ownerId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [ownerData, setOwnerData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      alternativeNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactMobile: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  // Fetch owner data on component mount
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setIsFetching(true);
        
        // Use ownerId from auth context or fallback to a default
        const ownerIdToUse = ownerId || '68a643b5430dd953da794950';
        
        const response = await apiClient.post('/api/owner', {
          id: ownerIdToUse
        });

        const result = response.data;

        if (result.code === 0 && result.data?.owners?.length > 0) {
          const owner = result.data.owners[0];
          setOwnerData(owner);
          
          // Pre-fill form with fetched data
          setValue('firstName', owner.ownerName?.firstName || '');
          setValue('lastName', owner.ownerName?.lastName || '');
          setValue('alternativeNumber', owner.contact?.alternativeNumber?.replace('+91', '') || '');
          setValue('addressLine1', owner.contact?.address?.addressLine1 || '');
          setValue('addressLine2', owner.contact?.address?.addressLine2 || '');
          setValue('city', owner.contact?.address?.city || '');
          setValue('state', owner.contact?.address?.state || '');
          setValue('pincode', owner.contact?.address?.pincode || '');
          setValue('emergencyContactName', owner.emergencyContact?.name || '');
          setValue('emergencyContactRelation', owner.emergencyContact?.relation || '');
          setValue('emergencyContactMobile', owner.emergencyContact?.mobileNumber?.replace('+91', '') || '');
          setValue('accountHolderName', owner.bankDetails?.accountHolderName || '');
          setValue('bankName', owner.bankDetails?.bankName || '');
          setValue('accountNumber', owner.bankDetails?.accountNumber || '');
          setValue('ifscCode', owner.bankDetails?.ifscCode || '');
        } else {
          throw new Error(result.message || 'Failed to fetch owner data');
        }
      } catch (error) {
        console.error('Error fetching owner data:', error);
        setErrorMessage(error.message || 'Failed to fetch owner data. Please try again.');
        setShowErrorModal(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOwnerData();
  }, [ownerId, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Prepare the data according to the owner schema structure
      const updateData = {
        ownerName: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        contact: {
          alternativeNumber: data.alternativeNumber ? `+91${data.alternativeNumber}` : undefined,
          address: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          },
        },
        emergencyContact: {
          name: data.emergencyContactName,
          relation: data.emergencyContactRelation,
          mobileNumber: data.emergencyContactMobile ? `+91${data.emergencyContactMobile}` : undefined,
        },
        bankDetails: {
          accountHolderName: data.accountHolderName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
        },
      };

      // Make API call to update profile
      const response = await apiClient.put('/api/owner/update', {
        ownerId: ownerId || '68a643b5430dd953da794950',
        updateData: updateData
      });

      const result = response.data;

      if (result.code === 0) {
        // Update local state with new data
        setOwnerData(prev => ({
          ...prev,
          ...updateData,
          audit: {
            ...prev?.audit,
            updatedAt: new Date().toISOString(),
          }
        }));
        
        // Show success modal
        setShowSuccessModal(true);
        setShowEditModal(false);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state while fetching data
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!ownerData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load profile data</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        <Button onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Profile Picture */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  {profileImage || ownerData?.profilePicUrl ? (
                    <img 
                      src={profileImage || ownerData?.profilePicUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Basic Info - Compact Layout */}
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Full Name</span>
                <span className="text-sm text-gray-900 font-medium">{ownerData?.ownerName?.firstName} {ownerData?.ownerName?.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-gray-900">{ownerData?.contact?.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Mobile</span>
                <span className="text-sm text-gray-900">{ownerData?.contact?.mobileNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <Badge className={getStatusColor(ownerData?.ownerStatus)}>
                  {ownerData?.ownerStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-500">Role</span>
                <span className="text-sm text-gray-900 capitalize">{ownerData?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alternative Number */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alternative Number</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {ownerData?.contact?.alternativeNumber || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                  <div className="text-sm text-gray-900 space-y-1">
                    {ownerData?.contact?.address?.addressLine1 && (
                      <p className="font-medium">{ownerData.contact.address.addressLine1}</p>
                    )}
                    {ownerData?.contact?.address?.addressLine2 && (
                      <p className="text-gray-600">{ownerData.contact.address.addressLine2}</p>
                    )}
                    {(ownerData?.contact?.address?.city || ownerData?.contact?.address?.state || ownerData?.contact?.address?.pincode) && (
                      <p className="text-gray-600">
                        {ownerData?.contact?.address?.city && `${ownerData.contact.address.city}, `}
                        {ownerData?.contact?.address?.state && `${ownerData.contact.address.state} `}
                        {ownerData?.contact?.address?.pincode}
                      </p>
                    )}
                    {!ownerData?.contact?.address?.addressLine1 && !ownerData?.contact?.address?.city && (
                      <p className="text-gray-500 italic">Address not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Name</span>
              <span className="text-sm text-gray-900">{ownerData?.emergencyContact?.name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Relation</span>
              <span className="text-sm text-gray-900">{ownerData?.emergencyContact?.relation || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-500">Mobile</span>
              <span className="text-sm text-gray-900">{ownerData?.emergencyContact?.mobileNumber || 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Account Holder</span>
              <span className="text-sm text-gray-900">{ownerData?.bankDetails?.accountHolderName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Bank Name</span>
              <span className="text-sm text-gray-900">{ownerData?.bankDetails?.bankName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Account Number</span>
              <span className="text-sm text-gray-900">{ownerData?.bankDetails?.accountNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-500">IFSC Code</span>
              <span className="text-sm text-gray-900">{ownerData?.bankDetails?.ifscCode || 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Account Status */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={ownerData?.authentication?.accountVerified ? "default" : "secondary"}>
                    {ownerData?.authentication?.accountVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                 
                </div>
              </div>
            </div>

            {/* Account Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {ownerData?.createdAt ? 
                      new Date(ownerData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      'Unknown'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {ownerData?.updatedAt ? 
                      new Date(ownerData.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      'Unknown'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-6" />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alternativeNumber">Alternative Number (Optional)</Label>
                      <Input
                        id="alternativeNumber"
                        placeholder="9876543210"
                        {...register('alternativeNumber')}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-6" />

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        {...register('addressLine1')}
                        className={errors.addressLine1 ? 'border-red-500' : ''}
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-500 text-xs">{errors.addressLine1.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        {...register('addressLine2')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs">{errors.city.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          {...register('state')}
                          className={errors.state ? 'border-red-500' : ''}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-xs">{errors.state.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          {...register('pincode')}
                          className={errors.pincode ? 'border-red-500' : ''}
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-xs">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-6" />

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Contact (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        {...register('emergencyContactName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relation</Label>
                      <Input
                        id="emergencyContactRelation"
                        {...register('emergencyContactRelation')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactMobile">Mobile Number</Label>
                      <Input
                        id="emergencyContactMobile"
                        placeholder="9876543210"
                        {...register('emergencyContactMobile')}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-6" />

                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bank Details (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        {...register('accountHolderName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        {...register('bankName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        {...register('accountNumber')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        {...register('ifscCode')}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Updated!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your profile has been successfully updated.
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Failed</h3>
            <p className="text-sm text-gray-600 mb-4">
              {errorMessage}
            </p>
            <Button
              onClick={() => setShowErrorModal(false)}
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

export default ProfilePage;
