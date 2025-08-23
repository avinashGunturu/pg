import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
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

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setTransactions([
        {
          id: 1,
          date: '2023-11-01',
          description: 'Rent Payment - Unit A101',
          category: 'Income',
          type: 'Rent',
          amount: 1500.00,
          property: 'Sunset Apartments',
          status: 'Completed',
          reference: 'TRX-10001',
        },
        {
          id: 2,
          date: '2023-11-02',
          description: 'HVAC Repair - Unit B205',
          category: 'Expense',
          type: 'Maintenance',
          amount: 450.00,
          property: 'Oakwood Residences',
          status: 'Completed',
          reference: 'TRX-10002',
        },
        {
          id: 3,
          date: '2023-11-05',
          description: 'Security Deposit - Unit C103',
          category: 'Income',
          type: 'Deposit',
          amount: 1000.00,
          property: 'Riverside Condos',
          status: 'Completed',
          reference: 'TRX-10003',
        },
        {
          id: 4,
          date: '2023-11-10',
          description: 'Property Insurance Payment',
          category: 'Expense',
          type: 'Insurance',
          amount: 2500.00,
          property: 'All Properties',
          status: 'Pending',
          reference: 'TRX-10004',
        },
        {
          id: 5,
          date: '2023-11-15',
          description: 'Landscaping Services',
          category: 'Expense',
          type: 'Maintenance',
          amount: 800.00,
          property: 'Pine Street Houses',
          status: 'Completed',
          reference: 'TRX-10005',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'income') return matchesSearch && transaction.category === 'Income';
    if (activeTab === 'expense') return matchesSearch && transaction.category === 'Expense';
    if (activeTab === 'pending') return matchesSearch && transaction.status === 'Pending';
    
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id) => {
    // In a real application, this would be an API call
    setTransactions(transactions.filter(transaction => transaction.id !== id));
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
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'Failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryIcon = (category) => {
    if (category === 'Income') {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
  };

  const totalIncome = transactions
    .filter(t => t.category === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.category === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <Button as={Link} to="/financial/add-transaction">
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {transactions.filter(t => t.category === 'Income').length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {transactions.filter(t => t.category === 'Expense').length} transactions
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading transactions...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Description</div>
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
                  <div key={transaction.id} className="grid grid-cols-12 p-4 border-t items-center">
                    <div className="col-span-1 font-medium">
                      <div className="flex items-center">
                        {getCategoryIcon(transaction.category)}
                        <span className="ml-1">{transaction.type}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="col-span-3">
                      <div>{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Ref: {transaction.reference}
                      </div>
                    </div>
                    <div className="col-span-2">
                      {transaction.property}
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className={`col-span-2 text-right font-medium ${transaction.category === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.category === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
                            <Link to={`/financial/transactions/${transaction.id}`} className="cursor-pointer w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/financial/transactions/${transaction.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/financial/transactions/${transaction.id}/receipt`} className="cursor-pointer w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              View Receipt
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transaction.id)}
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

      <div className="flex justify-between">
        <Button variant="outline" as={Link} to="/financial/reports">
          <FileText className="mr-2 h-4 w-4" />
          Financial Reports
        </Button>
        <Button variant="outline" as={Link} to="/financial/export">
          Export Transactions
        </Button>
      </div>
    </div>
  );
};

export default FinancialPage;