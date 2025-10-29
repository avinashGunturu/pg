import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Building2,
  DollarSign,
  FileText,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  Users,
  Briefcase,
  Loader2,
  Home,
  Key,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import transactionService from '@/services/api/transactionService';
import propertyService from '@/services/api/propertyService';
import { Badge } from '@/components/ui/badge';

// Enhanced Zod Schema for Tenant - Dynamic based on edit mode
const createTenantSchema = (isEditMode = false) => {
  const baseSchema = z.object({
    personalInfo: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      fatherFirstName: z.string().optional(),
      fatherLastName: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
      maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).default('SINGLE'),
      age: z.number().min(18, 'Age must be at least 18').max(100, 'Please enter a valid age'),
      dob: z.string().min(1, 'Date of birth is required'),
    }),
    contactInfo: z.object({
      mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
      alternativeNumber: z.string().optional(),
      email: z.string().email('Invalid email address').min(1, 'Email is required'),
      address: z.object({
        addressLine1: z.string().min(1, 'Address line 1 is required'),
        addressLine2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        pincode: z.string().min(1, 'Pincode is required'),
        country: z.string().default('India'),
      }),
    }),
    education: z.string().optional(),
    employment: z.object({
      designation: z.string().optional(),
      presentEmployedAt: z.string().optional(),
      officeMobileNumber: z.string().optional(),
      officeAddress: z.object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        country: z.string().default('India'),
      }),
    }),
    propertyId: z.string().min(1, 'Property selection is required'),
    propertyName: z.string().min(1, 'Property name is required'),
    roomDetails: z.object({
      floor: z.number().min(0, 'Floor must be 0 or greater'),
      roomNumber: z.string().min(1, 'Room number is required'),
      roomType: z.string().min(1, 'Room type is required'),
    }),
    financials: z.object({
      payPerMonth: z.number().min(0, 'Rent amount must be positive'),
      deposit: z.number().min(0, 'Deposit amount must be positive'),
      paymentMethod: z.string().default('Bank Transfer'),
      rentDueDate: z.string().min(1, 'Rent due date is required'),
    }),
    leaseDetails: z.object({
      leaseStartDate: z.string().min(1, 'Lease start date is required'),
      leaseEndDate: z.string().min(1, 'Lease end date is required'),
    }),
    emergencyContacts: z.array(z.object({
      name: z.string().min(1, 'Contact name is required'),
      relation: z.string().min(1, 'Relationship is required'),
      contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
    })).min(1, 'At least one emergency contact is required'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED']).default('PENDING'),
    declaration: z.boolean().refine(val => val === true, 'Declaration must be accepted'),
    notes: z.string().optional(),
  });

  // Add date validations only for create mode (not edit mode)
  if (!isEditMode) {
    return baseSchema.refine((data) => {
      const today = new Date();
      const leaseStart = new Date(data.leaseDetails.leaseStartDate);
      const leaseEnd = new Date(data.leaseDetails.leaseEndDate);
      
      // Lease start date should not be too far in the past (allow 30 days grace period)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      if (leaseStart < thirtyDaysAgo) {
        return false;
      }
      
      // Lease end date should be after start date
      if (leaseEnd <= leaseStart) {
        return false;
      }
      
      return true;
    }, {
      message: 'Please check lease dates. Start date should not be more than 30 days in the past and end date should be after start date.',
      path: ['leaseDetails', 'leaseStartDate'],
    });
  }
  
  // For edit mode, only validate that end date is after start date
  return baseSchema.refine((data) => {
    const leaseStart = new Date(data.leaseDetails.leaseStartDate);
    const leaseEnd = new Date(data.leaseDetails.leaseEndDate);
    
    return leaseEnd > leaseStart;
  }, {
    message: 'Lease end date should be after start date.',
    path: ['leaseDetails', 'leaseEndDate'],
  });
};

const AddTenantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const isEditMode = Boolean(id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertyRooms, setPropertyRooms] = useState({});
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [createdTenantId, setCreatedTenantId] = useState(null);
  const [createdTransactionId, setCreatedTransactionId] = useState(null);
  const [createdDepositTransactionId, setCreatedDepositTransactionId] = useState(null);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [originalTenantData, setOriginalTenantData] = useState(null); // Add this state to track original tenant data

  const totalSteps = 7;
  
  console.log('AddTenantPage initialized - Edit mode:', isEditMode);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTenantSchema(isEditMode)),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        fatherFirstName: '',
        fatherLastName: '',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        age: 18,
        dob: '',
      },
      contactInfo: {
        mobileNumber: '',
        alternativeNumber: '',
        email: '',
        address: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
      },
      education: '',
      employment: {
        designation: '',
        presentEmployedAt: '',
        officeMobileNumber: '',
        officeAddress: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
      },
      propertyId: '',
      propertyName: '',
      roomDetails: {
        floor: 0,
        roomNumber: '',
        roomType: '',
      },
      financials: {
        payPerMonth: 0,
        deposit: 0,
        paymentMethod: 'Bank Transfer',
        rentDueDate: '',
      },
      leaseDetails: {
        leaseStartDate: '',
        leaseEndDate: '',
      },
      emergencyContacts: [
        {
          name: '',
          relation: '',
          contactNumber: '',
        },
      ],
      status: 'PENDING',
      declaration: false,
      notes: '',
    },
  });

  // Watch variables for room selection (declared after useForm)
  const selectedFloor = watch('roomDetails.floor');
  const selectedRoomNumber = watch('roomDetails.roomNumber');

  // Options arrays
  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
  ];

  const paymentMethodOptions = [
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Cheque', label: 'Cheque' },
  ];

  const roomTypeOptions = [
    { value: 'SINGLE', label: 'Single Room' },
    { value: 'DOUBLE', label: 'Double Sharing' },
    { value: 'TRIPLE', label: 'Triple Sharing' },
    { value: 'FOURSHARING', label: 'Four Sharing' },
    { value: 'FIVESHARING', label: 'Five Sharing' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'EVICTED', label: 'Evicted' },
  ];

  // // Fetch properties on component mount
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     try {
  //       const response = await apiClient.post('/api/property/list', {
  //         ownerId: ownerId || '68a643b5430dd953da794950',
  //         propertyId: '',
  //         location: '',
  //         propertyName: '',
  //         propertyCategory: '',
  //       });

  //       if (response?.data?.data?.properties) {
  //         setProperties(response.data.data.properties);
  //         console.log('Properties loaded successfully:', response.data.data.properties,response.data.data.properties.length, 'properties');
  //       }
  //     } catch (error) {
  //       console.error('❌ Error fetching properties:', error);
  //     }
  //   };

  //   fetchProperties();
     
  // }, [ownerId]);

  // // Fetch tenant data for edit mode
  // useEffect(() => {
  //   const fetchTenantData = async () => {
  //     if (!isEditMode || !id || !ownerId) return;
      
  //     try {
  //       setIsLoading(true);
  //       console.log('Fetching tenant data for edit mode, ID:', id);
        
  //       // Use the same tenant list API with tenantId filter
  //       const response = await apiClient.post('/api/tenant/list', {
  //         name: '',
  //         mobile: '',
  //         email: '',
  //         tenantId: id,
  //         ownerId: ownerId || '68a643b5430dd953da794950',
  //         propertyId: '',
  //         state: '',
  //         city: '',
  //         maritalStatus: ''
  //       });

  //       console.log('📥 Tenant data API response:', response);

  //       const tenants = response?.data?.data?.tenants || response?.data?.tenants || [];
        
  //       if (tenants.length > 0) {
  //         const tenantData = tenants[0];
  //         console.log('Tenant data fetched successfully:', tenantData);
          
  //         // Transform and prefill form data
  //         await prefillFormData(tenantData);
  //       } else {
  //         setErrorMessage('Tenant not found');
  //         setShowErrorModal(true);
  //       }
  //     } catch (error) {
  //       console.error('❌ Error fetching tenant data:', error);
  //       setErrorMessage('Failed to load tenant data. Please try again.');
  //       setShowErrorModal(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchTenantData();
  // }, [isEditMode, id, ownerId]);

  // Single useEffect to handle both API calls sequentially
useEffect(() => {
  const fetchDataSequentially = async () => {
    try {
      // Step 1: Always fetch properties first
      console.log('Step 1: Fetching properties...');
      
      const propertiesResponse = await apiClient.post('/api/property/list', {
        ownerId: ownerId || '68a643b5430dd953da794950',
        propertyId: '',
        location: '',
        propertyName: '',
        propertyCategory: '',
      });

      if (propertiesResponse?.data?.data?.properties) {
        setProperties(propertiesResponse.data.data.properties);
        console.log('Properties loaded successfully:', propertiesResponse.data.data.properties, propertiesResponse.data.data.properties.length, 'properties');
        const propertiesData = propertiesResponse.data.data.properties;
        // Step 2: Only fetch tenant data if in edit mode and we have required IDs
        if (isEditMode && id && ownerId) {
          console.log('Step 2: Fetching tenant data for edit mode, ID:', id);
          setIsLoading(true);
          
          const tenantResponse = await apiClient.post('/api/tenant/list', {
            name: '',
            mobile: '',
            email: '',
            tenantId: id,
            ownerId: ownerId || '68a643b5430dd953da794950',
            propertyId: '',
            state: '',
            city: '',
            maritalStatus: ''
          });

          console.log('📥 Tenant data API response:', tenantResponse);

          const tenants = tenantResponse?.data?.data?.tenants || tenantResponse?.data?.tenants || [];
          
          if (tenants.length > 0) {
            const tenantData = tenants[0];
            console.log('Tenant data fetched successfully:', tenantData);
            
            // Transform and prefill form data
            await prefillFormData(tenantData,propertiesData);
          } else {
            setErrorMessage('Tenant not found');
            setShowErrorModal(true);
          }
        }
      } else {
        console.log('No properties found in response');
      }
    } catch (error) {
      console.error('❌ Error in sequential data fetch:', error);
      setErrorMessage('Failed to load data. Please try again.');
      setShowErrorModal(true);
    } finally {
      // Only set loading to false if we were actually loading tenant data
      if (isEditMode && id && ownerId) {
        setIsLoading(false);
      }
    }
  };

  // Only run if we have ownerId (minimum requirement)
  if (ownerId) {
    fetchDataSequentially();
  }
}, [ownerId, isEditMode, id]);

  // Enhanced prefill form with comprehensive validation
  const prefillFormData = async (tenantData,properties) => {
    console.log('Starting comprehensive form prefilling for edit mode');
    
    // Store original tenant data for edit mode
    setOriginalTenantData(tenantData);
    
    // Validate tenant data exists
    if (!tenantData) {
      console.error('No tenant data provided for prefilling');
      return;
    }
    
    // Transform tenant data to match form structure with enhanced validation
    const formData = {
      personalInfo: {
        firstName: tenantData.personalInfo?.firstName || '',
        lastName: tenantData.personalInfo?.lastName || '',
        fatherFirstName: tenantData.personalInfo?.fatherFirstName || '',
        fatherLastName: tenantData.personalInfo?.fatherLastName || '',
        gender: tenantData.personalInfo?.gender || 'MALE',
        maritalStatus: tenantData.personalInfo?.maritalStatus || 'SINGLE',
        age: Number(tenantData.personalInfo?.age) || 18,
        dob: tenantData.personalInfo?.dob ? new Date(tenantData.personalInfo.dob).toISOString().split('T')[0] : '',
      },
      contactInfo: {
        mobileNumber: tenantData.contactInfo?.mobileNumber || '',
        alternativeNumber: tenantData.contactInfo?.alternativeNumber || '',
        email: tenantData.contactInfo?.email || '',
        address: {
          addressLine1: tenantData.contactInfo?.address?.addressLine1 || '',
          addressLine2: tenantData.contactInfo?.address?.addressLine2 || '',
          city: tenantData.contactInfo?.address?.city || '',
          state: tenantData.contactInfo?.address?.state || '',
          pincode: tenantData.contactInfo?.address?.pincode || '',
          country: tenantData.contactInfo?.address?.country || 'India',
        },
      },
      education: tenantData.education || '',
      employment: {
        designation: tenantData.employment?.designation || '',
        presentEmployedAt: tenantData.employment?.presentEmployedAt || '',
        officeMobileNumber: tenantData.employment?.officeMobileNumber || '',
        officeAddress: {
          addressLine1: tenantData.employment?.officeAddress?.addressLine1 || '',
          addressLine2: tenantData.employment?.officeAddress?.addressLine2 || '',
          city: tenantData.employment?.officeAddress?.city || '',
          state: tenantData.employment?.officeAddress?.state || '',
          pincode: tenantData.employment?.officeAddress?.pincode || '',
          country: tenantData.employment?.officeAddress?.country || 'India',
        },
      },
      propertyId: tenantData.propertyId || '',
      propertyName: tenantData.propertyName || '',
      roomDetails: {
        floor: Number(tenantData.roomDetails?.floor) || 0,
        roomNumber: String(tenantData.roomDetails?.roomNumber) || '',
        roomType: String(tenantData.roomDetails?.roomType).toUpperCase() || '',
      },
      financials: {
        payPerMonth: Number(tenantData.financials?.payPerMonth) || 0,
        deposit: Number(tenantData.financials?.deposit) || 0,
        paymentMethod: tenantData.financials?.paymentMethod || 'Bank Transfer',
        rentDueDate: tenantData.financials?.rentDueDate ? new Date(tenantData.financials.rentDueDate).toISOString().split('T')[0] : '',
      },
      leaseDetails: {
        leaseStartDate: tenantData.leaseDetails?.leaseStartDate ? new Date(tenantData.leaseDetails.leaseStartDate).toISOString().split('T')[0] : '',
        leaseEndDate: tenantData.leaseDetails?.leaseEndDate ? new Date(tenantData.leaseDetails.leaseEndDate).toISOString().split('T')[0] : '',
      },
      emergencyContacts: tenantData.emergencyContacts && tenantData.emergencyContacts.length > 0 
        ? tenantData.emergencyContacts 
        : [{ name: '', relation: '', contactNumber: '' }],
      status: tenantData.status || 'PENDING',
      declaration: true, // Always true for existing tenants
      notes: tenantData.notes || '',
    };
    
    // Reset form with the transformed data
    reset(formData);
    console.log('Form prefilled with all sections',tenantData,properties);
    
    // Handle property and room selection for edit mode
    if (tenantData.propertyId && properties.length > 0) {
      const selectedProp = properties.find(p => p._id === tenantData.propertyId || p.id === tenantData.propertyId);
      if (selectedProp) {
        console.log('Property found for tenant:', selectedProp,selectedProp.propertyName);
        setSelectedProperty(selectedProp);
        
        // Generate property rooms and then set room details
        await generatePropertyRooms(selectedProp);
        
        // Enhanced room details prefilling using the dedicated helper function
        if (tenantData.roomDetails) {
          setTimeout(async () => {
            console.log('🏠 Starting enhanced room prefilling...');
            const success = await prefillRoomDetails(tenantData.roomDetails, selectedProp);
            if (success) {
              console.log('✅ Room prefilling completed successfully');
            } else {
              console.warn('⚠️ Room prefilling encountered issues');
            }
          }, 1000); // Wait for property rooms to be generated
        }
      } else {
        console.warn('Property not found for tenant:', tenantData.propertyId);
      }
    }
    
    // Set profile picture if available
    if (tenantData.profilePic) {
      setProfilePicture({
        preview: tenantData.profilePic,
        name: 'Profile Picture',
        file: null // We don't have the original file
      });
    }
    
    // Set uploaded documents if available
    if (tenantData.documentProofs && tenantData.documentProofs.length > 0) {
      const documents = tenantData.documentProofs.map((doc, index) => ({
        id: Date.now() + index,
        type: doc.type || 'ID Proof',
        documentId: doc.id || '',
        preview: doc.documentUrl || '',
        name: `Document ${index + 1}`,
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : '',
        file: null // We don't have the original file
      }));
      setUploadedDocuments(documents);
    }
    
    console.log('Form prefilling completed successfully');
  };

  // Watch for DOB changes and auto-calculate age
  const watchedDob = watch('personalInfo.dob');
  useEffect(() => {
    if (watchedDob) {
      const birthDate = new Date(watchedDob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      // Only update if the calculated age is valid (positive and reasonable)
      if (calculatedAge >= 0 && calculatedAge <= 120) {
        setValue('personalInfo.age', calculatedAge);
      }
    }
  }, [watchedDob, setValue]);

  // Watch propertyId changes and sync propertyName
  const watchedPropertyId = watch('propertyId');
  useEffect(() => {
    if (watchedPropertyId && properties.length > 0) {
      const selectedProp = properties.find(p => p._id === watchedPropertyId);
      if (selectedProp) {
        setValue('propertyName', selectedProp.propertyName);
        setSelectedProperty(selectedProp);
        // Reset room selection when property changes
        setValue('roomDetails.floor', '');
        setValue('roomDetails.roomNumber', '');
        setValue('roomDetails.roomType', '');
        generatePropertyRooms(selectedProp);
      }
    }
  }, [watchedPropertyId, properties, setValue]);

  // Enhanced room prefilling function for API format: {"floor": 2, "roomNumber": "202", "roomType": "TRIPLE"}
  const prefillRoomDetails = async (roomData, property = null) => {
    console.log('🎯 Prefilling room details with API format:', roomData);
    
    if (!roomData) {
      console.warn('No room data provided for prefilling');
      return false;
    }

    try {
      const { floor: apiFloor, roomNumber: apiRoomNumber, roomType: apiRoomType } = roomData;
      
      console.log('📊 Processing room data:', {
        apiFloor,
        apiFloorType: typeof apiFloor,
        apiRoomNumber,
        apiRoomNumberType: typeof apiRoomNumber,
        apiRoomType,
        apiRoomTypeType: typeof apiRoomType
      });

      // Convert to proper types
      const floorNumber = Number(apiFloor);
      const roomNumberString = String(apiRoomNumber);
      const roomTypeString = String(apiRoomType).toUpperCase();

      // Set form values
      setValue('roomDetails.floor', floorNumber);
      setValue('roomDetails.roomNumber', roomNumberString);
      setValue('roomDetails.roomType', roomTypeString);

      console.log('✅ Room details prefilled:', {
        floor: floorNumber,
        roomNumber: roomNumberString,
        roomType: roomTypeString
      });

      // Validate against property rooms if available
      if (property && propertyRooms[property._id]) {
        const floorKey = String(floorNumber);
        const floorRooms = propertyRooms[property._id][floorKey];
        
        if (floorRooms) {
          const matchingRoom = floorRooms.find(room => 
            String(room.roomNo) === roomNumberString ||
            String(room.roomName) === roomNumberString ||
            String(room.number) === roomNumberString
          );
          
          if (matchingRoom) {
            console.log('✅ Found matching room in property:', matchingRoom);
            // Update room type with property data if needed
            if (matchingRoom.sharingOption && !apiRoomType) {
              setValue('roomDetails.roomType', matchingRoom.sharingOption.toUpperCase());
            }
          } else {
            console.log('⚠️ Room not found in property, but keeping prefilled data');
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error prefilling room details:', error);
      return false;
    }
  };

  // Fetch and generate property rooms based on actual property data
  const generatePropertyRooms = async (property) => {
    return new Promise((resolve) => {
      try {
        // Check if property has floors data
        if (property.floors && Array.isArray(property.floors)) {
          const rooms = {};
          
          // Process actual floors from property data using the exact DB structure
          property.floors.forEach((floor) => {
            const floorKey = floor.floorNumber.toString();
            rooms[floorKey] = [];
            
            if (floor.rooms && Array.isArray(floor.rooms)) {
              floor.rooms.forEach((room) => {
                rooms[floorKey].push({
                  number: room.roomNo || room.roomName,
                  roomName: room.roomName,
                  roomNo: room.roomNo,
                  type: room.sharingOption || 'SINGLE',
                  sharingOption: room.sharingOption,
                  noOfBeds: room.noOfBeds,
                  occupied: room.isOccupied || false, // Default to false if not specified
                  capacity: room.noOfBeds || 1,
                  roomId: room._id,
                  rent: room.rent || 0,
                  amenities: room.amenities || [],
                });
              });
            }
          });
          
          setPropertyRooms(prev => ({
            ...prev,
            [property._id]: rooms
          }));
          resolve(rooms);
        } else {
          // Fallback: Generate rooms based on property metadata
          const rooms = {};
          const floors = property.numberOfFloors || property.totalFloors || 3;
          const roomsPerFloor = property.roomsPerFloor || 10;
          
          for (let floor = 1; floor <= floors; floor++) {
            rooms[floor.toString()] = [];
            for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
              const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;
              rooms[floor.toString()].push({
                number: roomNumber,
                roomName: roomNumber,
                roomNo: roomNumber,
                type: 'SINGLE',
                sharingOption: 'SINGLE',
                noOfBeds: 1,
                occupied: Math.random() > 0.7, // 30% occupancy simulation
                capacity: 1,
                roomId: `floor_${floor}_room_${roomNum}`,
                rent: 5000 + (Math.floor(Math.random() * 3000)),
                amenities: [],
              });
            }
          }
          
          setPropertyRooms(prev => ({
            ...prev,
            [property._id]: rooms
          }));
          resolve(rooms);
        }
      } catch (error) {
        console.error('Error generating property rooms:', error);
        resolve({});
      }
    });
  };

  // Handle emergency contact management
  const addEmergencyContact = () => {
    const currentContacts = watch('emergencyContacts');
    setValue('emergencyContacts', [
      ...currentContacts,
      { name: '', relation: '', contactNumber: '' }
    ]);
  };

  const removeEmergencyContact = (index) => {
    const currentContacts = watch('emergencyContacts');
    if (currentContacts.length > 1) {
      setValue('emergencyContacts', currentContacts.filter((_, i) => i !== index));
    }
  };

  // Document upload handlers
  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: 'ID Proof',
      documentId: '',
      preview: URL.createObjectURL(file),
      name: file.name,
      expiryDate: '',
    }));
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
  };

  const removeUploadedDocument = (documentId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const updateDocumentType = (documentId, type) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, type } : doc
    ));
  };

  const updateDocumentId = (documentId, documentIdValue) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, documentId: documentIdValue } : doc
    ));
  };

  const updateDocumentExpiry = (documentId, expiryDate) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, expiryDate } : doc
    ));
  };

  // Validate current step before moving to next
  const validateCurrentStep = async () => {
    const errors = [];
    
    switch (currentStep) {
      case 1: // Personal Information
        if (!watch('personalInfo.firstName')?.trim()) {
          errors.push('First name is required');
        }
        if (!watch('personalInfo.lastName')?.trim()) {
          errors.push('Last name is required');
        }
        if (!watch('personalInfo.dob')) {
          errors.push('Date of birth is required');
        }
        if (!watch('personalInfo.gender')) {
          errors.push('Gender is required');
        }
        const age = watch('personalInfo.age');
        if (!age || age < 18) {
          errors.push('Age must be at least 18 years');
        }
        break;
        
      case 2: // Contact Information
        if (!watch('contactInfo.mobileNumber')?.trim()) {
          errors.push('Mobile number is required');
        } else {
          const mobileNumber = watch('contactInfo.mobileNumber').trim();
          if (mobileNumber.length < 10) {
            errors.push('Mobile number must be at least 10 digits');
          }
          if (!/^[0-9+\-\s()]+$/.test(mobileNumber)) {
            errors.push('Mobile number contains invalid characters');
          }
        }
        
        if (!watch('contactInfo.email')?.trim()) {
          errors.push('Email address is required');
        } else {
          const email = watch('contactInfo.email').trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
          }
        }
        
        if (!watch('contactInfo.address.addressLine1')?.trim()) {
          errors.push('Address line 1 is required');
        }
        if (!watch('contactInfo.address.city')?.trim()) {
          errors.push('City is required');
        }
        if (!watch('contactInfo.address.state')?.trim()) {
          errors.push('State is required');
        }
        
        if (!watch('contactInfo.address.pincode')?.trim()) {
          errors.push('Pincode is required');
        } else {
          const pincode = watch('contactInfo.address.pincode').trim();
          if (pincode.length !== 6 || !/^[0-9]+$/.test(pincode)) {
            errors.push('Pincode must be exactly 6 digits');
          }
        }
        break;
        
      case 3: // Education & Employment
        // Optional fields - no mandatory validation
        break;
        
        case 4: // Property & Room
        if (!watch('propertyId')?.trim()) {
          errors.push('Property selection is required');
        }
        
        const floor = watch('roomDetails.floor');
        if (floor === undefined || floor === null || floor === '') {
          errors.push('Floor selection is required');
        }
        
        if (!watch('roomDetails.roomNumber')?.trim()) {
          errors.push('Room selection is required');
        }
        
        if (!watch('roomDetails.roomType')?.trim()) {
          errors.push('Room type is required');
        }
        
        // Validate room availability if property is selected
        const selectedPropertyId = watch('propertyId');
        const selectedFloor = watch('roomDetails.floor');
        const selectedRoomNumber = watch('roomDetails.roomNumber');
        
        if (selectedPropertyId && selectedFloor !== undefined && selectedRoomNumber && propertyRooms[selectedPropertyId]) {
          const floorRooms = propertyRooms[selectedPropertyId][selectedFloor.toString()];
          if (floorRooms) {
            const selectedRoom = floorRooms.find(room => 
              String(room.roomNo) === String(selectedRoomNumber) ||
              String(room.roomName) === String(selectedRoomNumber)
            );
            
            // Check if we're editing and the room is the same as the original
            const isSameRoomAsOriginal = isEditMode && originalTenantData && 
              originalTenantData.roomDetails &&
              originalTenantData.roomDetails.floor === selectedFloor &&
              String(originalTenantData.roomDetails.roomNumber) === String(selectedRoomNumber);
            
            // For new tenants or when changing rooms in edit mode, check if room is occupied
            if (selectedRoom && selectedRoom.occupied && !isSameRoomAsOriginal) {
              errors.push('Selected room is already occupied. Please choose another room.');
            }
            
            // Check bed capacity for PG properties using the correct field name
            if (selectedRoom && selectedProperty) {
              const property = properties.find(p => p._id === selectedPropertyId);
              if (property && property.propertyType === 'PG') {
                // Check if room has available beds using the correct field name
                const noOfBeds = selectedRoom.noOfBeds || 1;
                const noOfBedsOccupied = selectedRoom.noOfBedsOccupied || selectedRoom.noOfBedsOccupiedu || 0;
                
                // If this is a new tenant assignment, check if there's space
                if (!isSameRoomAsOriginal && noOfBedsOccupied >= noOfBeds) {
                  errors.push(`Room is full. All ${noOfBeds} beds are occupied.`);
                }
              }
            }
          }
        }
        break;
        
      case 5: // Financial Details
        const monthlyRent = watch('financials.payPerMonth');
        if (!monthlyRent || monthlyRent <= 0) {
          errors.push('Monthly rent must be greater than 0');
        }
        
        const deposit = watch('financials.deposit');
        if (deposit === undefined || deposit < 0) {
          errors.push('Security deposit must be 0 or greater');
        }
        
        if (!watch('financials.rentDueDate')) {
          errors.push('Rent due date is required');
        }
        
        const leaseStartDate = watch('leaseDetails.leaseStartDate');
        const leaseEndDate = watch('leaseDetails.leaseEndDate');
        
        if (!leaseStartDate) {
          errors.push('Lease start date is required');
        }
        if (!leaseEndDate) {
          errors.push('Lease end date is required');
        }
        
        // Validate lease dates logic
        if (leaseStartDate && leaseEndDate) {
          const startDate = new Date(leaseStartDate);
          const endDate = new Date(leaseEndDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate >= endDate) {
            errors.push('Lease end date must be after start date');
          }
          
          if (startDate < today) {
            errors.push('Lease start date cannot be in the past');
          }
        }
        break;
        
      case 6: // Emergency Contacts
        const emergencyContacts = watch('emergencyContacts') || [];
        if (emergencyContacts.length === 0) {
          errors.push('At least one emergency contact is required');
        } else {
          emergencyContacts.forEach((contact, index) => {
            if (!contact.name?.trim()) {
              errors.push(`Emergency contact ${index + 1}: Name is required`);
            }
            if (!contact.relation?.trim()) {
              errors.push(`Emergency contact ${index + 1}: Relationship is required`);
            }
            if (!contact.contactNumber?.trim()) {
              errors.push(`Emergency contact ${index + 1}: Contact number is required`);
            } else if (contact.contactNumber.length < 10) {
              errors.push(`Emergency contact ${index + 1}: Contact number must be at least 10 digits`);
            }
          });
        }
        break;
        
      case 7: // Documents & Review
        if (!watch('declaration')) {
          errors.push('Declaration must be accepted to proceed');
        }
        break;
    }
    
    return errors;
  };

  // Validate current step manually (without navigation)
  const validateCurrentStepManually = async () => {
    const validationErrors = await validateCurrentStep();
    
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setShowValidationModal(true);
    } else {
      // Show success message for valid step
      setErrorMessage('✅ All fields in this step are valid!');
      setShowErrorModal(true);
    }
  };
  const nextStep = async () => {
    const validationErrors = await validateCurrentStep();
    
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setShowValidationModal(true);
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    console.log('Form submission started:', { isEditMode, currentStep, totalSteps });
    
    // Validate we're on the final step
    if (currentStep !== totalSteps) {
      const errorMsg = `Please complete all steps. Currently on step ${currentStep} of ${totalSteps}.`;
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      return;
    }

    // Perform comprehensive validation before submission
    const allValidationErrors = [];
    for (let step = 1; step <= totalSteps; step++) {
      const stepCurrentStep = currentStep;
      setCurrentStep(step); // Temporarily set step for validation
      const stepErrors = await validateCurrentStep();
      if (stepErrors.length > 0) {
        allValidationErrors.push(...stepErrors.map(err => `Step ${step}: ${err}`));
      }
      setCurrentStep(stepCurrentStep); // Restore current step
    }
    
    // Check for form validation errors
    const hasZodErrors = Object.keys(errors).length > 0;
    if (hasZodErrors) {
      console.log('Form has Zod validation errors:', errors);
      // Convert Zod errors to readable format
      const zodErrorMessages = [];
      Object.entries(errors).forEach(([field, error]) => {
        if (error?.message) {
          zodErrorMessages.push(error.message);
        }
      });
      allValidationErrors.push(...zodErrorMessages);
    }
    
    if (allValidationErrors.length > 0) {
      setValidationErrors(allValidationErrors);
      setShowValidationModal(true);
      return;
    }

    try {
      setIsLoading(true);

      const tenantData = {
        ...data,
        ownerId: ownerId,
        profilePic: profilePicture?.preview || '',
        documentProofs: uploadedDocuments?.map(doc => ({
          type: doc.type,
          id: doc.documentId,
          documentUrl: doc.preview,
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          uploadedAt: new Date(),
        })),
        audit: {
          createdBy: 'System User',
          createdByUserId: ownerId,
          updatedBy: 'System User',
          updatedByUserId: ownerId,
        },
      };

      let response;
      
      if (isEditMode && id) {
        console.log('Updating tenant with ID:', id);
        response = await apiClient.put('/api/tenant/update', {
          tenantId: id,
          updateData: tenantData
        });
        
        if (response?.data && (response.data.code === 0 || response.data.success || response.status === 200)) {
          console.log('Tenant updated successfully');
          
          // Update property floor details if room changed
          try {
            await updatePropertyFloorDetails(data.propertyId, data.roomDetails, id, data.personalInfo);
          } catch (propertyUpdateError) {
            console.error('Error updating property floor details:', propertyUpdateError);
            // Don't fail the entire process if property update fails
            console.warn('Tenant updated successfully, but property floor update failed');
          }
          
          setShowSuccessModal(true);
        } else {
          const errorMsg = response?.data?.message || response?.data?.error || 'Failed to update tenant';
          throw new Error(errorMsg);
        }
      } else {
        console.log('Creating new tenant');
        response = await apiClient.post('/api/tenant/create', tenantData);
        
        if (response?.data && (response.data.code === 0 || response.data.success || response.status === 200)) {
          console.log('Tenant created successfully');
          
          // Extract tenant ID from response
          const tenantId = response.data?.data?._id || response.data?._id || response.data?._id;
          setCreatedTenantId(tenantId);
          
          // For new tenants, create both RENT and DEPOSIT transactions
          try {
            setIsCreatingTransaction(true);
            console.log('Creating rent and deposit transactions for new tenant...');
            
            const currentDate = new Date().toISOString().split('T')[0];
            
            // 1. Create RENT transaction with PENDING status
            const rentTransactionData = {
              ownerId: ownerId,
              propertyId: data.propertyId,
              tenantId: tenantId,
              transactionType: 'RENT',
              transactionSubType: 'monthly_rent',
              amount: data.financials.payPerMonth,
              currency: 'INR',
              transactionDate: currentDate,
              actualPaymentDate: currentDate,
              paidDate: '',
              paymentMethod: data.financials.paymentMethod || 'Bank Transfer',
              status: 'PENDING',
              description: `Monthly rent for ${data.personalInfo.firstName} ${data.personalInfo.lastName} - Room ${data.roomDetails.roomNumber}`,
              externalPaymentId: '',
              rentDetails: {
                rentStartDate: data.leaseDetails.leaseStartDate,
                rentEndDate: data.leaseDetails.leaseEndDate,
              },
              incomeDetails: {
                source: 'Rent Payment',
                receivedFrom: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
                paymentReference: '',
                notes: `Auto-generated rent transaction for new tenant`,
              },
            };
            
            console.log('Creating rent transaction:', rentTransactionData);
            const rentTransactionResponse = await transactionService.createTransaction(rentTransactionData);
            console.log('rent transaction: res', rentTransactionResponse);
            
            if (rentTransactionResponse && (rentTransactionResponse.code === 0 || rentTransactionResponse.success)) {
              console.log('Rent transaction created successfully');
              const rentTransactionId = rentTransactionResponse?.data?._id || rentTransactionResponse?.data?._id ;
              setCreatedTransactionId(rentTransactionId);
            } else {
              console.warn('Rent transaction creation failed');
            }
            
            // 2. Create INCOME transaction for deposit (only if deposit amount > 0)
            if (data.financials.deposit && data.financials.deposit > 0) {
              const depositTransactionData = {
                ownerId: ownerId,
                propertyId: data.propertyId,
                tenantId: tenantId,
                transactionType: 'INCOME',
                transactionSubType: 'security_deposit',
                amount: data.financials.deposit,
                currency: 'INR',
                transactionDate: currentDate,
                actualPaymentDate: currentDate,
                paidDate: currentDate,
                paymentMethod: data.financials.paymentMethod || 'Bank Transfer',
                status: 'PAID',
                description: `Security deposit from ${data.personalInfo.firstName} ${data.personalInfo.lastName} - Room ${data.roomDetails.roomNumber}`,
                externalPaymentId: '',
                incomeDetails: {
                  source: 'Security Deposit',
                  receivedFrom: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
                  paymentReference: '',
                  notes: `Auto-generated deposit transaction for new tenant`,
                },
              };
              
              console.log('Creating deposit transaction:', depositTransactionData);
              const depositTransactionResponse = await transactionService.createTransaction(depositTransactionData);

              console.log('Creating deposit transaction: respoanse', depositTransactionResponse);

              
              if (depositTransactionResponse && (depositTransactionResponse.code === 0 || depositTransactionResponse.success)) {
                console.log('Deposit transaction created successfully');
                const depositTransactionId = depositTransactionResponse.data?._id || depositTransactionResponse?._id ;
                setCreatedDepositTransactionId(depositTransactionId);
              } else {
                console.warn('Deposit transaction creation failed');
              }
            }
            
          } catch (transactionError) {
            console.error('Error creating transactions:', transactionError);
            // Don't fail the entire process if transaction creation fails
            console.warn('Tenant created successfully, but transaction creation failed');
          } finally {
            setIsCreatingTransaction(false);
          }
          
          // Update property floor details to mark room as occupied AFTER tenant is created
          try {
            await updatePropertyFloorDetails(data.propertyId, data.roomDetails, tenantId, data.personalInfo);
          } catch (propertyUpdateError) {
            console.error('Error updating property floor details:', propertyUpdateError);
            // Don't fail the entire process if property update fails
            console.warn('Tenant created successfully, but property floor update failed');
          }
          
          setShowSuccessModal(true);
          reset();
          setUploadedDocuments([]);
          setProfilePicture(null);
        } else {
          const errorMsg = response?.data?.message || response?.data?.error || 'Failed to create tenant';
          throw new Error(errorMsg);
        }
      }

    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} tenant:`, err.message);
      setErrorMessage(err.message || `Failed to ${isEditMode ? 'update' : 'create'} tenant. Please try again.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update property floor details when tenant is created/updated
  const updatePropertyFloorDetails = async (propertyId, roomDetails, tenantId, personalInfo) => {
    console.log('Updating property floor details for property:', propertyId, 'room:', roomDetails);
    
    try {
      // First, get the current property data using the same approach as in the component
      const propertyResponse = await apiClient.post('/api/property/list', {
        ownerId: ownerId || '68a643b5430dd953da794950',
        id: propertyId
      });
      
      console.log('Current property data:', propertyResponse);
      
      if (propertyResponse?.data?.data?.properties && propertyResponse.data.data.properties.length > 0) {
        const propertyData = propertyResponse.data.data.properties[0];
        
        // Track if we're changing rooms (for edit mode)
        let isChangingRooms = false;
        let oldRoomDetails = null;
        
        if (isEditMode && originalTenantData) {
          // Check if the tenant is changing rooms
          isChangingRooms = !(originalTenantData.roomDetails.floor === roomDetails.floor && 
                             String(originalTenantData.roomDetails.roomNumber) === String(roomDetails.roomNumber));
          if (isChangingRooms) {
            oldRoomDetails = originalTenantData.roomDetails;
          }
        }
        
        // Find the floor and room to update
        const updatedFloors = propertyData.floors.map(floor => {
          // Handle old room (decrement bed count if changing rooms)
          if (isChangingRooms && oldRoomDetails && floor.floorNumber === oldRoomDetails.floor) {
            const updatedRooms = floor.rooms.map(room => {
              if (room.roomNo === oldRoomDetails.roomNumber) {
                // Decrement the bed count for the old room
                const currentNoOfBedsOccupied = room.noOfBedsOccupied || room.noOfBedsOccupiedu || 0;
                const newNoOfBedsOccupied = Math.max(0, currentNoOfBedsOccupied - 1);
                const isStillOccupied = newNoOfBedsOccupied > 0;
                
                return {
                  ...room,
                  noOfBedsOccupied: newNoOfBedsOccupied,
                  noOfBedsOccupiedu: newNoOfBedsOccupied, // Update both fields for compatibility
                  isOccupied: isStillOccupied,
                  // Remove tenant reference if room is now empty
                  ...(isStillOccupied ? {} : { occupiedBy: undefined })
                };
              }
              return room;
            });
            
            return {
              ...floor,
              rooms: updatedRooms
            };
          }
          
          // Handle new room
          if (floor.floorNumber === roomDetails.floor) {
            // Update the specific room
            const updatedRooms = floor.rooms.map(room => {
              if (room.roomNo === roomDetails.roomNumber) {
                // Increment the bed count for the new room
                const currentNoOfBedsOccupied = room.noOfBedsOccupied || room.noOfBedsOccupiedu || 0;
                const newNoOfBedsOccupied = currentNoOfBedsOccupied + 1;
                
                return {
                  ...room,
                  noOfBedsOccupied: newNoOfBedsOccupied,
                  noOfBedsOccupiedu: newNoOfBedsOccupied, // Update both fields for compatibility
                  isOccupied: newNoOfBedsOccupied > 0,
                  occupiedBy: {  // Add tenant reference
                    tenantId: tenantId,
                    tenantName: `${personalInfo.firstName} ${personalInfo.lastName}`
                  }
                };
              }
              return room;
            });
            
            return {
              ...floor,
              rooms: updatedRooms
            };
          }
          return floor;
        });
        
        // Update the property with the modified floors
        const updateData = {
          ...propertyData,
          floors: updatedFloors
        };
        
        console.log('Updating property with data:', updateData);
        const updateResponse = await apiClient.put('/api/property/update', {
          propertyId: propertyId,
          updateData: updateData
        });
        console.log('Property update response:', updateResponse);
        
        if (updateResponse && (updateResponse.data.code === 0 || updateResponse.data.success)) {
          console.log('Property floor details updated successfully');
        } else {
          throw new Error('Failed to update property floor details');
        }
      } else {
        throw new Error('Failed to fetch property data');
      }
    } catch (error) {
      console.error('Error updating property floor details:', error);
      throw error;
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Personal Info', icon: User },
      { number: 2, title: 'Contact Info', icon: Phone },
      { number: 3, title: 'Education & Work', icon: Briefcase },
      { number: 4, title: 'Property & Room', icon: Building2 },
      { number: 5, title: 'Financial Details', icon: DollarSign },
      { number: 6, title: 'Emergency Contact', icon: Users },
      { number: 7, title: 'Documents & Review', icon: FileText },
    ];

    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive ? 'bg-blue-600 text-white' : 
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`mt-2 text-xs text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute top-5 w-full h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} 
                     style={{ left: `${(100 / steps.length) * (index + 0.5)}%`, width: `${100 / steps.length}%` }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render room selection interface
  const renderRoomSelection = () => {
    if (!selectedProperty) {
      return (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please select a property first to view available rooms</p>
        </div>
      );
    }

    if (!propertyRooms[selectedProperty._id]) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-600">Loading rooms for {selectedProperty.propertyName}...</p>
        </div>
      );
    }

    const rooms = propertyRooms[selectedProperty._id];
    const availableFloors = Object.keys(rooms);

    if (availableFloors.length === 0) {
      return (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No floors available for this property</p>
          <p className="text-sm text-gray-500 mt-2">Please contact administrator to configure floors and rooms</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Property Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Property</h4>
          <p className="text-sm text-gray-600">{selectedProperty.propertyName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {availableFloors.length} floor(s) available • 
            {Object.values(rooms).reduce((total, floorRooms) => total + floorRooms.length, 0)} total rooms
          </p>
        </div>

        {/* Floor Selection */}
        <div>
          <Label className="text-base font-medium mb-4 block">Select Floor</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableFloors.map((floor) => {
              const floorRooms = rooms[floor] || [];
              const availableRooms = floorRooms.filter(room => {
                // Check if room is available (not fully occupied)
                const noOfBeds = room.noOfBeds || 1;
                const noOfBedsOccupied = room.noOfBedsOccupied || room.noOfBedsOccupiedu || 0;
                const isFullyOccupied = noOfBedsOccupied >= noOfBeds;
                
                // If in edit mode and this is the original room, it should be considered available
                const isSameRoomAsOriginal = isEditMode && originalTenantData && 
                  originalTenantData.roomDetails &&
                  originalTenantData.roomDetails.floor === parseInt(floor) &&
                  String(originalTenantData.roomDetails.roomNumber) === String(room.roomNo);
                
                return !isFullyOccupied || isSameRoomAsOriginal;
              }).length;
              const totalRooms = floorRooms.length;
              const floorNumber = parseInt(floor);
              
              return (
                <Button
                  key={floor}
                  type="button"
                  variant={selectedFloor === floorNumber ? "default" : "outline"}
                  onClick={() => {
                    setValue('roomDetails.floor', floorNumber);
                    setValue('roomDetails.roomNumber', ''); // Reset room selection
                    setValue('roomDetails.roomType', ''); // Reset room type
                  }}
                  className="h-16 flex-col"
                  disabled={availableRooms === 0}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">
                      Floor {floorNumber}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {availableRooms}/{totalRooms} available
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Room Selection */}
        {selectedFloor !== undefined && selectedFloor !== '' && rooms[selectedFloor.toString()] && (
          <div>
            <Label className="text-base font-medium mb-4 block">
              Select Room - Floor {selectedFloor}
            </Label>
            
            {rooms[selectedFloor.toString()].length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Home className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No rooms available on this floor</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-100">
                {rooms[selectedFloor.toString()].map((room, roomIndex) => {
                  const isSelected = selectedRoomNumber === room.roomNo;
                  
                  // Check if room is fully occupied using the correct field name
                  const noOfBeds = room.noOfBeds || 1;
                  const noOfBedsOccupied = room.noOfBedsOccupied || room.noOfBedsOccupiedu || 0;
                  const isFullyOccupied = noOfBedsOccupied >= noOfBeds;
                  
                  // If in edit mode and this is the original room, it should be selectable
                  const isSameRoomAsOriginal = isEditMode && originalTenantData && 
                    originalTenantData.roomDetails &&
                    originalTenantData.roomDetails.floor === selectedFloor &&
                    String(originalTenantData.roomDetails.roomNumber) === String(room.roomNo);
                  
                  const isSelectable = !isFullyOccupied || isSameRoomAsOriginal;
                  const isOccupied = room.occupied && !isSameRoomAsOriginal;
                  
                  const uniqueKey = room.roomId || `${selectedFloor}_${room.roomNo}_${roomIndex}`;
                  
                  return (
                    <div
                      key={uniqueKey}
                      className={`
                        relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200 transform scale-105' 
                            : isFullyOccupied && !isSameRoomAsOriginal
                              ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                              : isOccupied 
                                ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm'
                        }
                      `}
                      onClick={() => {
                        if (isSelectable) {
                          setValue('roomDetails.roomNumber', room.roomNo);
                          setValue('roomDetails.roomType', room.sharingOption);
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className={`font-semibold text-base mb-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}>{room.roomName}</div>
                        <div className="text-xs text-gray-600 mb-1">Room {room.roomNo}</div>
                        <div className={`text-xs mb-1 ${
                          isSelected ? 'text-blue-700 font-medium' : 'text-blue-600'
                        }`}>{room.sharingOption}</div>
                        <div className="text-xs text-green-600 mb-1">{room.noOfBeds} beds</div>
                        {room.rent > 0 && (
                          <div className="text-xs text-green-600 mb-1">₹{room.rent}/month</div>
                        )}
                        <div className="text-xs">
                          {isFullyOccupied && !isSameRoomAsOriginal ? (
                            <Badge variant="destructive" className="text-xs bg-red-500">Fully Occupied</Badge>
                          ) : isOccupied ? (
                            <Badge variant="destructive" className="text-xs">Occupied</Badge>
                          ) : (
                            <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                              {isSelected ? 'Selected' : 'Available'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <>
                          <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                        </>
                      )}
                      <div className="absolute top-1 left-1 text-xs text-gray-500">
                        {noOfBedsOccupied}/{room.noOfBeds}🛏️
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected Room Summary */}
        {selectedRoomNumber && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Selected Room Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Floor:</span> Floor {selectedFloor}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Room Number:</span> {selectedRoomNumber}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Room Type:</span> {watch('roomDetails.roomType')}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Property:</span> {selectedProperty.propertyName}
              </div>
              {(() => {
                const currentRoom = rooms[selectedFloor.toString()]?.find(r => r.roomNo === selectedRoomNumber);
                return currentRoom && (
                  <>
                    {currentRoom.noOfBeds && (
                      <div>
                        <span className="text-blue-700 font-medium">Number of Beds:</span> {currentRoom.noOfBeds}
                      </div>
                    )}
                    {(currentRoom.noOfBedsOccupied !== undefined || currentRoom.noOfBedsOccupiedu !== undefined) ? (
                      <div>
                        <span className="text-blue-700 font-medium">Occupied Beds:</span> {currentRoom.noOfBedsOccupied || currentRoom.noOfBedsOccupiedu || 0}
                      </div>
                    ) : null}
                    {currentRoom.sharingOption && (
                      <div>
                        <span className="text-blue-700 font-medium">Sharing Type:</span> {currentRoom.sharingOption}
                      </div>
                    )}
                    {currentRoom.rent > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">Monthly Rent:</span> ₹{currentRoom.rent}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Public function for external room prefilling - can be called from outside
  const handleRoomPrefill = async (roomData) => {
    console.log('💼 External room prefill requested:', roomData);
    
    // Ensure we have a selected property
    if (!selectedProperty) {
      console.warn('No property selected. Please select a property first.');
      return false;
    }
    
    // Ensure property rooms are available
    if (!propertyRooms[selectedProperty._id]) {
      console.log('Property rooms not loaded, generating...');
      await generatePropertyRooms(selectedProperty);
      
      // Wait a bit for rooms to be generated
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return await prefillRoomDetails(roomData, selectedProperty);
  };

  // Expose the function for testing/external use
  if (typeof window !== 'undefined') {
    window.prefillRoomDetails = handleRoomPrefill;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Tenant' : 'Add New Tenant'}
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/app/tenants')}
        >
          Cancel
        </Button>
      </div>



      {renderStepIndicator()}

      <form className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {profilePicture ? (
                      <img 
                        src={profilePicture.preview} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                      <Upload className="h-3 w-3" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Upload Profile Picture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-1">
                    First Name 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('personalInfo.firstName')}
                    placeholder="Enter first name"
                    className={errors.personalInfo?.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.personalInfo?.firstName && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.personalInfo.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-1">
                    Last Name 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('personalInfo.lastName')}
                    placeholder="Enter last name"
                    className={errors.personalInfo?.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.personalInfo?.lastName && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.personalInfo.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherFirstName">Father's First Name</Label>
                  <Input
                    id="fatherFirstName"
                    {...register('personalInfo.fatherFirstName')}
                    placeholder="Enter father's first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherLastName">Father's Last Name</Label>
                  <Input
                    id="fatherLastName"
                    {...register('personalInfo.fatherLastName')}
                    placeholder="Enter father's last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-1">
                    Gender 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="gender"
                      {...register('personalInfo.gender')}
                      className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400 ${
                        errors.personalInfo?.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                    >
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.personalInfo?.gender && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.personalInfo.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (Auto-calculated) *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    {...register('personalInfo.age', { valueAsNumber: true })}
                    placeholder="Will be calculated from DOB"
                    readOnly
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  {errors.personalInfo?.age && (
                    <p className="text-red-500 text-xs">{errors.personalInfo.age.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Age is automatically calculated from date of birth</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-1">
                    Date of Birth 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register('personalInfo.dob')}
                    className={errors.personalInfo?.dob ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.personalInfo?.dob && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.personalInfo.dob.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <div className="relative">
                  <select
                    id="maritalStatus"
                    {...register('personalInfo.maritalStatus')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                  >
                    {maritalStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps 2-7: Contact, Education, Property/Room, Financial, Emergency, Documents */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="flex items-center gap-1">
                    Mobile Number 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="mobileNumber" 
                    {...register('contactInfo.mobileNumber')} 
                    placeholder="Enter mobile number"
                    className={errors.contactInfo?.mobileNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.contactInfo?.mobileNumber && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.contactInfo.mobileNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternativeNumber">Alternative Number</Label>
                  <Input 
                    id="alternativeNumber" 
                    {...register('contactInfo.alternativeNumber')} 
                    placeholder="Enter alternative number" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email Address 
                  <span className="text-red-500 text-sm">*</span>
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register('contactInfo.email')} 
                  placeholder="Enter email address"
                  className={errors.contactInfo?.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                />
                {errors.contactInfo?.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.contactInfo.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Permanent Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1" className="flex items-center gap-1">
                      Address Line 1 
                      <span className="text-red-500 text-sm">*</span>
                    </Label>
                    <Input 
                      id="addressLine1" 
                      {...register('contactInfo.address.addressLine1')} 
                      placeholder="Enter address line 1"
                      className={errors.contactInfo?.address?.addressLine1 ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                    />
                    {errors.contactInfo?.address?.addressLine1 && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.contactInfo.address.addressLine1.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input id="addressLine2" {...register('contactInfo.address.addressLine2')} placeholder="Enter address line 2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-1">
                      City 
                      <span className="text-red-500 text-sm">*</span>
                    </Label>
                    <Input 
                      id="city" 
                      {...register('contactInfo.address.city')} 
                      placeholder="Enter city"
                      className={errors.contactInfo?.address?.city ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                    />
                    {errors.contactInfo?.address?.city && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.contactInfo.address.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="flex items-center gap-1">
                      State 
                      <span className="text-red-500 text-sm">*</span>
                    </Label>
                    <Input 
                      id="state" 
                      {...register('contactInfo.address.state')} 
                      placeholder="Enter state"
                      className={errors.contactInfo?.address?.state ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                    />
                    {errors.contactInfo?.address?.state && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.contactInfo.address.state.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="flex items-center gap-1">
                      Pincode 
                      <span className="text-red-500 text-sm">*</span>
                    </Label>
                    <Input 
                      id="pincode" 
                      {...register('contactInfo.address.pincode')} 
                      placeholder="Enter pincode"
                      className={errors.contactInfo?.address?.pincode ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                    />
                    {errors.contactInfo?.address?.pincode && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.contactInfo.address.pincode.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('contactInfo.address.country')} placeholder="Country" disabled className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Education & Employment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input id="education" {...register('education')} placeholder="Enter education details" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Job Designation</Label>
                  <Input id="designation" {...register('employment.designation')} placeholder="Job designation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presentEmployedAt">Current Employer</Label>
                  <Input id="presentEmployedAt" {...register('employment.presentEmployedAt')} placeholder="Current employer" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeMobileNumber">Office Mobile Number</Label>
                <Input id="officeMobileNumber" {...register('employment.officeMobileNumber')} placeholder="Office mobile number" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeAddressLine1">Office Address Line 1</Label>
                  <Input id="officeAddressLine1" {...register('employment.officeAddress.addressLine1')} placeholder="Office Address Line 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeCity">Office City</Label>
                  <Input id="officeCity" {...register('employment.officeAddress.city')} placeholder="Office City" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property & Room Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="propertyId" className="flex items-center gap-1">
                  Select Property 
                  <span className="text-red-500 text-sm">*</span>
                </Label>
                <select 
                  id="propertyId" 
                  {...register('propertyId')} 
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.propertyId ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Property</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.propertyName}
                    </option>
                  ))}
                </select>
                {errors.propertyId && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.propertyId.message}
                  </p>
                )}
                <input type="hidden" {...register('propertyName')} />
              </div>
              {renderRoomSelection()}
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent" className="flex items-center gap-1">
                    Monthly Rent 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="monthlyRent" 
                    type="number" 
                    {...register('financials.payPerMonth', { valueAsNumber: true })} 
                    placeholder="Enter monthly rent"
                    className={errors.financials?.payPerMonth ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.financials?.payPerMonth && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.financials.payPerMonth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit" className="flex items-center gap-1">
                    Security Deposit 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="securityDeposit" 
                    type="number" 
                    {...register('financials.deposit', { valueAsNumber: true })} 
                    placeholder="Enter deposit"
                    className={errors.financials?.deposit ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.financials?.deposit && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.financials.deposit.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select id="paymentMethod" {...register('financials.paymentMethod')} className="w-full px-3 py-2 border rounded-md">
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentDueDate" className="flex items-center gap-1">
                    Rent Due Date 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="rentDueDate" 
                    type="date" 
                    {...register('financials.rentDueDate')}
                    className={errors.financials?.rentDueDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.financials?.rentDueDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.financials.rentDueDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate" className="flex items-center gap-1">
                    Lease Start Date 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="leaseStartDate" 
                    type="date" 
                    {...register('leaseDetails.leaseStartDate')}
                    className={errors.leaseDetails?.leaseStartDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.leaseDetails?.leaseStartDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.leaseDetails.leaseStartDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate" className="flex items-center gap-1">
                    Lease End Date 
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="leaseEndDate" 
                    type="date" 
                    {...register('leaseDetails.leaseEndDate')}
                    className={errors.leaseDetails?.leaseEndDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.leaseDetails?.leaseEndDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.leaseDetails.leaseEndDate.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {watch('emergencyContacts').map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Emergency Contact {index + 1}</h4>
                    {watch('emergencyContacts').length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeEmergencyContact(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`emergencyContactName-${index}`} className="flex items-center gap-1">
                        Contact Name 
                        <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Input 
                        id={`emergencyContactName-${index}`} 
                        {...register(`emergencyContacts.${index}.name`)} 
                        placeholder="Enter contact name"
                        className={errors.emergencyContacts?.[index]?.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.emergencyContacts?.[index]?.name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.emergencyContacts[index].name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergencyContactRelation-${index}`} className="flex items-center gap-1">
                        Relationship 
                        <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Input 
                        id={`emergencyContactRelation-${index}`} 
                        {...register(`emergencyContacts.${index}.relation`)} 
                        placeholder="e.g., Father, Mother"
                        className={errors.emergencyContacts?.[index]?.relation ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.emergencyContacts?.[index]?.relation && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.emergencyContacts[index].relation.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergencyContactNumber-${index}`} className="flex items-center gap-1">
                        Contact Number 
                        <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Input 
                        id={`emergencyContactNumber-${index}`} 
                        {...register(`emergencyContacts.${index}.contactNumber`)} 
                        placeholder="Enter contact number"
                        className={errors.emergencyContacts?.[index]?.contactNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.emergencyContacts?.[index]?.contactNumber && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.emergencyContacts[index].contactNumber.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEmergencyContact} className="w-full flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Emergency Contact
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents & Final Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">Click to upload documents</p>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleDocumentUpload} />
                  </label>
                </div>
                
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Uploaded Documents</h4>
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeUploadedDocument(doc.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" {...register('status')} className="w-full px-3 py-2 border rounded-md">
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <textarea id="notes" {...register('notes')} rows={3} className="w-full px-3 py-2 border rounded-md" placeholder="Enter any additional notes" />
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input 
                      id="declaration" 
                      type="checkbox" 
                      {...register('declaration')} 
                      className={`h-4 w-4 mt-1 ${errors.declaration ? 'border-red-500' : ''}`}
                    />
                    <div className="flex-1">
                      <Label htmlFor="declaration" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        I declare that all the information provided is correct and accurate 
                        <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        By checking this box, you confirm that all information provided is true and complete.
                      </p>
                    </div>
                  </div>
                  {errors.declaration && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.declaration.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {/* Validate Current Step Button
            <Button
              type="button"
              variant="outline"
              onClick={validateCurrentStepManually}
              className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <CheckCircle className="h-4 w-4" />
              Validate Step
            </Button> */}
            
            {currentStep === totalSteps ? (
              <Button
                type="button"
                disabled={isLoading}
                onClick={() => handleSubmit(onSubmit)()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode 
                      ? 'Updating Tenant...' 
                      : isCreatingTransaction 
                        ? 'Creating Transaction...' 
                        : 'Creating Tenant...'
                    }
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {isEditMode ? 'Update Tenant' : 'Create Tenant'}
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            
            {isEditMode ? (
              <p className="text-sm text-gray-600 mb-4">
                Tenant has been updated successfully.
              </p>
            ) : (
              <div className="text-sm text-gray-600 mb-4 space-y-2">
                <p className="font-medium text-green-700">✅ Tenant created successfully</p>
                {createdTransactionId ? (
                  <p className="font-medium text-green-700">✅ Rent transaction created successfully</p>
                ) : (
                  <p className="font-medium text-amber-700">⚠️ Rent transaction creation failed</p>
                )}
                {createdDepositTransactionId ? (
                  <p className="font-medium text-green-700">✅ Deposit transaction created successfully</p>
                ) : watch('financials.deposit') > 0 ? (
                  <p className="font-medium text-amber-700">⚠️ Deposit transaction creation failed</p>
                ) : (
                  <p className="font-medium text-gray-600">ℹ️ No deposit transaction (amount: ₹0)</p>
                )}
                <div className="bg-gray-50 p-3 rounded-md mt-3 text-left">
                  <p className="text-xs text-gray-500 mb-1">Created:</p>
                  <p className="text-xs">• Tenant record</p>
                  {createdTransactionId && <p className="text-xs">• Pending rent transaction</p>}
                  {createdDepositTransactionId && <p className="text-xs">• Paid deposit transaction</p>}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setCreatedTenantId(null);
                  setCreatedTransactionId(null);
                  setCreatedDepositTransactionId(null);
                  navigate('/app/tenants');
                }}
                className="flex-1"
              >
                Go to Tenants
              </Button>
              {createdTenantId && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedTenantId(null);
                    setCreatedTransactionId(null);
                    setCreatedDepositTransactionId(null);
                    navigate(`/app/tenants/${createdTenantId}`);
                  }}
                  className="flex-1"
                >
                  View Tenant
                </Button>
              )}
            </div>
            
            {(createdTransactionId || createdDepositTransactionId) && (
              <div className="flex space-x-2 mt-2">
                {createdTransactionId && (
                  <Button 
                    variant="link"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setCreatedTenantId(null);
                      setCreatedTransactionId(null);
                      setCreatedDepositTransactionId(null);
                      navigate(`/app/financial/transactions/${createdTransactionId}`);
                    }}
                    className="flex-1 text-xs"
                  >
                    View Rent Transaction
                  </Button>
                )}
                {createdDepositTransactionId && (
                  <Button 
                    variant="link"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setCreatedTenantId(null);
                      setCreatedTransactionId(null);
                      setCreatedDepositTransactionId(null);
                      navigate(`/app/financial/transactions/${createdDepositTransactionId}`);
                    }}
                    className="flex-1 text-xs"
                  >
                    View Deposit Transaction
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Error Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation Error</h3>
              <p className="text-sm text-gray-600">
                Please fix the following errors before proceeding:
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
              <ul className="text-sm text-red-700 space-y-2">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowValidationModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowValidationModal(false);
                  // Navigate to the first step with errors if needed
                  if (currentStep === totalSteps && validationErrors.length > 0) {
                    setCurrentStep(1);
                  }
                }}
                className="flex-1"
              >
                Fix Errors
              </Button>
            </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              {errorMessage}
            </p>
            <Button
              onClick={() => setShowErrorModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTenantPage;