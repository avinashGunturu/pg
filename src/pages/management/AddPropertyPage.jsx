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
  Plus, 
  X, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  Calendar,
  Bed,
  Home,
  Upload,
  Trash2,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

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
  }),
  contactDetails: z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Invalid email format'),
  }),
  facilities: z.object({
    totalRooms: z.number().min(1, 'Total rooms must be at least 1'),
    totalFloors: z.number().min(1, 'Total floors must be at least 1'),
    totalBedCapacity: z.number().min(1, 'Total bed capacity must be at least 1'),
    kitchenAvailable: z.boolean(),
    commonAreaAvailable: z.boolean(),
    parkingAvailable: z.boolean(),
  }),
  availability: z.object({
    availableFrom: z.string().min(1, 'Available from date is required'),
  }),
  sharingOptions: z.array(z.object({
    sharingType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOURSHARING', 'FIVESHARING', 'OTHER']),
    monthlyRent: z.number().min(0, 'Monthly rent must be positive'),
    deposit: z.number().min(0, 'Deposit must be positive'),
    description: z.string().optional(),
    depositBreakdown: z.object({
      damages: z.number().min(0, 'Damages amount must be positive'),
      cleaning: z.number().min(0, 'Cleaning amount must be positive'),
      other: z.number().min(0, 'Other amount must be positive'),
    }),
  })).min(1, 'At least one sharing option is required'),
  highlightedAmenities: z.array(z.object({
    name: z.string().min(1, 'Amenity name is required'),
    description: z.string().optional(),
  })).optional(),
  amenities: z.array(z.object({
    name: z.string().min(1, 'Amenity name is required'),
    description: z.string().optional(),
  })).optional(),
  rulesAndRegulations: z.array(z.string()).optional(),
  nearbyLocations: z.array(z.object({
    name: z.string().min(1, 'Location name is required'),
    distance: z.string().min(1, 'Distance is required'),
    type: z.string().min(1, 'Location type is required'),
  })).optional(),
  foodDetails: z.array(z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'OTHER']),
    timings: z.string().min(1, 'Timings are required'),
    description: z.string().optional(),
    weeklyMenu: z.array(z.object({
      day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      menu: z.array(z.string()),
    })),
  })).optional(),
  videoTourUrl: z.string().url().optional().or(z.literal('')),
  floorPlanUrl: z.string().url().optional().or(z.literal('')),
  propertyStatus: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'UNDER REVIEW']),
});

const AddPropertyPage = () => {
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
  const totalSteps = 7;

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
      },
      contactDetails: {
        phoneNumber: '',
        email: '',
      },
      facilities: {
        totalRooms: 1,
        totalFloors: 1,
        totalBedCapacity: 1,
        kitchenAvailable: false,
        commonAreaAvailable: false,
        parkingAvailable: false,
      },
      availability: {
        availableFrom: '',
      },
      sharingOptions: [
        {
          sharingType: 'SINGLE',
          monthlyRent: 0,
          deposit: 0,
          description: '',
          depositBreakdown: {
            damages: 0,
            cleaning: 0,
            other: 0,
          },
        },
      ],
      highlightedAmenities: [],
      amenities: [],
      rulesAndRegulations: [],
      nearbyLocations: [],
      foodDetails: [],
      videoTourUrl: '',
      floorPlanUrl: '',
      propertyStatus: 'ACTIVE',
    },
  });

  // Field arrays for dynamic fields
  const {
    fields: sharingOptionsFields,
    append: appendSharingOption,
    remove: removeSharingOption,
  } = useFieldArray({
    control,
    name: 'sharingOptions',
  });

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

  // Update field array when form data changes (for edit mode)
  useEffect(() => {
    if (isEditMode && watch('sharingOptions')) {
      // This will ensure the field array is properly initialized with existing data
    }
  }, [isEditMode, watch('sharingOptions')]);

  // Check if we're in edit mode
  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    const id = searchParams.get('id');
    
    console.log('🔍 Edit mode check:', { editMode, id, ownerId });
    
    if (editMode && id) {
      setIsEditMode(true);
      setPropertyId(id);
      console.log('✅ Setting edit mode with property ID:', id);
      fetchPropertyData(id);
    }
  }, [searchParams, ownerId]);

  // Fetch property data if in edit mode
  const fetchPropertyData = async (id) => {
    console.log('🔄 Fetching property data for ID:', id);
    try {
      setIsLoading(true);
      if (!ownerId) {
        console.error('❌ No ownerId available');
        setErrorMessage('User information not available');
        setShowErrorModal(true);
        return;
      }
      
      console.log('📤 Making API call to fetch property data...');
      const response = await apiClient.post('/api/property/list', {
        ownerId: ownerId || '68a643b5430dd953da794950',
        id: id
      });
      
      console.log('📥 Property fetch response:', response);
      
      if (response?.data?.code === 0 && response?.data?.data?.properties?.length > 0) {
        const propertyData = response.data.data.properties[0];
        console.log('✅ Property data fetched successfully:', propertyData);
        prefillFormData(propertyData);
      } else {
        console.error('❌ Property not found in response:', response?.data);
        throw new Error('Property not found');
      }
    } catch (error) {
      console.error('🚨 Error fetching property data:', error);
      setErrorMessage('Failed to fetch property data. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Prefill form with fetched data
  const prefillFormData = (propertyData) => {
    // Reset form with the fetched data
    reset({
      propertyName: propertyData.propertyName || '',
      propertyType: propertyData.propertyType || 'PG',
      propertyDescription: propertyData.propertyDescription || '',
      propertyAddress: {
        addressLine1: propertyData.propertyAddress?.addressLine1 || '',
        addressLine2: propertyData.propertyAddress?.addressLine2 || '',
        city: propertyData.propertyAddress?.city || '',
        state: propertyData.propertyAddress?.state || '',
        pincode: propertyData.propertyAddress?.pincode || '',
      },
      contactDetails: {
        phoneNumber: propertyData.contactDetails?.phoneNumber || '',
        email: propertyData.contactDetails?.email || '',
      },
      facilities: {
        totalRooms: propertyData.facilities?.totalRooms || 1,
        totalFloors: propertyData.facilities?.totalFloors || 1,
        totalBedCapacity: propertyData.facilities?.totalBedCapacity || 1,
        kitchenAvailable: propertyData.facilities?.kitchenAvailable || false,
        commonAreaAvailable: propertyData.facilities?.commonAreaAvailable || false,
        parkingAvailable: propertyData.facilities?.parkingAvailable || false,
      },
      availability: {
        availableFrom: propertyData.availability?.availableFrom ? 
          new Date(propertyData.availability.availableFrom).toISOString().split('T')[0] : '',
      },
      sharingOptions: propertyData.sharingOptions && propertyData.sharingOptions.length > 0 ? 
        propertyData.sharingOptions.map(option => ({
          sharingType: option.sharingType || 'SINGLE',
          monthlyRent: option.monthlyRent || 0,
          deposit: option.deposit || 0,
          description: option.description || '',
          depositBreakdown: {
            damages: option.depositBreakdown?.damages || 0,
            cleaning: option.depositBreakdown?.cleaning || 0,
            other: option.depositBreakdown?.other || 0,
          },
        })) : [
          {
            sharingType: 'SINGLE',
            monthlyRent: 0,
            deposit: 0,
            description: '',
            depositBreakdown: {
              damages: 0,
              cleaning: 0,
              other: 0,
            },
          },
        ],
      highlightedAmenities: propertyData.highlightedAmenities && propertyData.highlightedAmenities.length > 0 ? 
        propertyData.highlightedAmenities.map(amenity => ({
          name: amenity.name || '',
          description: amenity.description || '',
        })) : [],
      amenities: propertyData.amenities && propertyData.amenities.length > 0 ? 
        propertyData.amenities.map(amenity => ({
          name: amenity.name || '',
          description: amenity.description || '',
        })) : [],
      rulesAndRegulations: propertyData.rulesAndRegulations || [],
      nearbyLocations: propertyData.nearbyLocations && propertyData.nearbyLocations.length > 0 ? 
        propertyData.nearbyLocations.map(location => ({
          name: location.name || '',
          distance: location.distance || '',
          type: location.type || 'OTHER',
        })) : [],
      foodDetails: propertyData.foodDetails && propertyData.foodDetails.length > 0 ? 
        propertyData.foodDetails.map(food => {
          console.log('🍽️ Processing food detail:', food);
          
          // Handle the weeklyMenu structure - it's a proper array now
          let weeklyMenu = [];
          if (food.weeklyMenu && food.weeklyMenu.length > 0) {
            console.log('📅 Processing weeklyMenu:', food.weeklyMenu);
            // The weeklyMenu is now a proper array with day and menu fields
            weeklyMenu = food.weeklyMenu.map(dayData => ({
              day: dayData.day || 'MONDAY',
              menu: dayData.menu && Array.isArray(dayData.menu) && dayData.menu.length > 0 ? 
                dayData.menu : ['']
            }));
            console.log('✅ Processed weeklyMenu:', weeklyMenu);
          } else {
            // Default structure if no weeklyMenu data
            weeklyMenu = days.map(day => ({ day: day.value, menu: [''] }));
            console.log('📝 Using default weeklyMenu structure');
          }
          
          const processedFood = {
            mealType: food.mealType || 'BREAKFAST',
            timings: food.timings || '',
            description: food.description || '',
            weeklyMenu: weeklyMenu
          };
          
          console.log('🎯 Final processed food detail:', processedFood);
          return processedFood;
        }) : [],
      videoTourUrl: propertyData.videoTourUrl || '',
      floorPlanUrl: propertyData.floorPlanUrl || '',
      propertyStatus: propertyData.propertyStatus || 'ACTIVE',
    });
    
    // If there are images, set them
    if (propertyData.images && propertyData.images.length > 0) {
      setUploadedImages(propertyData.images.map((img, index) => ({
        id: Date.now() + index,
        preview: img,
        file: null // We don't have the actual file in edit mode
      })));
    }
  };

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

  const onSubmit = async (data) => {
    console.log('🚀 onSubmit function called - this should only happen on button click!');
    console.log('Current step:', currentStep);
    console.log('Total steps:', totalSteps);
    console.log('Is edit mode:', isEditMode);
    
    // Double-check that we're on the final step
    if (currentStep !== totalSteps) {
      console.log('❌ Form submission blocked - not on final step');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare the data according to the API structure
      const propertyData = {

        ...data,
        ownerId: ownerId,
        images: uploadedImages?.map(img => img.preview), // In real app, upload to server first
      };

      console.log('Submitting property data:', propertyData);

      let response, result;
      
      if (isEditMode && propertyId) {
        // Update existing property
        console.log('🔄 Attempting to update property with ID:', propertyId);
        console.log('📤 Update data being sent:', propertyData);
        
        try {
          response = await apiClient.put('/api/property/update', {
            propertyId: propertyId,
            updateData: propertyData
          });
          console.log('✅ Update API Response:', response);
          result = response.data;
          
          if (result && (result.code === 0 || result.success)) {
            console.log('🎉 Property updated successfully!');
            setShowSuccessModal(true);
            // Don't reset form in update mode
          } else {
            console.error('❌ Update failed - API returned error:', result);
            throw new Error(result?.message || 'Failed to update property');
          }
        } catch (updateError) {
          console.error('🚨 Update API call failed:', updateError);
          throw updateError;
        }
      } else {
        // Create new property
        response = await apiClient.post('/api/property/create', propertyData);
        console.log('Create API Response:', response);
        result = response.data;
        
        if (result && (result.code === 0 || result.success)) {
          setShowSuccessModal(true);
          reset();
          setUploadedImages([]);
        //   setCurrentStep(1); // Reset to first step after successful submission
        } else {
          throw new Error(result?.message || 'Failed to create property');
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
      } else if (currentStep === 6) {
        // Validate additional details (nearby locations)
        const nearbyLocations = watch('nearbyLocations');
        if (nearbyLocations && nearbyLocations.length > 0) {
          for (let i = 0; i < nearbyLocations.length; i++) {
            const location = nearbyLocations[i];
            if (!location.name || location.name.trim() === '') {
              setErrorMessage(`Location ${i + 1}: Name is required`);
              setShowErrorModal(true);
              isValid = false;
              break;
            }
            if (!location.distance || location.distance.trim() === '') {
              setErrorMessage(`Location ${i + 1}: Distance is required`);
              setShowErrorModal(true);
              isValid = false;
              break;
            }
            if (!location.type || location.type.trim() === '') {
              setErrorMessage(`Location ${i + 1}: Type is required`);
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

  const days = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];

  const mealTypes = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Loading state for edit mode */}
      {isLoading && isEditMode && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading property data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Update Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update your existing property listing' : 'Create a new property listing for your PG management system'}
          </p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" >
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
                  description: '',
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
              <div className="space-y-2">
                <Label>Highlighted Amenities</Label>
                <div className="space-y-2">
                  {highlightedAmenitiesFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        {...register(`highlightedAmenities.${index}.name`)}
                        placeholder="e.g., Wi-Fi, AC, 24/7 security"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        {...register(`highlightedAmenities.${index}.description`)}
                        placeholder="Description (optional)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendHighlightedAmenity({ name: '', description: '' })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Highlighted Amenity
                  </Button>
                </div>
              </div>

              {/* General Amenities */}
              <div className="space-y-2">
                <Label>General Amenities</Label>
                <div className="space-y-2">
                  {amenitiesFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        {...register(`amenities.${index}.name`)}
                        placeholder="e.g., Gym, Swimming Pool, Parking"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        {...register(`amenities.${index}.description`)}
                        placeholder="Description (optional)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAmenity({ name: '', description: '' })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add General Amenity
                  </Button>
                </div>
              </div>

              {/* Rules & Regulations */}
              <div className="space-y-2">
                <Label>Rules & Regulations</Label>
                <div className="space-y-2">
                  {rulesFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        {...register(`rulesAndRegulations.${index}`)}
                        placeholder="e.g., Check-in time: 2 PM, Noise policy: 10 PM"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRule('')}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
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

        {/* Step 7: Final Review */}
        {currentStep === 7 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Final Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Ready to {isEditMode ? 'Update' : 'Create'} Property</span>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Please review all the information above. Once you're satisfied, click "{isEditMode ? 'Update' : 'Create'} Property" to submit.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Property Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{watch('propertyName') || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{watch('propertyType') || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{watch('propertyStatus') || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{watch('contactDetails.phoneNumber') || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{watch('contactDetails.email') || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Address</h4>
                <div className="text-sm text-gray-600">
                  {watch('propertyAddress.addressLine1') && (
                    <p>{watch('propertyAddress.addressLine1')}</p>
                  )}
                  {watch('propertyAddress.addressLine2') && (
                    <p>{watch('propertyAddress.addressLine2')}</p>
                  )}
                  <p>
                    {watch('propertyAddress.city') && `${watch('propertyAddress.city')}, `}
                    {watch('propertyAddress.state') && `${watch('propertyAddress.state')} `}
                    {watch('propertyAddress.pincode') && `${watch('propertyAddress.pincode')}`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Facilities & Capacity</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-lg">{watch('facilities.totalRooms') || 0}</div>
                    <div className="text-gray-600">Total Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-lg">{watch('facilities.totalFloors') || 0}</div>
                    <div className="text-gray-600">Total Floors</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-lg">{watch('facilities.totalBedCapacity') || 0}</div>
                    <div className="text-gray-600">Total Beds</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Sharing Options</h4>
                <div className="space-y-2">
                  {watch('sharingOptions')?.map((option, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{option.sharingType} Sharing</span>
                      <span className="text-green-600 font-medium">₹{option.monthlyRent || 0}/month</span>
                    </div>
                  ))}
                </div>
              </div>

              {uploadedImages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Images ({uploadedImages.length})</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.preview}
                        alt={`Property ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details Review */}
              {(watch('nearbyLocations')?.length > 0 || watch('foodDetails')?.length > 0 || watch('videoTourUrl') || watch('floorPlanUrl')) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Additional Details</h4>
                  
                  {watch('nearbyLocations')?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Nearby Locations</h5>
                      <div className="space-y-1">
                        {watch('nearbyLocations').map((location, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {location.name} ({location.distance}) - {location.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {watch('foodDetails')?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Food Details</h5>
                      <div className="space-y-1">
                        {watch('foodDetails').map((food, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {food.mealType} - {food.timings}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(watch('videoTourUrl') || watch('floorPlanUrl')) && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Additional URLs</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        {watch('videoTourUrl') && <div>• Video Tour: {watch('videoTourUrl')}</div>}
                        {watch('floorPlanUrl') && <div>• Floor Plan: {watch('floorPlanUrl')}</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Amenities & Rules Review */}
              {(watch('highlightedAmenities')?.length > 0 || watch('amenities')?.length > 0 || watch('rulesAndRegulations')?.length > 0) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Amenities & Rules</h4>
                  
                  {watch('highlightedAmenities')?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Highlighted Amenities</h5>
                      <div className="space-y-1">
                        {watch('highlightedAmenities').map((amenity, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {amenity.name} {amenity.description && `(${amenity.description})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {watch('amenities')?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">General Amenities</h5>
                      <div className="space-y-1">
                        {watch('amenities').map((amenity, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {amenity.name} {amenity.description && `(${amenity.description})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {watch('rulesAndRegulations')?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Rules & Regulations</h5>
                      <div className="space-y-1">
                        {watch('rulesAndRegulations').map((rule, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {rule}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              type="submit"
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
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isEditMode ? 'Property Updated!' : 'Property Created!'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your property has been successfully {isEditMode ? 'updated' : 'created'} and is now live.
            </p>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (isEditMode) {
                  navigate('/app/properties');
                }
              }}
              className="w-full"
            >
              {isEditMode ? 'Back to Properties' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
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

export default AddPropertyPage;
