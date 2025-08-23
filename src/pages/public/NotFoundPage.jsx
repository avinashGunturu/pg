import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
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

      {/* 404 Content */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl text-center">
          {/* Illustration */}
          <div className="mb-8">
            <div className="relative mx-auto w-48 h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-full opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-6 shadow-lg">
                  <AlertTriangle className="h-12 w-12 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist or you may not have permission to view it.
          </p>

          {/* Single Action Button */}
          <Link to="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-xl">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
