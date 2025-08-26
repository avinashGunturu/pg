import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, ArrowUpRight, ArrowDownRight, FileText, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import transactionService from '@/services/api/transactionService';
import { useProperties } from '@/hooks/useProperties';
import { useTenants } from '@/hooks/useTenants';
import { useAuth } from '@/context/AuthContext';

const FinancialPage = () => {
  const { ownerId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isDeleting, setIsDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch properties and tenants for filtering
  const { data: properties = [], isError: propertiesError } = useProperties();
  const { data: tenants = [], isError: tenantsError } = useTenants();

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const filters = {
        ownerId: ownerId || '68a643b5430dd953da794950',
        ...(propertyFilter && propertyFilter !== 'all' && { propertyId: propertyFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      };
      
      console.log('🚀 Fetching transactions with filters:', filters);
      const response = await transactionService.getTransactions(filters);
      
      // Handle different possible response structures
      let transactionData;
      if (response.data?.data?.transactions) {
        transactionData = response.data.data.transactions;
      } else if (response.data?.transactions) {
        transactionData = response.data.transactions;
      } else if (response.transactions) {
        transactionData = response.transactions;
      } else if (response.data) {
        transactionData = response.data;
      } else {
        transactionData = response;
      }
      
      // Ensure we always have an array
      const finalTransactions = Array.isArray(transactionData) ? transactionData : [];
      console.log('✅ Loaded', finalTransactions.length, 'transactions');
      
      setTransactions(finalTransactions);
      
      if (finalTransactions.length === 0 && Object.keys(filters).length > 1) {
        toast.info('No transactions found for the current filters');
      }
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      toast.error(`Failed to fetch transactions: ${error.message || 'Unknown error'}`);
      // Ensure we always have an empty array on error
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [ownerId, propertyFilter, statusFilter, dateRange]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('.filter-dropdown')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Filter transactions based on search and tab
  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter(transaction => {
    // Search filter
    const matchesSearch = 
      !searchQuery ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionSubType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.externalPaymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount?.toString().includes(searchQuery);
    
    // Tab filter
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'income') return matchesSearch && transaction.transactionType === 'INCOME';
    if (activeTab === 'expense') return matchesSearch && transaction.transactionType === 'EXPENSE';
    if (activeTab === 'rent') return matchesSearch && transaction.transactionType === 'RENT';
    
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      setIsDeleting(transactionToDelete._id || transactionToDelete.id);
      await transactionService.deleteTransaction(transactionToDelete._id || transactionToDelete.id);
      toast.success('Transaction deleted successfully');
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  const getTransactionIcon = (transactionType) => {
    if (transactionType === 'INCOME' || transactionType === 'RENT') {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p._id === propertyId || p.id === propertyId);
    return property?.propertyName || property?.name || property?.title || 'Unknown Property';
  };

  const getTenantName = (tenantId) => {
    if (!tenantId || tenantId === 'none') return 'N/A';
    const tenant = tenants.find(t => t._id === tenantId || t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant';
  };

  // Check if any filters are active
  const hasActiveFilters = propertyFilter || statusFilter || dateRange.startDate || dateRange.endDate;

  // Calculate totals
  const totals = (Array.isArray(filteredTransactions) ? filteredTransactions : []).reduce((acc, transaction) => {
    const amount = Number(transaction.amount || 0);
    if (transaction.transactionType === 'INCOME' || transaction.transactionType === 'RENT') {
      acc.income += amount;
      acc.incomeCount += 1;
    } else if (transaction.transactionType === 'EXPENSE') {
      acc.expenses += amount;
      acc.expenseCount += 1;
    }
    return acc;
  }, { income: 0, expenses: 0, incomeCount: 0, expenseCount: 0 });

  const netIncome = totals.income - totals.expenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <Button asChild>
          <Link to="/app/financial/transactions/add">
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totals.incomeCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.expenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totals.expenseCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netIncome >= 0 ? 'Profit' : 'Loss'} for current period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Manage your financial transactions</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="relative">
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative ${hasActiveFilters && !showFilters ? 'border-primary' : ''}`}
                  title={showFilters ? 'Hide filters' : 'Show filters'}
                >
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && !showFilters && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
                  )}
                </Button>
                
                {/* Filter dropdown positioned below the button */}
                {showFilters && (
                  <div className="filter-dropdown absolute top-full right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg p-4 z-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Reset all filters
                          setPropertyFilter('');
                          setStatusFilter('');
                          setDateRange({ startDate: '', endDate: '' });
                          toast.info('Filters cleared');
                          // Immediately fetch with cleared filters
                          setTimeout(() => {
                            fetchTransactions();
                          }, 100);
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Property</label>
                        <Select value={propertyFilter} onValueChange={(value) => {
                          setPropertyFilter(value);
                          // Auto-apply filter after a short delay
                          setTimeout(fetchTransactions, 300);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Properties" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {propertiesError ? (
                              <SelectItem value="error" disabled>Error loading properties</SelectItem>
                            ) : properties.length > 0 ? (
                              properties.map((property) => (
                                <SelectItem key={property._id || property.id} value={property._id || property.id}>
                                  {property.propertyName || property.name || property.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>No properties available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select value={statusFilter} onValueChange={(value) => {
                          setStatusFilter(value);
                          // Auto-apply filter after a short delay
                          setTimeout(fetchTransactions, 300);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="DUE">Due</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Start Date</label>
                          <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => {
                              setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                              // Auto-apply filter after a short delay
                              setTimeout(fetchTransactions, 500);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">End Date</label>
                          <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => {
                              setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                              // Auto-apply filter after a short delay
                              setTimeout(fetchTransactions, 500);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="rent">Rent</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading transactions...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium gap-x-2">
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-2">Property</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filteredTransactions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No transactions found matching your criteria.
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction._id || transaction.id} className="grid grid-cols-12 p-4 border-t items-center gap-x-2">
                    <div className="col-span-2 font-medium">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.transactionType)}
                        <span className="ml-1 text-sm">{transaction.transactionSubType || transaction.transactionType}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">{formatDate(transaction.transactionDate)}</div>
                      {transaction.actualPaymentDate !== transaction.transactionDate && (
                        <div className="text-xs text-muted-foreground">
                          Paid: {formatDate(transaction.actualPaymentDate)}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">{transaction.description || 'No description'}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.externalPaymentId ? `Ref: ${transaction.externalPaymentId}` : 'No reference'}
                      </div>
                      {transaction.tenantId && transaction.tenantId !== 'none' && (
                        <div className="text-xs text-blue-600">
                          Tenant: {getTenantName(transaction.tenantId)}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-sm">
                      {getPropertyName(transaction.propertyId)}
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className={`col-span-2 text-right font-medium ${
                      transaction.transactionType === 'INCOME' || transaction.transactionType === 'RENT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transactionType === 'INCOME' || transaction.transactionType === 'RENT' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting === (transaction._id || transaction.id)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/app/financial/transactions/${transaction._id || transaction.id}`} className="cursor-pointer w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/financial/transactions/${transaction._id || transaction.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transaction)}
                            className="text-red-600 cursor-pointer"
                            disabled={isDeleting === (transaction._id || transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === (transaction._id || transaction.id) ? 'Deleting...' : 'Delete'}
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

      {/* Action Buttons - Commented out as requested */}
      {/* <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/dashboard/reports">
            <FileText className="mr-2 h-4 w-4" />
            Financial Reports
          </Link>
        </Button>
        <Button variant="outline" onClick={() => toast.info('Export feature coming soon!')}>
          Export Transactions
        </Button>
      </div> */}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Transaction</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            {transactionToDelete && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm font-medium">{transactionToDelete.description || 'No description'}</p>
                <p className="text-sm text-gray-600">
                  {transactionToDelete.transactionType} • {formatCurrency(transactionToDelete.amount, transactionToDelete.currency)}
                </p>
              </div>
            )}
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTransactionToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Transaction'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPage;