import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  FileText, 
  CreditCard,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import transactionService from '@/services/api/transactionService';
import { useProperties } from '@/hooks/useProperties';
import { useTenants } from '@/hooks/useTenants';
import { toast } from 'sonner';

const TransactionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get properties and tenants for display
  const { data: properties = [] } = useProperties();
  const { data: tenants = [] } = useTenants();

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching transaction with ID:', id);
        
        const response = await transactionService.getTransactionById(id);
        console.log('🔍 Full transaction response:', response);
        
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
        
        console.log('🔍 Extracted transaction data:', transactionData);
        
        if (!transactionData || !transactionData._id) {
          throw new Error('Transaction not found');
        }
        
        setTransaction(transactionData);
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await transactionService.deleteTransaction(id);
      toast.success('Transaction deleted successfully');
      navigate('/app/financial');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/app/financial');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount, currency = 'INR') => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€'
    };
    return `${currencySymbols[currency] || '₹'}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PAID': { color: 'bg-green-500', text: 'Paid' },
      'PENDING': { color: 'bg-amber-500', text: 'Pending' },
      'DUE': { color: 'bg-orange-500', text: 'Due' },
      'FAILED': { color: 'bg-red-500', text: 'Failed' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-500', text: status };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p._id === propertyId || p.id === propertyId);
    return property?.propertyName || property?.name || property?.title || 'Unknown Property';
  };

  const getTenantName = (tenantId) => {
    if (!tenantId || tenantId === 'none') return null;
    const tenant = tenants.find(t => t._id === tenantId || t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading transaction details...</span>
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

  const isIncome = transaction.transactionType === 'INCOME' || transaction.transactionType === 'RENT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
            <p className="text-muted-foreground">
              View and manage transaction information
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to={`/app/financial/transactions/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the transaction
                  and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete Transaction
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isIncome ? (
                <ArrowUpRight className="h-8 w-8 text-green-500" />
              ) : (
                <ArrowDownRight className="h-8 w-8 text-red-500" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                </CardTitle>
                <CardDescription>
                  {transaction.transactionType} • {transaction.transactionSubType || 'No subcategory'}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(transaction.status)}
              <p className="text-sm text-muted-foreground mt-1">
                ID: {transaction._id || transaction.id}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{transaction.description || 'No description provided'}</p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Dates & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Transaction Date</span>
              <p className="mt-1">{formatDate(transaction.transactionDate)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Actual Payment Date</span>
              <p className="mt-1">{formatDate(transaction.actualPaymentDate)}</p>
            </div>
            {transaction.paidDate && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Paid Date</span>
                <p className="mt-1">{formatDate(transaction.paidDate)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
              <p className="mt-1">{transaction.paymentMethod || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Currency</span>
              <p className="mt-1">{transaction.currency}</p>
            </div>
            {transaction.externalPaymentId && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">External Payment ID</span>
                <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {transaction.externalPaymentId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property & Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Property & Tenant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Property</span>
            <p className="mt-1">{getPropertyName(transaction.propertyId)}</p>
          </div>
          {transaction.tenantId && transaction.tenantId !== 'none' && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Tenant</span>
              <p className="mt-1 flex items-center">
                <User className="mr-2 h-4 w-4" />
                {getTenantName(transaction.tenantId)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditional Detail Sections */}
      {/* Income Details */}
      {(transaction.transactionType === 'INCOME' || transaction.transactionType === 'RENT') && transaction.incomeDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpRight className="mr-2 h-5 w-5 text-green-500" />
              Income Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.incomeDetails.source && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Source</span>
                <p className="mt-1">{transaction.incomeDetails.source}</p>
              </div>
            )}
            {transaction.incomeDetails.receivedFrom && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Received From</span>
                <p className="mt-1">{transaction.incomeDetails.receivedFrom}</p>
              </div>
            )}
            {transaction.incomeDetails.paymentReference && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Payment Reference</span>
                <p className="mt-1">{transaction.incomeDetails.paymentReference}</p>
              </div>
            )}
            {transaction.incomeDetails.notes && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <p className="mt-1">{transaction.incomeDetails.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expense Details */}
      {transaction.transactionType === 'EXPENSE' && transaction.expenseDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownRight className="mr-2 h-5 w-5 text-red-500" />
              Expense Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.expenseDetails.category && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Category</span>
                <p className="mt-1">{transaction.expenseDetails.category}</p>
              </div>
            )}
            {transaction.expenseDetails.vendor && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Vendor</span>
                <p className="mt-1">{transaction.expenseDetails.vendor}</p>
              </div>
            )}
            {transaction.expenseDetails.invoiceNumber && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Invoice Number</span>
                <p className="mt-1">{transaction.expenseDetails.invoiceNumber}</p>
              </div>
            )}
            {transaction.expenseDetails.paymentReference && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Payment Reference</span>
                <p className="mt-1">{transaction.expenseDetails.paymentReference}</p>
              </div>
            )}
            {transaction.expenseDetails.notes && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <p className="mt-1">{transaction.expenseDetails.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rent Details */}
      {transaction.transactionType === 'RENT' && transaction.rentDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Rent Period Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {transaction.rentDetails.rentStartDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Rent Start Date</span>
                  <p className="mt-1">{formatDate(transaction.rentDetails.rentStartDate)}</p>
                </div>
              )}
              {transaction.rentDetails.rentEndDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Rent End Date</span>
                  <p className="mt-1">{formatDate(transaction.rentDetails.rentEndDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Section (placeholder for future implementation) */}
      {transaction.documentList && transaction.documentList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Document management feature coming soon.</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Information */}
      {transaction.audit && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              {transaction.audit.createdAt && (
                <div>
                  <span className="font-medium text-muted-foreground">Created:</span>
                  <p className="mt-1">{formatDate(transaction.audit.createdAt)}</p>
                  {transaction.audit.createdBy && (
                    <p className="text-muted-foreground">by {transaction.audit.createdBy}</p>
                  )}
                </div>
              )}
              {transaction.audit.updatedAt && (
                <div>
                  <span className="font-medium text-muted-foreground">Last Updated:</span>
                  <p className="mt-1">{formatDate(transaction.audit.updatedAt)}</p>
                  {transaction.audit.updatedBy && (
                    <p className="text-muted-foreground">by {transaction.audit.updatedBy}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetailsPage;