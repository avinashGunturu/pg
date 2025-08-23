import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  X, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  Calendar,
  CreditCard,
  Camera,
  Video,
  FileText,
  Settings,
  Utensils,
  Navigation,
  Bed,
  Home,
  Upload,
  Trash2,
  Building
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import propertyService from '@/api/propertyService';

// Property validation schema
const propertySchema = z.object({
  propertyName: z.string().min(2, 'Property name must be at least 2 characters').max(100, 'Property name must be less than 100 characters'),
  propertyType: z.enum(['PG', 'HOSTEL', 'APARTMENT', 'HOUSE', 'VILLA', 'COLIVE', 'OTHER']),
  propertyDescription: z.string().optional(),
  propertyAddress: z.object({
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be at least 6 characters').max(6, 'Pincode must be exactly 6 characters'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  contactDetails: z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Invalid email format'),
  }),
  highlightedAmenities: z.array(z.object({
    name: z.string().min(1, 'Amenity name is required'),
    description: z.string().optional(),
  })).optional(),
  amenities: z.array(z.object({
    name: z.string().min(1, 'Amenity name is required'),
    description: z.string().optional(),
  })).optional(),
  sharingOptions: z.array(z.object({
    sharingType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOURSHARING', 'FIVESHARING', 'OTHER']),
    monthlyRent: z.number().min(0, 'Monthly rent must be positive'),
    deposit: z.number().min(0, 'Deposit must be positive'),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    virtualTourUrl: z.string().url().optional().or(z.literal('')),
    '360Images': z.array(z.string()).optional(),
    depositBreakdown: z.object({
      damages: z.number().min(0, 'Damages amount must be positive'),
      cleaning: z.number().min(0, 'Cleaning amount must be positive'),
      other: z.number().min(0, 'Other amount must be positive'),
    }),
  })).min(1, 'At least one sharing option is required'),
  rulesAndRegulations: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  facilities: z.object({
    totalRooms: z.number().min(1, 'Total rooms must be at least 1'),
    totalFloors: z.number().min(1, 'Total floors must be at least 1'),
    totalBedCapacity: z.number().min(1, 'Total bed capacity must be at least 1'),
    kitchenAvailable: z.boolean(),
    commonAreaAvailable: z.boolean(),
    parkingAvailable: z.boolean(),
    floorDetails: z.array(z.object({
      floorNumber: z.number().min(0, 'Floor number must be 0 or greater'),
      rooms: z.array(z.object({
        roomName: z.string().min(1, 'Room name is required'),
        roomNumber: z.string().min(1, 'Room number is required'),
        numberOfBeds: z.number().min(1, 'Number of beds must be at least 1'),
        sharingType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOURSHARING', 'FIVESHARING', 'OTHER']),
        metadata: z.record(z.string()).optional(),
      })).optional(),
    })).optional(),
  }),
  availability: z.object({
    availableFrom: z.string().min(1, 'Available from date is required'),
  }),
  nearbyLocations: z.array(z.object({
    name: z.string().min(1, 'Location name is required'),
    distance: z.string().min(1, 'Distance is required'),
    type: z.enum(['TRANSPORTATION', 'SHOPPING', 'HEALTHCARE', 'EDUCATION', 'ENTERTAINMENT', 'OTHER']),
  })).optional(),
  foodDetails: z.array(z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']),
    timings: z.string().min(1, 'Timings are required'),
    weeklyMenu: z.array(z.object({
      day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      menu: z.array(z.string()),
    })),
    description: z.string().optional(),
  })).optional(),
  videoTourUrl: z.string().url().optional().or(z.literal('')),
  floorPlanUrl: z.string().url().optional().or(z.literal('')),
  paymentOptions: z.array(z.string()).optional(),
  targetDemographics: z.array(z.string()).optional(),
  propertyStatus: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'UNDER REVIEW']),
});

const AddOrUpdatePropertyPage = () => {
  const { ownerId } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const totalSteps = 6;
  
  // Check if we're in edit mode
  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    const id = searchParams.get('id');
    
    if (editMode && id) {
      setIsEditMode(true);
      setPropertyId(id);
      fetchPropertyData(id);
    }
  }, [searchParams, ownerId]);
  
  // Fetch property data if in edit mode
  const fetchPropertyData = async (id) => {
    try {
      setIsLoading(true);
      if (!ownerId) {
        setErrorMessage('User information not available');
        setShowErrorModal(true);
        return;
      }
      
      const response = await propertyService.getPropertyByIdAndOwner(ownerId, id);
      if (response && response.data) {
        prefillFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setErrorMessage('Failed to fetch property data. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prefill form with fetched data
  const prefillFormData = (propertyData) => {
    // Check if the response is an array and get the first item
    const data = Array.isArray(propertyData.properties) && propertyData.properties.length > 0 
      ? propertyData.properties[0] 
      : propertyData;
    
    console.log('Prefilling form with data:', data);
    
    // Reset form with the fetched data
    reset(data);
    
    // If there are images, set them
    if (data.images && data.images.length > 0) {
      setUploadedImages(data.images);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyName: '',
      propertyType: 'PG',
      propertyDescription: '',
      propertyAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        latitude: undefined,
        longitude: undefined,
      },
      contactDetails: {
        phoneNumber: '',
        email: '',
      },
      highlightedAmenities: [],
      amenities: [],
      sharingOptions: [
        {
          sharingType: 'SINGLE',
          monthlyRent: 0,
          deposit: 0,
          amenities: [],
          images: [],
          description: '',
          virtualTourUrl: '',
          '360Images': [],
          depositBreakdown: {
            damages: 0,
            cleaning: 0,
            other: 0,
          },
        },
      ],
      rulesAndRegulations: [],
      images: [],
      facilities: {
        totalRooms: 1,
        totalFloors: 1,
        totalBedCapacity: 1,
        kitchenAvailable: false,
        commonAreaAvailable: false,
        parkingAvailable: false,
        floorDetails: [],
      },
      availability: {
        availableFrom: '',
      },
      nearbyLocations: [],
      foodDetails: [],
      videoTourUrl: '',
      floorPlanUrl: '',
      paymentOptions: [],
      targetDemographics: [],
      propertyStatus: 'ACTIVE',
    },
  });

  // Field arrays for dynamic fields
  const {
    fields: highlightedAmenitiesFields,
    append: appendHighlightedAmenity,
    remove: removeHighlightedAmenity,
  } = useFieldArray({
    control,
    name: 'highlightedAmenities',
  });

  const {
    fields: amenitiesFields,
    append: appendAmenity,
    remove: removeAmenity,
  } = useFieldArray({
    control,
    name: 'amenities',
  });

  const {
    fields: sharingOptionsFields,
    append: appendSharingOption,
    remove: removeSharingOption,
  } = useFieldArray({
    control,
    name: 'sharingOptions',
  });

  const {
    fields: rulesFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: 'rulesAndRegulations',
  });

  const {
    fields: nearbyLocationsFields,
    append: appendNearbyLocation,
    remove: removeNearbyLocation,
  } = useFieldArray({
    control,
    name: 'nearbyLocations',
  });

  const {
    fields: foodDetailsFields,
    append: appendFoodDetail,
    remove: removeFoodDetail,
  } = useFieldArray({
    control,
    name: 'foodDetails',
  });
  
  const {
    fields: floorDetailsFields,
    append: appendFloor,
    remove: removeFloor,
  } = useFieldArray({
    control,
    name: 'facilities.floorDetails',
  });

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Function to handle property submission (create or update)
  const submitProperty = async () => {
    try {
      setIsLoading(true);
      
      // Get the current form data directly from the form
      const formData = watch();
      
      // Add ownerId to the data
      const propertyData = {
        ...formData,
        ownerId: ownerId || '68a643b5430dd953da794950', // Fallback ID for testing
        images: uploadedImages?.map(img => img.preview || img), // Handle both formats
      };
      
      console.log('Submitting property data:', propertyData);

      let response, result;
      
      if (isEditMode && propertyId) {
        // Update existing property
        response = await propertyService.updatePropertyById(propertyId, propertyData);
        console.log('Update API Response:', response);
        result = response;
        
        // Check if the API call was successful
        if (result && (result.code === 0 || result.success)) {
          // Navigate directly to properties page after successful update
          navigate('/app/properties');
        } else {
          // Handle API error response
          const errorMsg = result?.message || 'Failed to update property';
          throw new Error(errorMsg);
        }
      } else {
        // Create new property
        response = await apiClient.post('/api/property/create', propertyData);
        console.log('Create API Response:', response);
        result = response.data;
        
        // Check if the API call was successful
        if (result && (result.code === 0 || result.success)) {
          // Navigate directly to properties page after successful creation
          navigate('/app/properties');
        } else {
          // Handle API error response
          const errorMsg = result?.message || 'Failed to create property';
          throw new Error(errorMsg);
        }
      }
      
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} property:`, err);
      setErrorMessage(err.message || `Failed to ${isEditMode ? 'update' : 'create'} property. Please try again.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the original onSubmit for form validation
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    await submitProperty();
  };

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      // Validate current step before proceeding
      let isValid = true;
      
      if (currentStep === 1) {
        // Validate basic information
        const basicInfo = watch(['propertyName', 'propertyType', 'propertyStatus']);
        if (!basicInfo[0] || basicInfo[0].length < 2) {
          setErrorMessage('Property name is required and must be at least 2 characters');
          setShowErrorModal(true);
          isValid = false;
        }
      } else if (currentStep === 2) {
        // Validate contact and address
        const contactInfo = watch(['contactDetails.phoneNumber', 'contactDetails.email']);
        const addressInfo = watch(['propertyAddress.addressLine1', 'propertyAddress.city', 'propertyAddress.state', 'propertyAddress.pincode']);
        
        if (!contactInfo[0] || contactInfo[0].length < 10) {
          setErrorMessage('Valid phone number is required');
          setShowErrorModal(true);
          isValid = false;
        } else if (!contactInfo[1] || !contactInfo[1].includes('@')) {
          setErrorMessage('Valid email is required');
          setShowErrorModal(true);
          isValid = false;
        } else if (!addressInfo[0] || !addressInfo[1] || !addressInfo[2] || !addressInfo[3]) {
          setErrorMessage('All address fields are required');
          setShowErrorModal(true);
          isValid = false;
        }
      } else if (currentStep === 3) {
        // Validate facilities
        const facilities = watch(['facilities.totalRooms', 'facilities.totalFloors', 'facilities.totalBedCapacity', 'availability.availableFrom']);
        const floorDetails = watch('facilities.floorDetails') || [];
        
        if (!facilities[0] || facilities[0] < 1) {
          setErrorMessage('Total rooms must be at least 1');
          setShowErrorModal(true);
          isValid = false;
        } else if (!facilities[1] || facilities[1] < 1) {
          setErrorMessage('Total floors must be at least 1');
          setShowErrorModal(true);
          isValid = false;
        } else if (!facilities[2] || facilities[2] < 1) {
          setErrorMessage('Total bed capacity must be at least 1');
          setShowErrorModal(true);
          isValid = false;
        } else if (!facilities[3]) {
          setErrorMessage('Available from date is required');
          setShowErrorModal(true);
          isValid = false;
        } 
        
        // Validate floor details if they exist
        if (floorDetails.length > 0) {
          // Check if any floor has rooms
          const hasRooms = floorDetails.some(floor => (floor.rooms || []).length > 0);
          
          if (!hasRooms) {
            setErrorMessage('At least one floor must have rooms configured');
            setShowErrorModal(true);
            isValid = false;
          } else {
            // Validate that all rooms have required fields
            for (let i = 0; i < floorDetails.length; i++) {
              const rooms = floorDetails[i].rooms || [];
              for (let j = 0; j < rooms.length; j++) {
                const room = rooms[j];
                if (!room.roomName) {
                  setErrorMessage(`Room name is required for room ${j + 1} on floor ${floorDetails[i].floorNumber}`);
                  setShowErrorModal(true);
                  isValid = false;
                  break;
                }
                if (!room.roomNumber) {
                  setErrorMessage(`Room number is required for room ${j + 1} on floor ${floorDetails[i].floorNumber}`);
                  setShowErrorModal(true);
                  isValid = false;
                  break;
                }
                if (!room.numberOfBeds || room.numberOfBeds < 1) {
                  setErrorMessage(`Number of beds must be at least 1 for room ${j + 1} on floor ${floorDetails[i].floorNumber}`);
                  setShowErrorModal(true);
                  isValid = false;
                  break;
                }
              }
              if (!isValid) break;
            }
          }
        }
      } else if (currentStep === 4) {
        // Validate sharing options
        const sharingOptions = watch('sharingOptions');
        if (!sharingOptions || sharingOptions.length === 0) {
          setErrorMessage('At least one sharing option is required');
          setShowErrorModal(true);
          isValid = false;
        } else {
          for (let i = 0; i < sharingOptions.length; i++) {
            const option = sharingOptions[i];
            if (!option.monthlyRent || option.monthlyRent <= 0) {
              setErrorMessage(`Monthly rent for sharing option ${i + 1} must be greater than 0`);
              setShowErrorModal(true);
              isValid = false;
              break;
            }
            if (!option.deposit || option.deposit <= 0) {
              setErrorMessage(`Security deposit for sharing option ${i + 1} must be greater than 0`);
              setShowErrorModal(true);
              isValid = false;
              break;
            }
          }
        }
      }
      
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const propertyTypes = [
    { value: 'PG', label: 'PG (Paying Guest)' },
    { value: 'HOSTEL', label: 'Hostel' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'COLIVE', label: 'Co-living' },
    { value: 'OTHER', label: 'Other' },
  ];

  const sharingTypes = [
    { value: 'SINGLE', label: 'Single Sharing' },
    { value: 'DOUBLE', label: 'Double Sharing' },
    { value: 'TRIPLE', label: 'Triple Sharing' },
    { value: 'FOURSHARING', label: 'Four Sharing' },
    { value: 'FIVESHARING', label: 'Five Sharing' },
    { value: 'OTHER', label: 'Other' },
  ];

  const locationTypes = [
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'OTHER', label: 'Other' },
  ];

  const mealTypes = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SNACKS', label: 'Snacks' },
  ];

  const days = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Update Property' : 'Add New Property'}</h1>
          <p className="text-gray-600">{isEditMode ? 'Update your existing property listing' : 'Create a new property listing for your PG management system'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Property Name *</Label>
                  <Input
                    id="propertyName"
                    {...register('propertyName')}
                    placeholder="Enter property name"
                    className={errors.propertyName ? 'border-red-500' : ''}
                  />
                  {errors.propertyName && (
                    <p className="text-red-500 text-xs">{errors.propertyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <select
                    id="propertyType"
                    {...register('propertyType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-xs">{errors.propertyType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyDescription">Property Description</Label>
                <textarea
                  id="propertyDescription"
                  {...register('propertyDescription')}
                  placeholder="Describe your property, its unique features, and what makes it special..."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.propertyDescription ? 'border-red-500' : ''}`}
                />
                {errors.propertyDescription && (
                  <p className="text-red-500 text-xs">{errors.propertyDescription.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyStatus">Property Status *</Label>
                <select
                  id="propertyStatus"
                  {...register('propertyStatus')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER REVIEW">Under Review</option>
                </select>
                {errors.propertyStatus && (
                  <p className="text-red-500 text-xs">{errors.propertyStatus.message}</p>
                )}
              </div>

              {/* Property Images Upload */}
              <div className="space-y-4">
                <Label>Property Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload property images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                  </label>
                </div>
                
                {/* Display uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Property"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Contact & Address */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      {...register('contactDetails.phoneNumber')}
                      placeholder="Contact phone number"
                      className={errors.contactDetails?.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.contactDetails?.phoneNumber && (
                      <p className="text-red-500 text-xs">{errors.contactDetails.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('contactDetails.email')}
                      placeholder="Contact email"
                      className={errors.contactDetails?.email ? 'border-red-500' : ''}
                    />
                    {errors.contactDetails?.email && (
                      <p className="text-red-500 text-xs">{errors.contactDetails.email.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      {...register('propertyAddress.addressLine1')}
                      placeholder="Street address"
                      className={errors.propertyAddress?.addressLine1 ? 'border-red-500' : ''}
                    />
                    {errors.propertyAddress?.addressLine1 && (
                      <p className="text-red-500 text-xs">{errors.propertyAddress.addressLine1.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      {...register('propertyAddress.addressLine2')}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('propertyAddress.city')}
                      placeholder="City"
                      className={errors.propertyAddress?.city ? 'border-red-500' : ''}
                    />
                    {errors.propertyAddress?.city && (
                      <p className="text-red-500 text-xs">{errors.propertyAddress.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register('propertyAddress.state')}
                      placeholder="State"
                      className={errors.propertyAddress?.state ? 'border-red-500' : ''}
                    />
                    {errors.propertyAddress?.state && (
                      <p className="text-red-500 text-xs">{errors.propertyAddress.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      {...register('propertyAddress.pincode')}
                      placeholder="6-digit pincode"
                      className={errors.propertyAddress?.pincode ? 'border-red-500' : ''}
                    />
                    {errors.propertyAddress?.pincode && (
                      <p className="text-red-500 text-xs">{errors.propertyAddress.pincode.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Facilities & Capacity */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Facilities & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalRooms">Total Rooms *</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    {...register('facilities.totalRooms', { valueAsNumber: true })}
                    placeholder="Number of rooms"
                    className={errors.facilities?.totalRooms ? 'border-red-500' : ''}
                  />
                  {errors.facilities?.totalRooms && (
                    <p className="text-red-500 text-xs">{errors.facilities.totalRooms.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total Floors *</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    {...register('facilities.totalFloors', { valueAsNumber: true })}
                    placeholder="Number of floors"
                    className={errors.facilities?.totalFloors ? 'border-red-500' : ''}
                  />
                  {errors.facilities?.totalFloors && (
                    <p className="text-red-500 text-xs">{errors.facilities.totalFloors.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalBedCapacity">Total Bed Capacity *</Label>
                  <Input
                    id="totalBedCapacity"
                    type="number"
                    {...register('facilities.totalBedCapacity', { valueAsNumber: true })}
                    placeholder="Total beds available"
                    className={errors.facilities?.totalBedCapacity ? 'border-red-500' : ''}
                  />
                  {errors.facilities?.totalBedCapacity && (
                    <p className="text-red-500 text-xs">{errors.facilities.totalBedCapacity.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Available Facilities</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('facilities.kitchenAvailable')}
                      id="kitchen"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Kitchen Available</span>
                      <p className="text-xs text-gray-500">Shared kitchen facility</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('facilities.commonAreaAvailable')}
                      id="commonArea"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Common Area Available</span>
                      <p className="text-xs text-gray-500">Shared common area</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('facilities.parkingAvailable')}
                      id="parking"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Parking Available</span>
                      <p className="text-xs text-gray-500">Parking facility</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From *</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  {...register('availability.availableFrom')}
                  className={errors.availability?.availableFrom ? 'border-red-500' : ''}
                />
                {errors.availability?.availableFrom && (
                  <p className="text-red-500 text-xs">{errors.availability.availableFrom.message}</p>
                )}
              </div>
              
              {/* Floor Management Section */}
              <div className="space-y-4 mt-6 border-t pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Floor Management</Label>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const totalFloors = getValues('facilities.totalFloors') || 0;
                      const currentFloors = floorDetailsFields.length;
                      
                      if (totalFloors > currentFloors) {
                        // Add more floors
                        for (let i = currentFloors + 1; i <= totalFloors; i++) {
                          floorDetailsAppend({ floorNumber: i, rooms: [] });
                        }
                      } else if (totalFloors < currentFloors) {
                        // Remove excess floors
                        for (let i = currentFloors - 1; i >= totalFloors; i--) {
                          floorDetailsRemove(i);
                        }
                      }
                    }}
                  >
                    Generate Floors
                  </Button>
                </div>
                
                {floorDetailsFields.length > 0 ? (
                  <div className="space-y-6">
                    {floorDetailsFields.map((floorField, floorIndex) => {
                      // Get the rooms field array for this specific floor
                      const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
                        control,
                        name: `facilities.floorDetails.${floorIndex}.rooms`
                      });
                      
                      // Calculate total rooms and beds for this floor
                      const floorRooms = watch(`facilities.floorDetails.${floorIndex}.rooms`) || [];
                      const totalRoomsInFloor = floorRooms.length;
                      const totalBedsInFloor = floorRooms.reduce((sum, room) => sum + (room.numberOfBeds || 0), 0);
                      
                      return (
                        <Card key={floorField.id} className="border border-gray-200">
                          <CardHeader className="bg-gray-50">
                            <CardTitle className="text-md flex items-center justify-between">
                              <span>Floor {floorField.floorNumber}</span>
                              <div className="flex items-center gap-2 text-sm font-normal">
                                <Badge variant="outline" className="bg-blue-50">
                                  {totalRoomsInFloor} Rooms
                                </Badge>
                                <Badge variant="outline" className="bg-green-50">
                                  {totalBedsInFloor} Beds
                                </Badge>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            {roomFields.length > 0 ? (
                              <div className="space-y-4">
                                {roomFields.map((roomField, roomIndex) => (
                                  <div key={roomField.id} className="p-3 border rounded-lg relative">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-red-500"
                                      onClick={() => removeRoom(roomIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`room-name-${floorIndex}-${roomIndex}`}>Room Name</Label>
                                        <Input
                                          id={`room-name-${floorIndex}-${roomIndex}`}
                                          {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.roomName`)}
                                          placeholder="e.g. Master Bedroom"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`room-number-${floorIndex}-${roomIndex}`}>Room Number</Label>
                                        <Input
                                          id={`room-number-${floorIndex}-${roomIndex}`}
                                          {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.roomNumber`)}
                                          placeholder="e.g. 101"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`beds-${floorIndex}-${roomIndex}`}>Number of Beds</Label>
                                        <Input
                                          id={`beds-${floorIndex}-${roomIndex}`}
                                          type="number"
                                          {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.numberOfBeds`, { 
                                            valueAsNumber: true 
                                          })}
                                          placeholder="e.g. 2"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`sharing-${floorIndex}-${roomIndex}`}>Sharing Type</Label>
                                        <Select 
                                          onValueChange={(value) => 
                                            setValue(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.sharingType`, value)
                                          }
                                          defaultValue={watch(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.sharingType`) || ""}
                                        >
                                          <SelectTrigger id={`sharing-${floorIndex}-${roomIndex}`}>
                                            <SelectValue placeholder="Select sharing type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="double">Double</SelectItem>
                                            <SelectItem value="triple">Triple</SelectItem>
                                            <SelectItem value="quad">Quad</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                No rooms added to this floor yet
                              </div>
                            )}
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => appendRoom({ roomName: '', roomNumber: '', numberOfBeds: 1, sharingType: 'single' })}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Room
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {/* Floor Management Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Floor Management Summary</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total Floors</p>
                          <p className="text-xl font-semibold">{floorDetailsFields.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total Rooms</p>
                          <p className="text-xl font-semibold">
                            {floorDetailsFields.reduce((sum, _, floorIndex) => {
                              const floorRooms = watch(`facilities.floorDetails.${floorIndex}.rooms`) || [];
                              return sum + floorRooms.length;
                            }, 0)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total Bed Capacity</p>
                          <p className="text-xl font-semibold">
                            {floorDetailsFields.reduce((sum, _, floorIndex) => {
                              const floorRooms = watch(`facilities.floorDetails.${floorIndex}.rooms`) || [];
                              return sum + floorRooms.reduce((bedsSum, room) => bedsSum + (room.numberOfBeds || 0), 0);
                            }, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                     <Building className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                     <h3 className="text-lg font-medium text-gray-900">No Floors Generated</h3>
                     <p className="text-gray-500 mt-1">Enter the number of floors and click "Generate Floors" to start</p>
                   </div>
                )}
              </div>
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Floors
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {floorDetailsFields.map((floor, floorIndex) => {
                    // Create a nested field array for rooms in this floor
                    const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
                      control,
                      name: `facilities.floorDetails.${floorIndex}.rooms`
                    });
                    
                    return (
                      <div key={floor.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-md font-medium">
                            Floor {floor.floorNumber} {floor.floorNumber === 0 && '(Ground Floor)'}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => appendRoom({
                                roomName: '',
                                roomNumber: '',
                                numberOfBeds: 1,
                                sharingType: 'SINGLE'
                              })}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add Room
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFloor(floorIndex)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                              Remove Floor
                            </Button>
                          </div>
                        </div>
                        
                        {/* Rooms for this floor */}
                        <div className="space-y-3">
                          {roomFields.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No rooms added yet. Click "Add Room" to begin.</p>
                          ) : (
                            roomFields.map((room, roomIndex) => (
                              <div key={room.id} className="border rounded-md p-3 bg-white">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium">Room Details</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRoom(roomIndex)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label htmlFor={`room-name-${floorIndex}-${roomIndex}`} className="text-xs">
                                      Room Name *
                                    </Label>
                                    <Input
                                      id={`room-name-${floorIndex}-${roomIndex}`}
                                      {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.roomName`)}
                                      placeholder="e.g. Master Bedroom"
                                      className="h-8 text-sm"
                                    />
                                    {errors.facilities?.floorDetails?.[floorIndex]?.rooms?.[roomIndex]?.roomName && (
                                      <p className="text-red-500 text-xs">
                                        {errors.facilities.floorDetails[floorIndex].rooms[roomIndex].roomName.message}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label htmlFor={`room-number-${floorIndex}-${roomIndex}`} className="text-xs">
                                      Room Number *
                                    </Label>
                                    <Input
                                      id={`room-number-${floorIndex}-${roomIndex}`}
                                      {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.roomNumber`)}
                                      placeholder="e.g. 101"
                                      className="h-8 text-sm"
                                    />
                                    {errors.facilities?.floorDetails?.[floorIndex]?.rooms?.[roomIndex]?.roomNumber && (
                                      <p className="text-red-500 text-xs">
                                        {errors.facilities.floorDetails[floorIndex].rooms[roomIndex].roomNumber.message}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label htmlFor={`beds-${floorIndex}-${roomIndex}`} className="text-xs">
                                      Number of Beds *
                                    </Label>
                                    <Input
                                      id={`beds-${floorIndex}-${roomIndex}`}
                                      type="number"
                                      min="1"
                                      {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.numberOfBeds`, { 
                                        valueAsNumber: true 
                                      })}
                                      placeholder="e.g. 2"
                                      className="h-8 text-sm"
                                    />
                                    {errors.facilities?.floorDetails?.[floorIndex]?.rooms?.[roomIndex]?.numberOfBeds && (
                                      <p className="text-red-500 text-xs">
                                        {errors.facilities.floorDetails[floorIndex].rooms[roomIndex].numberOfBeds.message}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label htmlFor={`sharing-${floorIndex}-${roomIndex}`} className="text-xs">
                                      Sharing Type *
                                    </Label>
                                    <select
                                      id={`sharing-${floorIndex}-${roomIndex}`}
                                      {...register(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.sharingType`)}
                                      className="w-full h-8 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {sharingTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                          {type.label}
                                        </option>
                                      ))}
                                    </select>
                                    {errors.facilities?.floorDetails?.[floorIndex]?.rooms?.[roomIndex]?.sharingType && (
                                      <p className="text-red-500 text-xs">
                                        {errors.facilities.floorDetails[floorIndex].rooms[roomIndex].sharingType.message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {/* Room summary for this floor */}
                        {roomFields.length > 0 && (
                          <div className="mt-3 text-sm text-gray-600">
                            <p>Total Rooms on Floor {floor.floorNumber}: {roomFields.length}</p>
                            <p>Total Beds on Floor {floor.floorNumber}: {
                              roomFields.reduce((total, _, roomIndex) => {
                                const beds = watch(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.numberOfBeds`) || 0;
                                return total + beds;
                              }, 0)
                            }</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {floorDetailsFields.length === 0 && (
                    <div className="text-center p-6 border border-dashed rounded-lg">
                      <p className="text-gray-500">No floors configured yet.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Enter the number of floors above and click "Generate Floors" to start.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Floor Management Summary */}
                {floorDetailsFields.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Floor Management Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Total Floors: {floorDetailsFields.length}</p>
                        <p className="text-gray-600">Total Rooms: {
                          floorDetailsFields.reduce((total, _, floorIndex) => {
                            const rooms = watch(`facilities.floorDetails.${floorIndex}.rooms`) || [];
                            return total + rooms.length;
                          }, 0)
                        }</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Bed Capacity: {
                          floorDetailsFields.reduce((floorTotal, _, floorIndex) => {
                            const rooms = watch(`facilities.floorDetails.${floorIndex}.rooms`) || [];
                            return floorTotal + rooms.reduce((roomTotal, _, roomIndex) => {
                              const beds = watch(`facilities.floorDetails.${floorIndex}.rooms.${roomIndex}.numberOfBeds`) || 0;
                              return roomTotal + beds;
                            }, 0);
                          }, 0)
                        }</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Sharing Options */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Sharing Options & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sharingOptionsFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">Sharing Option {index + 1}</h4>
                    {sharingOptionsFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSharingOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Sharing Type *</Label>
                      <select
                        {...register(`sharingOptions.${index}.sharingType`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {sharingTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Monthly Rent (₹) *</Label>
                      <Input
                        type="number"
                        {...register(`sharingOptions.${index}.monthlyRent`, { valueAsNumber: true })}
                        placeholder="Monthly rent amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Security Deposit (₹) *</Label>
                      <Input
                        type="number"
                        {...register(`sharingOptions.${index}.deposit`, { valueAsNumber: true })}
                        placeholder="Deposit amount"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      {...register(`sharingOptions.${index}.description`)}
                      placeholder="Describe this sharing option, room size, facilities included..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Damages Deposit (₹)</Label>
                      <Input
                        type="number"
                        {...register(`sharingOptions.${index}.depositBreakdown.damages`, { valueAsNumber: true })}
                        placeholder="Damages amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cleaning Deposit (₹)</Label>
                      <Input
                        type="number"
                        {...register(`sharingOptions.${index}.depositBreakdown.cleaning`, { valueAsNumber: true })}
                        placeholder="Cleaning amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Deposit (₹)</Label>
                      <Input
                        type="number"
                        {...register(`sharingOptions.${index}.depositBreakdown.other`, { valueAsNumber: true })}
                        placeholder="Other amount"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendSharingOption({
                  sharingType: 'SINGLE',
                  monthlyRent: 0,
                  deposit: 0,
                  amenities: [],
                  images: [],
                  description: '',
                  virtualTourUrl: '',
                  '360Images': [],
                  depositBreakdown: {
                    damages: 0,
                    cleaning: 0,
                    other: 0,
                  },
                })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Sharing Option
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Amenities & Rules */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Amenities & Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Highlighted Amenities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Highlighted Amenities</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendHighlightedAmenity({ name: '', description: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>

                {highlightedAmenitiesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`highlightedAmenities.${index}.name`)}
                      placeholder="Amenity name"
                      className="flex-1"
                    />
                    <Input
                      {...register(`highlightedAmenities.${index}.description`)}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHighlightedAmenity(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* General Amenities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">General Amenities</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAmenity({ name: '', description: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>

                {amenitiesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`amenities.${index}.name`)}
                      placeholder="Amenity name"
                      className="flex-1"
                    />
                    <Input
                      {...register(`amenities.${index}.description`)}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAmenity(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Rules and Regulations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Rules and Regulations</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRule('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                {rulesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`rulesAndRegulations.${index}`)}
                      placeholder="Rule or regulation"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Additional Details */}
        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nearby Locations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Nearby Locations</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendNearbyLocation({ name: '', distance: '', type: 'OTHER' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>

                {nearbyLocationsFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      {...register(`nearbyLocations.${index}.name`)}
                      placeholder="Location name"
                    />
                    <Input
                      {...register(`nearbyLocations.${index}.distance`)}
                      placeholder="Distance"
                    />
                    <select
                      {...register(`nearbyLocations.${index}.type`)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {locationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeNearbyLocation(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Food Details with Weekly Menu */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Food Details</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendFoodDetail({ 
                      mealType: 'BREAKFAST', 
                      timings: '', 
                      description: '',
                      weeklyMenu: days.map(day => ({ day: day.value, menu: [''] }))
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meal
                  </Button>
                </div>

                {foodDetailsFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Meal {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFoodDetail(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Meal Type</Label>
                        <select
                          {...register(`foodDetails.${index}.mealType`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {mealTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Timings</Label>
                        <Input
                          {...register(`foodDetails.${index}.timings`)}
                          placeholder="e.g., 8:00 AM - 9:00 AM"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        {...register(`foodDetails.${index}.description`)}
                        placeholder="Description of the meal..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Weekly Menu */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Weekly Menu</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {days.map((day, dayIndex) => (
                          <div key={day.value} className="space-y-2">
                            <Label className="text-xs font-medium">{day.label}</Label>
                            <textarea
                              {...register(`foodDetails.${index}.weeklyMenu.${dayIndex}.menu.0`)}
                              placeholder={`Menu for ${day.label.toLowerCase()}`}
                              rows={2}
                              className="text-xs w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoTourUrl">Video Tour URL</Label>
                  <Input
                    id="videoTourUrl"
                    type="url"
                    {...register('videoTourUrl')}
                    placeholder="https://example.com/video"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorPlanUrl">Floor Plan URL</Label>
                  <Input
                    id="floorPlanUrl"
                    type="url"
                    {...register('floorPlanUrl')}
                    placeholder="https://example.com/floorplan"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submitProperty}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? 'Updating Property...' : 'Creating Property...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{isEditMode ? 'Property Updated!' : 'Property Created!'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your property has been successfully {isEditMode ? 'updated' : 'created'} and is now live.
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              {errorMessage}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowErrorModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => setShowErrorModal(false)}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOrUpdatePropertyPage;
