import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Building2, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Wrench,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useInventoryItem } from '@/hooks/useInventory';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const InventoryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const [properties, setProperties] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inventory item data
  const { data: inventoryResponse, isLoading: queryLoading, error: queryError } = useInventoryItem(id, ownerId);

  // Fetch properties for property name resolution
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await apiClient.post('/api/property/list', {
          ownerId: ownerId || '',
          propertyId: '',
          location: '',
          propertyName: '',
          propertyCategory: ''
        });
        
        const propertiesList = response?.data?.properties || response?.data?.properties || [];
        setProperties(propertiesList);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  // Process inventory data when received
  useEffect(() => {
    if (queryLoading) {
      setIsLoading(true);
      return;
    }

    if (queryError) {
      console.error('Error fetching inventory item:', queryError);
      setError('Failed to load inventory item');
      setIsLoading(false);
      return;
    }

    if (inventoryResponse?.data) {
      const items = inventoryResponse?.data?.inventories || [];
      
      if (items.length > 0) {
        setInventoryData(items[0]); // Get the first (and should be only) item
        console.log('Inventory data loaded:', items[0]);
      } else {
        setError('Inventory item not found');
      }
    } else {
      setError('Inventory item not found');
    }
    
    setIsLoading(false);
  }, [queryLoading, queryError, inventoryResponse]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'Disposed':
        return <Badge className="bg-red-500"><Shield className="h-3 w-3 mr-1" />Disposed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
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

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p._id === propertyId);
    return property ? property.propertyName : 'Unknown Property';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/inventory')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading inventory details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/inventory')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Inventory Item</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/inventory')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inventory Item Not Found</h3>
            <p className="text-gray-600 text-center">The requested inventory item could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/app/inventory')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">{inventoryData.itemName}</h1>
            {getStatusBadge(inventoryData.status)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <a href={`/app/inventory/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Item
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Item Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Item Name</label>
                <p className="text-lg font-semibold">{inventoryData.itemName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p>{inventoryData.category || 'Uncategorized'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-lg font-semibold">{inventoryData.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>{getStatusBadge(inventoryData.status)}</div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Property</label>
              <div className="flex items-center mt-1">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{getPropertyName(inventoryData.propertyId)}</p>
              </div>
            </div>

            {inventoryData.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{inventoryData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Pricing & Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Price per Unit</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(inventoryData.pricePerUnit, inventoryData.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Value</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(inventoryData.totalValue || (inventoryData.pricePerUnit * inventoryData.quantity), inventoryData.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Currency</label>
                <p>{inventoryData.currency || 'INR'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Recurring Item</label>
                <p>{inventoryData.recurring ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            {inventoryData.maintenanceFrequency && (
              <div>
                <label className="text-sm font-medium text-gray-500">Maintenance Frequency</label>
                <p>{inventoryData.maintenanceFrequency}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Information */}
      {inventoryData.supplier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier Name</label>
                <p className="font-semibold">{inventoryData.supplier.supplierName}</p>
              </div>
              
              {inventoryData.supplier.contactNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{inventoryData.supplier.contactNumber}</p>
                  </div>
                </div>
              )}
              
              {inventoryData.supplier.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{inventoryData.supplier.email}</p>
                  </div>
                </div>
              )}
              
              {inventoryData.supplier.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <div className="flex items-start mt-1">
                    <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      {inventoryData.supplier.address.street && <p>{inventoryData.supplier.address.street}</p>}
                      <p>
                        {[inventoryData.supplier.address.city, inventoryData.supplier.address.state, inventoryData.supplier.address.zipCode]
                          .filter(Boolean).join(', ')}
                      </p>
                      {inventoryData.supplier.address.country && <p>{inventoryData.supplier.address.country}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance History */}
      {inventoryData.maintenance && inventoryData.maintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Maintenance History
            </CardTitle>
            <CardDescription>
              Record of maintenance activities for this inventory item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryData.maintenance.map((maintenance, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{maintenance.type}</h4>
                    {maintenance.cost && (
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(maintenance.cost, maintenance.currency)}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    {maintenance.date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Date: {formatDate(maintenance.date)}</span>
                      </div>
                    )}
                    
                    {maintenance.scheduledDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Scheduled: {formatDate(maintenance.scheduledDate)}</span>
                      </div>
                    )}
                    
                    {maintenance.responsiblePerson?.name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>By: {maintenance.responsiblePerson.name}</span>
                        {maintenance.responsiblePerson.role && (
                          <span className="text-muted-foreground ml-1">({maintenance.responsiblePerson.role})</span>
                        )}
                      </div>
                    )}
                    
                    {maintenance.responsiblePerson?.contact?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{maintenance.responsiblePerson.contact.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {maintenance.note && (
                    <div className="mt-3">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <p className="text-sm text-gray-700">{maintenance.note}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p>{formatDate(inventoryData.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p>{formatDate(inventoryData.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDetailsPage;