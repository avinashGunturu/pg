import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setInventory([
        {
          id: 1,
          name: 'Air Conditioning Unit',
          category: 'HVAC',
          location: 'Main Warehouse',
          quantity: 5,
          status: 'In Stock',
          lastUpdated: '2023-10-15',
          minQuantity: 2,
          cost: 1200.00,
        },
        {
          id: 2,
          name: 'Water Heater (50 Gallon)',
          category: 'Plumbing',
          location: 'Main Warehouse',
          quantity: 3,
          status: 'In Stock',
          lastUpdated: '2023-09-20',
          minQuantity: 2,
          cost: 850.00,
        },
        {
          id: 3,
          name: 'Refrigerator',
          category: 'Appliances',
          location: 'Sunset Apartments Storage',
          quantity: 1,
          status: 'Low Stock',
          lastUpdated: '2023-11-05',
          minQuantity: 2,
          cost: 1100.00,
        },
        {
          id: 4,
          name: 'LED Light Fixtures',
          category: 'Electrical',
          location: 'Main Warehouse',
          quantity: 25,
          status: 'In Stock',
          lastUpdated: '2023-10-30',
          minQuantity: 10,
          cost: 45.00,
        },
        {
          id: 5,
          name: 'Carpet (12x12 ft)',
          category: 'Flooring',
          location: 'Oakwood Residences Storage',
          quantity: 0,
          status: 'Out of Stock',
          lastUpdated: '2023-08-15',
          minQuantity: 5,
          cost: 350.00,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id) => {
    // In a real application, this would be an API call
    setInventory(inventory.filter(item => item.id !== id));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <Button as={Link} to="/inventory/add">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>Manage your equipment and supplies</CardDescription>
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading inventory...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1 text-center">Quantity</div>
                <div className="col-span-1 text-center">Cost</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredInventory.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No inventory items found matching your search.
                </div>
              ) : (
                filteredInventory.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 p-4 border-t items-center">
                    <div className="col-span-3 font-medium">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div>{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Last updated: {formatDate(item.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {item.category}
                    </div>
                    <div className="col-span-2">
                      {item.location}
                    </div>
                    <div className="col-span-1 text-center">
                      {item.quantity < item.minQuantity && item.quantity > 0 ? (
                        <div className="flex items-center justify-center">
                          {item.quantity}
                          <AlertTriangle className="h-4 w-4 ml-1 text-amber-500" />
                        </div>
                      ) : item.quantity === 0 ? (
                        <div className="flex items-center justify-center">
                          {item.quantity}
                          <AlertTriangle className="h-4 w-4 ml-1 text-red-500" />
                        </div>
                      ) : (
                        item.quantity
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      {formatCurrency(item.cost)}
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(item.status)}
                    </div>
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
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${item.id}`} className="cursor-pointer w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${item.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${item.id}/restock`} className="cursor-pointer w-full">
                              Restock
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${item.id}/history`} className="cursor-pointer w-full">
                              View History
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.id)}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(inventory.map(item => item.category)).size} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {inventory.filter(item => item.status === 'Low Stock').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below minimum quantity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {inventory.filter(item => item.status === 'Out of Stock').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items needing immediate restock
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryPage;