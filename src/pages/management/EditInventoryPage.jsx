import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InventoryForm from '@/components/forms/InventoryForm';
import SuccessFailureModal from '@/components/ui/SuccessFailureModal';
import { useInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const EditInventoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerId } = useAuth();
  const updateInventoryMutation = useUpdateInventoryItem();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fetch inventory item data
  const { data: inventoryResponse, isLoading: queryLoading, error: queryError } = useInventoryItem(id, ownerId);

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
      const items = inventoryResponse.data?.inventories || [];
      
      if (items.length > 0) {
        const item = items[0]; // Get the first (and should be only) item
        
        // Transform the data to match the form structure
        const transformedData = {
          propertyId: item.propertyId || '',
          itemName: item.itemName || '',
          category: item.category || '',
          quantity: item.quantity || 0,
          pricePerUnit: item.pricePerUnit || 0,
          currency: item.currency || 'INR',
          recurring: item.recurring || false,
          maintenanceFrequency: item.maintenanceFrequency || '',
          supplier: {
            supplierName: item.supplier?.supplierName || '',
            contactNumber: item.supplier?.contactNumber || '',
            email: item.supplier?.email || '',
            street: item.supplier?.address?.street || '',
            city: item.supplier?.address?.city || '',
            state: item.supplier?.address?.state || '',
            zipCode: item.supplier?.address?.zipCode || '',
            country: item.supplier?.address?.country || '',
          },
          maintenance: item.maintenance || [],
          status: item.status || 'Active',
          notes: item.notes || '',
        };
        
        setInventoryData(transformedData);
        console.log('Inventory data loaded for editing:', transformedData);
      } else {
        setError('Inventory item not found');
      }
    } else {
      setError('Inventory item not found');
    }
    
    setIsLoading(false);
  }, [queryLoading, queryError, inventoryResponse]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('Updating inventory item:', id, formData);
      
      // Use the mutation to update the inventory item
      await updateInventoryMutation.mutateAsync({
        inventoryId: id,
        updateData: formData
      });
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Updated Successfully!',
        message: 'Inventory item has been updated successfully. You can now view the changes in the inventory list.'
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      
      // Extract error message from the response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update inventory item. Please try again.';
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.type === 'success') {
      // Navigate back to inventory list on success
      navigate('/app/inventory');
    }
  };

  const handleBack = () => {
    navigate('/app/inventory');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading inventory item...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight">Edit Inventory Item</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Update Inventory Item Details</CardTitle>
          <CardDescription>
            Modify the information below to update the inventory item.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryData && (
            <InventoryForm
              initialData={inventoryData}
              onSubmit={handleSubmit}
              isEditing={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Success/Failure Modal */}
      <SuccessFailureModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={handleModalClose}
        actionLabel={modalState.type === 'success' ? 'Go to Inventory List' : 'Try Again'}
      />
    </div>
  );
};

export default EditInventoryPage;