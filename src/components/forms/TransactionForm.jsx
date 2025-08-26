import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useProperties } from '@/hooks/useProperties';
import { useTenants } from '@/hooks/useTenants';
import { useAuth } from '@/context/AuthContext';

// Define the comprehensive form schema based on the provided MongoDB schema
const transactionFormSchema = z.object({
  // Required fields
  ownerId: z.string().min(1, { message: 'Owner ID is required.' }),
  propertyId: z.string().min(1, { message: 'Property is required.' }),
  transactionType: z.enum(['INCOME', 'EXPENSE', 'RENT'], {
    required_error: 'Please select a transaction type.',
  }),
  amount: z.coerce.number().positive({
    message: 'Amount must be a positive number.',
  }),
  currency: z.enum(['INR', 'USD', 'EUR'], {
    required_error: 'Please select a currency.',
  }),
  transactionDate: z.string().min(1, {
    message: 'Transaction date is required.',
  }),
  actualPaymentDate: z.string().min(1, {
    message: 'Actual payment date is required.',
  }),
  status: z.enum(['PAID', 'PENDING', 'FAILED', 'DUE']).default('PENDING'),
  
  // Optional fields
  tenantId: z.string().optional(),
  transactionSubType: z.string().optional(),
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  externalPaymentId: z.string().optional(),
  
  // Income details (conditional)
  incomeSource: z.string().optional(),
  incomeReceivedFrom: z.string().optional(),
  incomePaymentReference: z.string().optional(),
  incomeNotes: z.string().optional(),
  
  // Expense details (conditional)
  expenseCategory: z.string().optional(),
  expenseVendor: z.string().optional(),
  expenseInvoiceNumber: z.string().optional(),
  expensePaymentReference: z.string().optional(),
  expenseNotes: z.string().optional(),
  
  // Rent details (conditional)
  rentStartDate: z.string().optional(),
  rentEndDate: z.string().optional(),
}).refine((data) => {
  // If transaction type is INCOME or RENT and amount > 0, tenant might be required based on business logic
  // For EXPENSE, tenant is not required
  if (data.transactionType === 'EXPENSE') {
    return true; // No tenant required for expenses
  }
  return true; // Allow tenant to be optional for income as well
}, {
  message: 'Tenant selection validation failed',
  path: ['tenantId'],
}).refine((data) => {
  // If transaction type is RENT, rent dates should be provided
  if (data.transactionType === 'RENT') {
    return data.rentStartDate && data.rentEndDate;
  }
  return true;
}, {
  message: 'Rent start and end dates are required for rent transactions',
  path: ['rentStartDate'],
}).refine((data) => {
  // Validate rent end date is after start date
  if (data.transactionType === 'RENT' && data.rentStartDate && data.rentEndDate) {
    return new Date(data.rentEndDate) > new Date(data.rentStartDate);
  }
  return true;
}, {
  message: 'Rent end date must be after start date',
  path: ['rentEndDate'],
});

const TransactionForm = ({ 
  initialData, 
  onSubmit, 
  isEditing = false
}) => {
  const { ownerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialData?.propertyId || ''
  );
  
  // Fetch properties and tenants using the proper hooks
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants(selectedPropertyId);
  
  // Filter tenants by selected property
  const filteredTenants = useMemo(() => {
    if (!selectedPropertyId || selectedPropertyId === '' || !tenants.length) {
      return [];
    }
    
    return tenants.filter(tenant => 
      tenant.propertyId === selectedPropertyId || 
      (tenant.rawData?.propertyId === selectedPropertyId) ||
      (typeof tenant.rawData?.propertyId === 'object' && tenant.rawData?.propertyId?._id === selectedPropertyId)
    );
  }, [selectedPropertyId, tenants]);

  // Memoize default values to prevent form re-creation
  const defaultFormValues = useMemo(() => ({
    ownerId: ownerId || '507f1f77bcf86cd799439011',
    propertyId: '',
    tenantId: 'none',
    transactionType: 'INCOME',
    transactionSubType: 'none',
    amount: 0,
    currency: 'INR',
    transactionDate: new Date().toISOString().split('T')[0],
    actualPaymentDate: new Date().toISOString().split('T')[0],
    paidDate: '',
    paymentMethod: 'none',
    status: 'PENDING',
    description: '',
    externalPaymentId: '',
    // Income details
    incomeSource: '',
    incomeReceivedFrom: '',
    incomePaymentReference: '',
    incomeNotes: '',
    // Expense details
    expenseCategory: '',
    expenseVendor: '',
    expenseInvoiceNumber: '',
    expensePaymentReference: '',
    expenseNotes: '',
    // Rent details
    rentStartDate: '',
    rentEndDate: '',
  }), [ownerId]);

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm({
    resolver: zodResolver(transactionFormSchema),
    mode: 'onChange',
    defaultValues: initialData || defaultFormValues,
  });

  // Watch for changes
  const watchPropertyId = form.watch('propertyId');
  const watchTransactionType = form.watch('transactionType');
  const watchStatus = form.watch('status');

  // Update selected property when form property changes
  useEffect(() => {
    if (watchPropertyId !== selectedPropertyId) {
      setSelectedPropertyId(watchPropertyId);
      // Reset tenant selection when property changes
      if (watchTransactionType !== 'EXPENSE') {
        form.setValue('tenantId', 'none');
      }
    }
  }, [watchPropertyId, selectedPropertyId, watchTransactionType, form]);

  // Reset tenant when transaction type changes to EXPENSE
  useEffect(() => {
    if (watchTransactionType === 'EXPENSE') {
      const currentTenantId = form.getValues('tenantId');
      if (currentTenantId && currentTenantId !== 'none') {
        form.setValue('tenantId', 'none');
      }
    }
  }, [watchTransactionType, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Transform form data to match API schema
      const transactionData = {
        ownerId: values.ownerId,
        propertyId: values.propertyId,
        transactionType: values.transactionType,
        transactionSubType: values.transactionSubType,
        amount: values.amount,
        currency: values.currency,
        transactionDate: values.transactionDate,
        actualPaymentDate: values.actualPaymentDate,
        paidDate: values.paidDate,
        paymentMethod: values.paymentMethod,
        status: values.status,
        description: values.description,
        externalPaymentId: values.externalPaymentId,
      };
      
      // Add tenant ID only if not an expense and if selected (and not 'none')
      if (values.transactionType !== 'EXPENSE' && values.tenantId && values.tenantId !== 'none') {
        transactionData.tenantId = values.tenantId;
      }
      
      // Add conditional details based on transaction type
      if (values.transactionType === 'INCOME') {
        transactionData.incomeDetails = {
          source: values.incomeSource,
          receivedFrom: values.incomeReceivedFrom,
          paymentReference: values.incomePaymentReference,
          notes: values.incomeNotes,
        };
      } else if (values.transactionType === 'EXPENSE') {
        transactionData.expenseDetails = {
          category: values.expenseCategory,
          vendor: values.expenseVendor,
          invoiceNumber: values.expenseInvoiceNumber,
          paymentReference: values.expensePaymentReference,
          notes: values.expenseNotes,
        };
      } else if (values.transactionType === 'RENT') {
        transactionData.rentDetails = {
          rentStartDate: values.rentStartDate,
          rentEndDate: values.rentEndDate,
        };
        // Add income details for rent as well
        transactionData.incomeDetails = {
          source: values.incomeSource || 'Rent Payment',
          receivedFrom: values.incomeReceivedFrom,
          paymentReference: values.incomePaymentReference,
          notes: values.incomeNotes,
        };
      }
      
      await onSubmit(transactionData);
      toast.success(`Transaction ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} transaction. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get subcategory options based on transaction type
  const getSubCategoryOptions = () => {
    if (watchTransactionType === 'INCOME') {
      return (
        <>
          <SelectItem value="application_fee">Application Fee</SelectItem>
          <SelectItem value="late_fee">Late Fee</SelectItem>
          <SelectItem value="utility_reimbursement">Utility Reimbursement</SelectItem>
          <SelectItem value="parking_fee">Parking Fee</SelectItem>
          <SelectItem value="laundry_income">Laundry Income</SelectItem>
          <SelectItem value="other_income">Other Income</SelectItem>
        </>
      );
    } else if (watchTransactionType === 'EXPENSE') {
      return (
        <>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="repairs">Repairs</SelectItem>
          <SelectItem value="utilities">Utilities</SelectItem>
          <SelectItem value="taxes">Taxes</SelectItem>
          <SelectItem value="insurance">Insurance</SelectItem>
          <SelectItem value="supplies">Supplies</SelectItem>
          <SelectItem value="legal_fees">Legal/Professional Fees</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="other_expense">Other Expense</SelectItem>
        </>
      );
    } else if (watchTransactionType === 'RENT') {
      return (
        <>
          <SelectItem value="monthly_rent">Monthly Rent</SelectItem>
          <SelectItem value="security_deposit">Security Deposit</SelectItem>
          <SelectItem value="advance_rent">Advance Rent</SelectItem>
        </>
      );
    }
    return null;
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Transaction Type */}
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Transaction Type *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset related fields when type changes
                      form.setValue('transactionSubType', 'none');
                      if (value === 'EXPENSE') {
                        form.setValue('tenantId', 'none');
                      }
                    }}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="INCOME" />
                      </FormControl>
                      <FormLabel className="font-normal">Income</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="EXPENSE" />
                      </FormControl>
                      <FormLabel className="font-normal">Expense</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="RENT" />
                      </FormControl>
                      <FormLabel className="font-normal">Rent</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property */}
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertiesLoading ? (
                      <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                    ) : properties.length > 0 ? (
                      properties.map((property) => (
                        <SelectItem key={property._id || property.id} value={property._id || property.id}>
                          {property.propertyName || property.name || property.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-properties" disabled>No properties available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tenant - Only for INCOME and RENT */}
          {watchTransactionType !== 'EXPENSE' && (
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant {watchTransactionType === 'RENT' ? '*' : '(Optional)'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tenantsLoading ? (
                        <SelectItem value="loading" disabled>Loading tenants...</SelectItem>
                      ) : filteredTenants.length > 0 ? (
                        filteredTenants.map((tenant) => (
                          <SelectItem key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                            {tenant.firstName} {tenant.lastName} {tenant.name && `(${tenant.name})`}
                          </SelectItem>
                        ))
                      ) : watchPropertyId ? (
                        <SelectItem value="no-tenants" disabled>No tenants found for this property</SelectItem>
                      ) : (
                        <SelectItem value="select-property" disabled>Select a property first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {watchTransactionType === 'RENT' ? 'Select the tenant paying rent' : 'Optional: Select if this transaction is related to a specific tenant'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Transaction Sub Type */}
          <FormField
            control={form.control}
            name="transactionSubType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {getSubCategoryOptions()}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transaction Date */}
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actual Payment Date */}
          <FormField
            control={form.control}
            name="actualPaymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Payment Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>When the payment was actually made/received</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="DUE">Due</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Paid Date - Only show if status is PAID */}
          {watchStatus === 'PAID' && (
            <FormField
              control={form.control}
              name="paidDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>When the payment was completed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="online_payment">Online Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* External Payment ID */}
          <FormField
            control={form.control}
            name="externalPaymentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Payment ID</FormLabel>
                <FormControl>
                  <Input placeholder="Payment gateway transaction ID" {...field} />
                </FormControl>
                <FormDescription>Transaction ID from payment gateway or bank</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter transaction description"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Detail Sections */}
        {/* Income Details */}
        {(watchTransactionType === 'INCOME' || watchTransactionType === 'RENT') && (
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="text-lg font-medium">Income Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="incomeSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Source</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Rent, Deposit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="incomeReceivedFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received From</FormLabel>
                    <FormControl>
                      <Input placeholder="Who paid this amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="incomePaymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Receipt/Transaction number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="incomeNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" className="min-h-[60px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Expense Details */}
        {watchTransactionType === 'EXPENSE' && (
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="text-lg font-medium">Expense Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="expenseCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Repairs, Utilities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expenseVendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor/Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Who was paid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expenseInvoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Invoice/Bill number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expensePaymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment reference number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expenseNotes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Expense Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional expense details" className="min-h-[60px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Rent Details */}
        {watchTransactionType === 'RENT' && (
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="text-lg font-medium">Rent Period Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rentStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Start date of the rent period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rentEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>End date of the rent period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;