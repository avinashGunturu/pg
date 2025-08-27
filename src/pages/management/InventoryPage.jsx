import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, AlertTriangle, Loader2, Eye, Building2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useInventoryItems, useInventoryStats, useDeleteInventoryItem } from '@/hooks/useInventory';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const InventoryPage = () => {
  const { ownerId } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [properties, setProperties] = useState([]);
  
  const [filters, setFilters] = useState({
    propertyId: 'all',
    itemName: '',
    category: 'all',
    status: 'all',
  });

  // Construct filter data for API call
  const filterData = {
    ownerId: ownerId || '',
    propertyId: filters.propertyId === 'all' ? '' : filters.propertyId || '',
    itemName: searchQuery || filters.itemName || '',
    category: filters.category === 'all' ? '' : filters.category || '',
    status: filters.status === 'all' ? '' : filters.status || '',
  };

  // Fetch inventory data
  const { data: inventoryResponse, isLoading, error, refetch } = useInventoryItems(filterData);
  const { data: statsResponse, isLoading: statsLoading } = useInventoryStats(ownerId);
  const deleteInventoryMutation = useDeleteInventoryItem();
  
  // Parse inventory data
  const inventory = inventoryResponse?.data?.inventories || [];
  const stats = statsResponse?.data || {
    totalItems: 0,
    activeItems: 0,
    inactiveItems: 0,
    disposedItems: 0,
    lowStockItems: 0,
    totalValue: 0
  };

  // Fetch properties for filter dropdown
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
        
        const propertiesList = response?.data?.data?.properties || response?.data?.properties || [];
        setProperties(propertiesList);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      propertyId: 'all',
      itemName: '',
      category: 'all',
      status: 'all',
    });
    setSearchQuery('');
  };

  const handleDelete = async (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteInventoryMutation.mutateAsync(itemToDelete._id);
      toast.success('Inventory item deleted successfully!');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete inventory item';
      toast.error(`Error: ${errorMessage}`);
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-amber-500">Inactive</Badge>;
      case 'Disposed':
        return <Badge className="bg-red-500">Disposed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= 5) {
      return <Badge variant="secondary" className="bg-amber-500">Low Stock</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-500">In Stock</Badge>;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <Link to="/app/inventory/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Inventory</h3>
            <p className="text-gray-600 text-center mb-4">
              {error.message || 'Failed to load inventory items'}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <Link to="/app/inventory/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '-' : stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsLoading ? '-' : stats.activeItems}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '-' : formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>Manage your equipment and supplies across all properties</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="propertyFilter">Property</Label>
                  <Select value={filters.propertyId} onValueChange={(value) => handleFilterChange('propertyId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property._id} value={property._id}>
                          {property.propertyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="categoryFilter">Category</Label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Appliances">Appliances</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading inventory...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-center">Quantity</div>
                <div className="col-span-2 text-center">Price/Value</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {inventory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                  <p className="mb-4">
                    {searchQuery || Object.values(filters).some(f => f && f !== 'all') 
                      ? 'Try adjusting your search or filters.' 
                      : 'Get started by adding your first inventory item.'}
                  </p>
                  <Link to="/app/inventory/add">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Item
                    </Button>
                  </Link>
                </div>
              ) : (
                inventory.map((item) => {
                  const propertyName = properties.find(p => p._id === item.propertyId)?.propertyName || 'Unknown Property';
                  
                  return (
                    <div key={item._id} className="grid grid-cols-12 p-4 border-t items-center hover:bg-gray-50">
                      <div className="col-span-3 font-medium">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3 inline mr-1" />
                              {propertyName}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <Badge variant="outline">{item.category || 'Uncategorized'}</Badge>
                      </div>
                      
                      <div className="col-span-1 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">{item.quantity}</span>
                          {getStockStatus(item.quantity)}
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(item.pricePerUnit, item.currency)}/unit
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(item.totalValue || (item.pricePerUnit * item.quantity), item.currency)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="col-span-2 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/app/inventory/${item._id}`} className="cursor-pointer w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/app/inventory/${item._id}/edit`} className="cursor-pointer w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item
              "{itemToDelete?.itemName}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteInventoryMutation.isLoading}
            >
              {deleteInventoryMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryPage;