import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import TransactionForm from '@/components/forms/TransactionForm';
import transactionService from '@/services/api/transactionService';
import { toast } from 'sonner';

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTransactionId, setCreatedTransactionId] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Create the transaction using the service
      const response = await transactionService.createTransaction(formData);
      
      // Extract transaction ID from response
      const transactionId = response.data?.transaction?._id || response.transaction?._id || response._id;
      setCreatedTransactionId(transactionId);
      
      // Only show modal, no toast (prevents duplicate notifications)
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      // Extract error message
      let errorMsg = 'Failed to create transaction. Please try again.';
      if (error.message) {
        errorMsg = error.message;
      } else if (error.error) {
        errorMsg = error.error;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      // Only show modal, no toast (prevents duplicate notifications)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/app/financial');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Transaction</h1>
          <p className="text-muted-foreground">
            Create a new financial transaction for your property management
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Fill in the details for the new transaction. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            onSubmit={handleSubmit}
            isEditing={false}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600">Income Transactions</h4>
              <p className="text-muted-foreground">
                Use for rental payments, security deposits, application fees, and other property income.
                You can select a tenant for income transactions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-red-600">Expense Transactions</h4>
              <p className="text-muted-foreground">
                Use for maintenance costs, repairs, utilities, and other property expenses.
                Tenant selection is not required for expenses.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-600">Rent Transactions</h4>
              <p className="text-muted-foreground">
                Specific type for rental payments with defined rent periods.
                Requires both tenant selection and rent period dates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-600 mb-4">Transaction has been created successfully.</p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/app/financial');
                }}
                className="flex-1"
              >
                Go to Transactions
              </Button>
              {createdTransactionId && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/app/financial/transactions/${createdTransactionId}`);
                  }}
                  className="flex-1"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
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

export default AddTransactionPage;