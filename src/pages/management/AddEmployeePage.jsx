import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  Plus, 
  X, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  Users,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

// Employee validation schema
const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.object({
    countryCode: z.string().min(1, 'Country code is required'),
    number: z.string().min(10, 'Phone number must be at least 10 characters'),
  }),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  role: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Gender is required',
  }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  propertyId: z.string().min(1, 'Property assignment is required'),
  propertyName: z.string().min(1, 'Property name is required'),
  joiningDate: z.string().optional(),
  endDate: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  employmentType: z.enum(['Permanent', 'Contract', 'Temporary']).optional(),
  workLocation: z.enum(['On-site', 'Remote', 'Hybrid']).optional(),
  status: z.enum(['active', 'inactive', 'onLeave']),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.object({
      countryCode: z.string().optional(),
      number: z.string().optional(),
    }),
    address: z.string().optional(),
  }),
  workShift: z.enum(['Day Shift', 'Night Shift', 'Rotating']).optional(),
});

const AddEmployeePage = () => {
  const { ownerId } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: employeeIdFromParams } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [properties, setProperties] = useState([]);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: { countryCode: '+91', number: '' },
      email: '',
      role: '',
      gender: 'Male',
      dateOfBirth: '',
      maritalStatus: 'Single',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      propertyId: '',
      propertyName: '',
      joiningDate: '',
      endDate: '',
      reasonForLeaving: '',
      employmentType: 'Permanent',
      workLocation: 'On-site',
      status: 'active',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: { countryCode: '+91', number: '' },
        address: '',
      },
      workShift: 'Day Shift',
    },
  });

  // Field arrays for dynamic fields
  const {
    fields: documentsFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: 'documents',
  });

  // Check if we're in edit mode
  useEffect(() => {
    console.log('🔍 Checking edit mode:', { employeeIdFromParams, ownerId });
    
    if (employeeIdFromParams) {
      console.log('✅ Edit mode detected with employee ID:', employeeIdFromParams);
      setIsEditMode(true);
      setEmployeeId(employeeIdFromParams);
      
      if (ownerId) {
        console.log('📤 Fetching employee data...');
        fetchEmployeeData(employeeIdFromParams);
      }
    } else {
      console.log('📝 Add mode detected');
      setIsEditMode(false);
      setEmployeeId(null);
    }
  }, [employeeIdFromParams, ownerId]);

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('🏢 Fetching properties for dropdown...');
        const response = await apiClient.post('/api/property/list', { 
          ownerId: ownerId || '68a643b5430dd953da794950' 
        });
        console.log('🏢 Properties response:', response);
        if (response?.data?.data?.properties) {
          console.log('✅ Properties loaded:', response.data.data.properties.length);
          setProperties(response.data.data.properties);
        }
      } catch (error) {
        console.error('❌ Error fetching properties:', error);
      }
    };
    
    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  // Watch for propertyId changes and automatically update propertyName
  const watchedPropertyId = watch('propertyId');
  useEffect(() => {
    console.log('🏢 PropertyId changed:', watchedPropertyId);
    console.log('🏢 Available properties:', properties.length);
    
    if (watchedPropertyId && properties.length > 0) {
      const selectedProperty = properties.find(p => p._id === watchedPropertyId);
      console.log('🏢 Found property:', selectedProperty);
      
      if (selectedProperty) {
        console.log('🏢 Setting propertyName to:', selectedProperty.propertyName);
        setValue('propertyName', selectedProperty.propertyName);
      }
    }
  }, [watchedPropertyId, properties, setValue]);

  const fetchEmployeeData = async (id) => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching employee data for ID:', id);
      
      // Use the list endpoint with employeeId filter
      const response = await apiClient.post('/api/employee/list', {
        employeeId: id,
        ownerId: ownerId || '68a643b5430dd953da794950',
        propertyId: '',
        name: '',
        mobileNumber: '',
        role: ''
      });
      
      console.log('📥 Employee fetch response:', response);
      
      if (response?.data?.data?.employees && response.data.data.employees.length > 0) {
        const employeeData = response.data.data.employees[0];
        console.log('✅ Employee data found:', employeeData);
        prefillFormData(employeeData);
      } else {
        console.error('❌ Employee not found in response');
        setErrorMessage('Employee not found. Please check the employee ID.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('🚨 Error fetching employee data:', error);
      setErrorMessage('Failed to fetch employee data. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const prefillFormData = (employeeData) => {
    console.log('🗺️ Prefilling form with employee data:', employeeData);
    
    // Handle propertyId - could be string or object
    let propertyId = '';
    let propertyName = '';
    if (employeeData.propertyId) {
      if (typeof employeeData.propertyId === 'object') {
        propertyId = employeeData.propertyId._id || employeeData.propertyId.id || '';
        propertyName = employeeData.propertyId.propertyName || '';
      } else {
        propertyId = employeeData.propertyId;
        // Find property name from properties list if it's just an ID
        const property = properties.find(p => p._id === propertyId);
        propertyName = property ? property.propertyName : (employeeData.propertyName || '');
      }
    }
    
    const formData = {
      firstName: employeeData.firstName || '',
      lastName: employeeData.lastName || '',
      phone: {
        countryCode: employeeData.phone?.countryCode || '+91',
        number: employeeData.phone?.number || '',
      },
      email: employeeData.email || '',
      role: employeeData.role || '',
      gender: employeeData.gender || 'Male',
      dateOfBirth: employeeData.dateOfBirth ? 
        new Date(employeeData.dateOfBirth).toISOString().split('T')[0] : '',
      maritalStatus: employeeData.maritalStatus || 'Single',
      address: {
        street: employeeData.address?.street || '',
        city: employeeData.address?.city || '',
        state: employeeData.address?.state || '',
        zipCode: employeeData.address?.zipCode || '',
      },
      propertyId: propertyId,
      propertyName: propertyName,
      joiningDate: employeeData.joiningDate ? 
        new Date(employeeData.joiningDate).toISOString().split('T')[0] : '',
      endDate: employeeData.endDate ? 
        new Date(employeeData.endDate).toISOString().split('T')[0] : '',
      reasonForLeaving: employeeData.reasonForLeaving || '',
      employmentType: employeeData.employmentType || 'Permanent',
      workLocation: employeeData.workLocation || 'On-site',
      status: employeeData.status || 'active',
      emergencyContact: {
        name: employeeData.emergencyContact?.name || '',
        relationship: employeeData.emergencyContact?.relationship || '',
        phone: {
          countryCode: employeeData.emergencyContact?.phone?.countryCode || '+91',
          number: employeeData.emergencyContact?.phone?.number || '',
        },
        address: employeeData.emergencyContact?.address || '',
      },
      workShift: employeeData.workShift || 'Day Shift',
    };
    
    console.log('🗺️ Resetting form with data:', formData);
    console.log('🏢 PropertyName being set in form:', formData.propertyName);
    reset(formData);

    if (employeeData.documents && employeeData.documents.length > 0) {
      console.log('📄 Setting uploaded documents:', employeeData.documents);
      setUploadedDocuments(employeeData.documents.map(doc => ({
        id: doc._id || Date.now() + Math.random(),
        type: doc.type || 'ID Proof',
        documentNumber: doc.documentNumber || '',
        preview: doc.documentUrl || '',
        name: doc.type || 'Document',
        file: null // We don't have the actual file in edit mode
      })));
    }
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: 'ID Proof', // Default type - user can change this
      documentNumber: '',
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  };

  const removeUploadedDocument = (documentId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const updateDocumentType = (documentId, type) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, type } : doc
    ));
  };

  const updateDocumentNumber = (documentId, documentNumber) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, documentNumber } : doc
    ));
  };

  const onSubmit = async (data) => {
    console.log('🚀 Form submission started:', { currentStep, totalSteps, isEditMode, employeeId });
    console.log('📋 Raw form data received:', data);
    
    if (currentStep !== totalSteps) {
      setErrorMessage(`Please complete all steps. You are currently on step ${currentStep} of ${totalSteps}.`);
      setShowErrorModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Find property name for the selected property
      const selectedProperty = properties.find(p => p._id === data.propertyId);
      const propertyName = selectedProperty ? selectedProperty.propertyName : data.propertyName || '';
      
      console.log('🏢 Property info:', { selectedProperty, propertyName, propertyId: data.propertyId });
      
      const employeeData = {
        ...data,
        ownerId: ownerId,
        propertyName: propertyName, // Ensure property name is always included
        documents: uploadedDocuments?.map(doc => ({
          type: doc.type,
          documentUrl: doc.preview,
          documentNumber: doc.documentNumber || '',
        })),
      };
      
      console.log('📤 Final employee data being sent:', employeeData);
      console.log('🔍 propertyName in payload:', employeeData.propertyName);

      let response;
      
      if (isEditMode && employeeId) {
        console.log('🔄 Updating employee with ID:', employeeId);
        response = await apiClient.put('/api/employee/update', {
          employeeId: employeeId,
          updateData: employeeData
        });
      } else {
        console.log('➕ Creating new employee');
        // Send employeeData directly as the payload
        response = await apiClient.post('/api/employee/create', employeeData);
      }
      
      console.log('📥 API Response:', response);
      
      if (response?.data && (response.data.code === 0 || response.data.success)) {
        console.log('✅ Employee saved successfully');
        setShowSuccessModal(true);
        if (!isEditMode) {
          reset();
          setUploadedDocuments([]);
        }
      } else {
        throw new Error(response?.data?.message || 'Failed to save employee');
      }
      
    } catch (err) {
      console.error(`🚨 Error ${isEditMode ? 'updating' : 'creating'} employee:`, err);
      setErrorMessage(err.message || `Failed to ${isEditMode ? 'update' : 'create'} employee. Please try again.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
  ];

  const employmentTypeOptions = [
    { value: 'Permanent', label: 'Permanent' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Temporary', label: 'Temporary' },
  ];

  const workLocationOptions = [
    { value: 'On-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'onLeave', label: 'On Leave' },
  ];

  const workShiftOptions = [
    { value: 'Day Shift', label: 'Day Shift' },
    { value: 'Night Shift', label: 'Night Shift' },
    { value: 'Rotating', label: 'Rotating' },
  ];

  const documentTypeOptions = [
    { value: 'ID Proof', label: 'ID Proof' },
    { value: 'Address Proof', label: 'Address Proof' },
    { value: 'Educational Certificate', label: 'Educational Certificate' },
    { value: 'Experience Certificate', label: 'Experience Certificate' },
    { value: 'Bank Details', label: 'Bank Details' },
    { value: 'Medical Certificate', label: 'Medical Certificate' },
    { value: 'Police Verification', label: 'Police Verification' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Loading state for edit mode */}
      {isLoading && isEditMode && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading employee data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Update Employee' : 'Add New Employee'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update existing employee information' : 'Add a new employee to your team'}
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

      <form className="space-y-6">
        {/* Only show form content if not loading in edit mode */}
        {!(isLoading && isEditMode) && (
        <>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Enter first name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Enter last name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      {...register('phone.countryCode')}
                      placeholder="+91"
                      className="w-20"
                      disabled
                      value="+91"
                    />
                    <Input
                      {...register('phone.number')}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  </div>
                  {errors.phone?.countryCode && (
                    <p className="text-red-500 text-xs">{errors.phone.countryCode.message}</p>
                  )}
                  {errors.phone?.number && (
                    <p className="text-red-500 text-xs">{errors.phone.number.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <div className="relative">
                    <select
                      id="gender"
                      {...register('gender')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className="px-3 py-2 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <div className="relative">
                    <select
                      id="maritalStatus"
                      {...register('maritalStatus')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {maritalStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register('address.street')}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('address.city')}
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('address.state')}
                    placeholder="Enter state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    {...register('address.zipCode')}
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Employment Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role/Position</Label>
                  <Input
                    id="role"
                    {...register('role')}
                    placeholder="e.g., Property Manager, Maintenance Staff"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyId">Assigned Property *</Label>
                  <div className="relative">
                    <select
                      id="propertyId"
                      {...register('propertyId')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="">Select Property</option>
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
                  {errors.propertyId && (
                    <p className="text-red-500 text-xs">{errors.propertyId.message}</p>
                  )}
                  {/* Hidden field for propertyName */}
                  <input
                    type="hidden"
                    {...register('propertyName')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <div className="relative">
                    <select
                      id="employmentType"
                      {...register('employmentType')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {employmentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                  <Label htmlFor="workLocation">Work Location</Label>
                  <div className="relative">
                    <select
                      id="workLocation"
                      {...register('workLocation')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {workLocationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                  <Label htmlFor="workShift">Work Shift</Label>
                  <div className="relative">
                    <select
                      id="workShift"
                      {...register('workShift')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {workShiftOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    {...register('joiningDate')}
                    className="px-3 py-2 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="relative">
                    <select
                      id="status"
                      {...register('status')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                  <Label htmlFor="endDate">End Date (if applicable)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    className="px-3 py-2 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {watch('status') === 'inactive' && (
                <div className="space-y-2">
                  <Label htmlFor="reasonForLeaving">Reason for Leaving</Label>
                  <textarea
                    id="reasonForLeaving"
                    {...register('reasonForLeaving')}
                    placeholder="Please specify the reason for leaving..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Emergency Contact & Documents */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      {...register('emergencyContact.name')}
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      {...register('emergencyContact.relationship')}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        {...register('emergencyContact.phone.countryCode')}
                        placeholder="+91"
                        className="w-20"
                        disabled
                        value="+91"
                      />
                      <Input
                        {...register('emergencyContact.phone.number')}
                        placeholder="Phone number"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactAddress">Address</Label>
                    <Input
                      id="emergencyContactAddress"
                      {...register('emergencyContact.address')}
                      placeholder="Emergency contact address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload documents</p>
                    <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG up to 10MB each</p>
                  </label>
                </div>
                
                {/* Display uploaded documents */}
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-3">
                    {uploadedDocuments.map((document) => (
                      <div key={document.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium">{document.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeUploadedDocument(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Document Type</Label>
                            <div className="relative">
                              <select
                                value={document.type}
                                onChange={(e) => updateDocumentType(document.id, e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                              >
                                {documentTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
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
                            <Label className="text-xs font-medium">Document Number</Label>
                            <Input
                              type="text"
                              placeholder="Enter document number"
                              value={document.documentNumber || ''}
                              onChange={(e) => updateDocumentNumber(document.id, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        </>
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
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? 'Updating Employee...' : 'Creating Employee...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Employee' : 'Create Employee'}
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
              {isEditMode ? 'Employee Updated!' : 'Employee Created!'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Employee has been successfully {isEditMode ? 'updated' : 'created'}.
            </p>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/app/employees');
              }}
              className="w-full"
            >
              View Employees
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

export default AddEmployeePage;