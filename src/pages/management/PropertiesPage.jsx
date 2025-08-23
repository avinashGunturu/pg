import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Bed, Home, Users, AlertTriangle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const PropertiesPage = () => {
  const { ownerId } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    occupancyRate: 0
  });

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        // Using the correct API endpoint
        const response = await apiClient.post('/api/property/list', { 
          ownerId: ownerId || '68a643b5430dd953da794950' 
        });
        console.log('Property API response:', response);
        
        let properties = response?.data?.data?.properties;
        
        if (Array.isArray(properties)) {
          // Map API response to the format expected by the UI with enhanced fields
          const mappedProperties = properties.map(prop => ({
            id: prop._id,
            name: prop.propertyName,
            address: `${prop.propertyAddress?.addressLine1 || ''}, ${prop.propertyAddress?.city || ''}, ${prop.propertyAddress?.state || ''} ${prop.propertyAddress?.pincode || ''}`,
            rooms: prop.facilities?.totalRooms || 0,
            beds: prop.facilities?.totalBedCapacity || 0,
            occupiedBeds: prop.facilities?.occupiedBeds || 0,
            type: prop.propertyType,
            status: prop.propertyStatus === 'ACTIVE' ? 'Active' : 'Maintenance',
            email: prop.contactDetails?.email || '',
            phone: prop.contactDetails?.phoneNumber || '',
            city: prop.propertyAddress?.city || '',
            state: prop.propertyAddress?.state || '',
            pincode: prop.propertyAddress?.pincode || '',
            createdAt: new Date(prop.createdAt || Date.now()).toLocaleDateString(),
            amenities: prop.facilities?.amenities || [],
            description: prop.description || '',
            rawData: prop // Store the raw data for the details page
          }));
          
          setProperties(mappedProperties);
          
          // Calculate enhanced stats
          const totalProps = mappedProperties.length;
          const totalRooms = mappedProperties.reduce((sum, prop) => sum + (parseInt(prop.rooms) || 0), 0);
          const totalBeds = mappedProperties.reduce((sum, prop) => sum + (parseInt(prop.beds) || 0), 0);
          const occupiedBeds = mappedProperties.reduce((sum, prop) => sum + (parseInt(prop.occupiedBeds) || 0), 0);
          const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
          
          setStats({
            totalProperties: totalProps,
            totalRooms,
            totalBeds,
            occupiedBeds,
            occupancyRate
          });
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Fallback to demo data if API fails
        setProperties([
          {
            id: 1,
            name: 'Sunset Apartments',
            address: '123 Main St, Anytown, CA 90210',
            rooms: 12,
            beds: 24,
            occupiedBeds: 20,
            type: 'Apartment Complex',
            status: 'Active',
            email: 'info@sunset.com',
            phone: '555-123-4567',
            city: 'Anytown',
            state: 'CA',
            pincode: '90210',
            createdAt: '01/15/2023',
            amenities: ['WiFi', 'Parking', 'Laundry'],
            description: 'Modern apartment complex with great amenities'
          },
          {
            id: 2,
            name: 'Oakwood Residences',
            address: '456 Oak Ave, Somewhere, CA 90211',
            rooms: 8,
            beds: 16,
            occupiedBeds: 12,
            type: 'Townhouses',
            status: 'Active',
            email: 'info@oakwood.com',
            phone: '555-987-6543',
            city: 'Somewhere',
            state: 'CA',
            pincode: '90211',
            createdAt: '03/22/2023',
            amenities: ['Pool', 'Gym', 'Security'],
            description: 'Luxury townhouses in a quiet neighborhood'
          },
          {
            id: 3,
            name: 'Riverside Condos',
            address: '789 River Rd, Elsewhere, CA 90212',
            rooms: 6,
            beds: 12,
            occupiedBeds: 8,
            type: 'Condominiums',
            status: 'Maintenance',
            email: 'info@riverside.com',
            phone: '555-456-7890',
            city: 'Elsewhere',
            state: 'CA',
            pincode: '90212',
            createdAt: '06/10/2023',
            amenities: ['River View', 'Balcony', 'Parking'],
            description: 'Scenic condos with river views and modern amenities'
          },
        ]);
        
        // Set fallback stats
        setStats({
          totalProperties: 3,
          totalRooms: 26,
          totalBeds: 52,
          occupiedBeds: 40,
          occupancyRate: 77
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [ownerId]);

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id) => {
    // Set the property to delete and show confirmation popup
    const property = properties.find(p => p.id === id);
    setPropertyToDelete(property);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      setDeleteLoading(true);
      console.log('🗑️ Deleting property:', propertyToDelete.id);
      
      const response = await apiClient.post('/api/property/delete', {
        propertyId: propertyToDelete.id
      });
      
      console.log('✅ Delete API response:', response);
      
      if (response?.data?.code === 0 || response?.data?.success) {
        console.log('🎉 Property deleted successfully!');
        // Remove from local state
        setProperties(properties.filter(property => property.id !== propertyToDelete.id));
        // Close popup
        setShowDeleteConfirm(false);
        setPropertyToDelete(null);
        // Reload the page to refresh data
        window.location.reload();
      } else {
        throw new Error(response?.data?.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('🚨 Error deleting property:', error);
      alert(`Failed to delete property: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPropertyToDelete(null);
  };
  
  const handleViewDetails = (property) => {
    // Navigate to property details page with property data
    navigate(`/app/properties/details/${property.id}`, { state: { property } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <Button onClick={() => navigate('/app/properties/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>
      
      {/* Enhanced Property Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : `${stats.totalProperties} properties in your portfolio`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : `${stats.totalRooms} total rooms across all properties`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeds}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : `${stats.totalBeds} total beds available`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupiedBeds}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : `${stats.occupiedBeds} of ${stats.totalBeds} beds occupied (${stats.occupancyRate}%)`}
            </p>
            {/* Enhanced occupied beds display with progress bar */}
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalBeds > 0 ? (stats.occupiedBeds / stats.totalBeds) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{stats.occupiedBeds} occupied</span>
                <span>{stats.totalBeds - stats.occupiedBeds} available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Property List</CardTitle>
              <CardDescription>Manage your properties and units</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading properties...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Property</div>
                <div className="col-span-3">Address</div>
                <div className="col-span-1 text-center">Rooms</div>
                <div className="col-span-1 text-center">Beds</div>
                <div className="col-span-1 text-center">Occupied</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredProperties.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No properties found matching your search.
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div key={property.id} className="grid grid-cols-12 p-4 border-t items-center">
                    <div className="col-span-3 font-medium flex items-center">
                      <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="cursor-pointer hover:text-blue-600" onClick={() => handleViewDetails(property)}>
                          {property.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.status === 'Active' ? (
                            <span className="text-green-600">● Active</span>
                          ) : (
                            <span className="text-amber-600">● Maintenance</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm">{property.address}</div>
                    <div className="col-span-1 text-center">{property.rooms}</div>
                    <div className="col-span-1 text-center">{property.beds}</div>
                    <div className="col-span-1 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-gray-900">
                          {property.occupiedBeds}/{property.beds}
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-green-500 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${property.beds > 0 ? (property.occupiedBeds / property.beds) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {property.beds > 0 ? Math.round((property.occupiedBeds / property.beds) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">{property.type}</div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(property)} className="cursor-pointer">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/properties/add?edit=true&id=${property.id}`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem asChild>
                            <Link to={`/app/properties/${property.id}/units`} className="cursor-pointer w-full">
                              Manage Units
                            </Link>
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Property
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{propertyToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="flex-1"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Property'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;