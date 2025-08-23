import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Building2, CheckCircle2, Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock, Info, X } from 'lucide-react';
import apiClient from '@/services/apiClient';
import API_CONFIG from '@/config/api';

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobileNumber: z.string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNumber: `+91${data.mobileNumber}`,
        password: data.password,
      };
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      const result = response.data;

      console.log("result", result);
      
      if (result.code !== 0) {
        throw new Error(result.message || 'Registration failed. Please try again.');
      }

      const verifyResponse = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY+`/${result?.data?.id}`);

      const verifyResult = verifyResponse.data;

      if(verifyResult.code !== 0){
        throw new Error(verifyResult.message || 'Registration failed. Please try again.');
      }

      // Show success modal
      setShowSuccessModal(true);
      
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with Logo */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="relative">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              PGMate
            </span>
          </Link>
        </div>
      </div>
      
      {/* Register Form */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <User className="h-4 w-4 mr-2" />
              Join PGMate
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Create Your 
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Owner Account
              </span>
            </h1>
            <p className="text-gray-600">
              Start managing your PG properties efficiently with our comprehensive platform
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Important Note at Top */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800 mb-1">Important Note:</p>
                    <p className="text-xs text-blue-700">
                      Please ensure your email and mobile number are correct. You'll receive OTP verification and important communications on these contact details.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* First Row: Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        {...register('firstName')}
                        className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        {...register('lastName')}
                        className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Second Row: Email and Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        {...register('email')}
                        className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                        +91
                      </div>
                      <Input
                        id="mobileNumber"
                        type="text"
                        placeholder="9876543210"
                        {...register('mobileNumber')}
                        className={`pl-12 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.mobileNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <Phone className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* Third Row: Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className={`pl-10 pr-12 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Must contain at least 8 characters with uppercase, lowercase, and number
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                        className={`pl-10 pr-12 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button - Always Visible */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer and Trust Indicators */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Secure & encrypted</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              
              {/* Success Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Account Created Successfully!
              </h3>
              
              {/* Success Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Welcome to PGMate! Your account has been created successfully. You can now sign in to start managing your PG properties.
              </p>
              

              
              {/* Action Button */}
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl py-3 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Continue to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Error Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Registration Failed
              </h3>
              
              {/* Error Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {errorMessage}
              </p>
              
              {/* Action Button */}
              <Button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl py-3 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Try Again
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;