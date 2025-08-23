import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
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

// Define the form schema with Zod
const transactionFormSchema = z.object({
  transactionType: z.enum(['income', 'expense'], {
    required_error: 'Please select a transaction type.',
  }),
  amount: z.coerce.number().positive({
    message: 'Amount must be a positive number.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  date: z.string().min(1, {
    message: 'Date is required.',
  }),
  paymentMethod: z.string({
    required_error: 'Please select a payment method.',
  }),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringEndDate: z.string().optional(),
}).refine((data) => {
  // If it's a recurring transaction, frequency is required
  if (data.isRecurring && !data.recurringFrequency) {
    return false;
  }
  return true;
}, {
  message: 'Recurring frequency is required for recurring transactions',
  path: ['recurringFrequency'],
}).refine((data) => {
  // If it's a recurring transaction, end date is required
  if (data.isRecurring && !data.recurringEndDate) {
    return false;
  }
  return true;
}, {
  message: 'Recurring end date is required for recurring transactions',
  path: ['recurringEndDate'],
}).refine((data) => {
  // If recurring end date is provided, validate that it's after transaction date
  if (data.isRecurring && data.recurringEndDate) {
    const transactionDate = new Date(data.date);
    const endDate = new Date(data.recurringEndDate);
    return endDate > transactionDate;
  }
  return true;
}, {
  message: 'Recurring end date must be after transaction date',
  path: ['recurringEndDate'],
});

const TransactionForm = ({ 
  initialData, 
  onSubmit, 
  isEditing = false, 
  properties = [], 
  units = [], 
  tenants = [] 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialData?.propertyId || ''
  );
  const [filteredUnits, setFilteredUnits] = useState([]);

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initialData || {
      transactionType: 'income',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      paymentMethod: '',
      propertyId: '',
      unitId: '',
      tenantId: '',
      reference: '',
      notes: '',
      isRecurring: false,
      recurringFrequency: '',
      recurringEndDate: '',
    },
  });

  // Watch for property changes to filter units
  const watchPropertyId = form.watch('propertyId');
  const watchIsRecurring = form.watch('isRecurring');
  const watchTransactionType = form.watch('transactionType');

  // Update filtered units when property changes
  useState(() => {
    if (watchPropertyId) {
      setSelectedPropertyId(watchPropertyId);
      // In a real app, this would filter units based on the selected property
      // For now, we'll simulate it with dummy data
      const propertyUnits = units.filter(unit => unit.propertyId === watchPropertyId);
      setFilteredUnits(propertyUnits.length > 0 ? propertyUnits : [
        { id: `${watchPropertyId}-101`, name: 'Unit 101' },
        { id: `${watchPropertyId}-102`, name: 'Unit 102' },
        { id: `${watchPropertyId}-103`, name: 'Unit 103' },
      ]);
    } else {
      setFilteredUnits([]);
    }
  }, [watchPropertyId, units]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success(`Transaction ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} transaction. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get category options based on transaction type
  const getCategoryOptions = () => {
    if (watchTransactionType === 'income') {
      return (
        <>
          <SelectItem value="rent">Rent</SelectItem>
          <SelectItem value="deposit">Security Deposit</SelectItem>
          <SelectItem value="fee">Application/Late Fees</SelectItem>
          <SelectItem value="utility">Utility Reimbursement</SelectItem>
          <SelectItem value="parking">Parking</SelectItem>
          <SelectItem value="laundry">Laundry</SelectItem>
          <SelectItem value="other_income">Other Income</SelectItem>
        </>
      );
    } else {
      return (
        <>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="repair">Repairs</SelectItem>
          <SelectItem value="utility_expense">Utilities</SelectItem>
          <SelectItem value="tax">Taxes</SelectItem>
          <SelectItem value="insurance">Insurance</SelectItem>
          <SelectItem value="payroll">Payroll</SelectItem>
          <SelectItem value="supplies">Supplies</SelectItem>
          <SelectItem value="legal">Legal/Professional Fees</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="other_expense">Other Expense</SelectItem>
        </>
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Transaction Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset category when transaction type changes
                      form.setValue('category', '');
                    }}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="income" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Income
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="expense" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Expense
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" min="0.01" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getCategoryOptions()}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online_payment">Online Payment</SelectItem>
                    <SelectItem value="money_order">Money Order</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Property (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {properties.length > 0 ? (
                      properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback mock data if no properties are provided
                      <>
                        <SelectItem value="1">Sunset Apartments</SelectItem>
                        <SelectItem value="2">Oakwood Residences</SelectItem>
                        <SelectItem value="3">Riverside Condos</SelectItem>
                        <SelectItem value="4">Pine Street Houses</SelectItem>
                        <SelectItem value="5">Maple Court</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  If this transaction is associated with a specific property, select it here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchPropertyId && (
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Unit (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {filteredUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If this transaction is associated with a specific unit, select it here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Tenant (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback mock data if no tenants are provided
                      <>
                        <SelectItem value="1">John Smith</SelectItem>
                        <SelectItem value="2">Sarah Johnson</SelectItem>
                        <SelectItem value="3">Michael Brown</SelectItem>
                        <SelectItem value="4">Emily Davis</SelectItem>
                        <SelectItem value="5">David Wilson</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  If this transaction is associated with a specific tenant, select them here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter reference number" {...field} />
                </FormControl>
                <FormDescription>
                  Receipt, invoice, or check number if applicable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter transaction description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Recurring Transaction
                </FormLabel>
                <FormDescription>
                  Check if this is a recurring transaction.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {watchIsRecurring && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="recurringFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semiannually">Semi-annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurringEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes about the transaction"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any additional information about the transaction (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;