import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InventoryForm from '@/components/forms/InventoryForm';
import SuccessFailureModal from '@/components/ui/SuccessFailureModal';
import { useCreateInventoryItem } from '@/hooks/useInventory';
import { toast } from 'sonner';

const AddInventoryPage = () => {
  const navigate = useNavigate();
  const createInventoryMutation = useCreateInventoryItem();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting inventory data:', formData);
      
      // Use the mutation to create the inventory item (without toast since hook handles it)
      await createInventoryMutation.mutateAsync(formData);
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'Inventory item has been created successfully. You can now view it in the inventory list.'
      });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      
      // Extract error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create inventory item. Please try again.';
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Creation Failed',
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
          <h1 className="text-2xl font-bold tracking-tight">Add New Inventory Item</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Item Details</CardTitle>
          <CardDescription>
            Fill in the information below to add a new inventory item to your property management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryForm
            onSubmit={handleSubmit}
            isEditing={false}
          />
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

export default AddInventoryPage;