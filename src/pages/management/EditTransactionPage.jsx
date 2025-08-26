import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import TransactionForm from '@/components/forms/TransactionForm';
import transactionService from '@/services/api/transactionService';
import { toast } from 'sonner';

const EditTransactionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching transaction for edit with ID:', id);
        
        const response = await transactionService.getTransactionById(id);
        console.log('🔍 Full edit transaction response:', response);
        
        // Handle different possible response structures
        let transactionData;
        if (response.data?.data?.transactions && response.data.data.transactions.length > 0) {
          transactionData = response.data.data.transactions[0];
        } else if (response.data?.transactions && response.data.transactions.length > 0) {
          transactionData = response.data.transactions[0];
        } else if (response.data?.transaction) {
          transactionData = response.data.transaction;
        } else if (response.transaction) {
          transactionData = response.transaction;
        } else if (response.data) {
          transactionData = response.data;
        } else {
          transactionData = response;
        }
        
        console.log('🔍 Extracted transaction data for edit:', transactionData);
        
        if (!transactionData || !transactionData._id) {
          throw new Error('Transaction not found');
        }
        
        // Transform data to match form schema
        const formData = {
          ownerId: transactionData.ownerId,
          propertyId: transactionData.propertyId || '',
          tenantId: transactionData.tenantId || 'none',
          transactionType: transactionData.transactionType,
          transactionSubType: transactionData.transactionSubType || 'none',
          amount: transactionData.amount,
          currency: transactionData.currency,
          transactionDate: transactionData.transactionDate ? transactionData.transactionDate.split('T')[0] : '',
          actualPaymentDate: transactionData.actualPaymentDate ? transactionData.actualPaymentDate.split('T')[0] : '',
          paidDate: transactionData.paidDate ? transactionData.paidDate.split('T')[0] : '',
          paymentMethod: transactionData.paymentMethod || 'none',
          status: transactionData.status,
          description: transactionData.description || '',
          externalPaymentId: transactionData.externalPaymentId || '',
          
          // Income details
          incomeSource: transactionData.incomeDetails?.source || '',
          incomeReceivedFrom: transactionData.incomeDetails?.receivedFrom || '',
          incomePaymentReference: transactionData.incomeDetails?.paymentReference || '',
          incomeNotes: transactionData.incomeDetails?.notes || '',
          
          // Expense details
          expenseCategory: transactionData.expenseDetails?.category || '',
          expenseVendor: transactionData.expenseDetails?.vendor || '',
          expenseInvoiceNumber: transactionData.expenseDetails?.invoiceNumber || '',
          expensePaymentReference: transactionData.expenseDetails?.paymentReference || '',
          expenseNotes: transactionData.expenseDetails?.notes || '',
          
          // Rent details
          rentStartDate: transactionData.rentDetails?.rentStartDate ? transactionData.rentDetails.rentStartDate.split('T')[0] : '',
          rentEndDate: transactionData.rentDetails?.rentEndDate ? transactionData.rentDetails.rentEndDate.split('T')[0] : '',
        };
        
        console.log('🔍 Transformed form data:', formData);
        setTransaction(formData);
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast.error('Failed to load transaction data');
        navigate('/app/financial');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Update the transaction using the service
      const response = await transactionService.updateTransaction(id, formData);
      
      toast.success('Transaction updated successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      
      // Extract error message
      let errorMsg = 'Failed to update transaction. Please try again.';
      if (error.message) {
        errorMsg = error.message;
      } else if (error.error) {
        errorMsg = error.error;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/app/financial');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading transaction data...</span>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Transaction not found</h2>
          <p className="text-gray-600 mt-2">The transaction you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} className="mt-4">
            Go Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Transaction</h1>
          <p className="text-muted-foreground">
            Update the details of this transaction
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Update the transaction information. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            initialData={transaction}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        </CardContent>
      </Card>

      {/* Transaction Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Transaction ID:</span>
              <span className="ml-2 text-muted-foreground">{id}</span>
            </div>
            <div>
              <span className="font-medium">Type:</span>
              <span className="ml-2 text-muted-foreground">{transaction.transactionType}</span>
            </div>
            <div>
              <span className="font-medium">Current Status:</span>
              <span className="ml-2 text-muted-foreground">{transaction.status}</span>
            </div>
            <div>
              <span className="font-medium">Amount:</span>
              <span className="ml-2 text-muted-foreground">
                {transaction.currency} {transaction.amount}
              </span>
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
            <p className="text-sm text-gray-600 mb-4">Transaction has been updated successfully.</p>
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
              <Button 
                variant="outline"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/app/financial/transactions/${id}`);
                }}
                className="flex-1"
              >
                View Details
              </Button>
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

export default EditTransactionPage;