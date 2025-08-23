import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// Define the form schema with Zod
const tenantFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 characters.',
  }),
  propertyId: z.string({
    required_error: 'Please select a property.',
  }),
  unitId: z.string({
    required_error: 'Please select a unit.',
  }),
  leaseStart: z.string().min(1, {
    message: 'Lease start date is required.',
  }),
  leaseEnd: z.string().min(1, {
    message: 'Lease end date is required.',
  }),
  rentAmount: z.coerce.number().positive({
    message: 'Rent amount must be a positive number.',
  }),
  depositAmount: z.coerce.number().nonnegative({
    message: 'Deposit amount must be a non-negative number.',
  }),
  emergencyContactName: z.string().min(2, {
    message: 'Emergency contact name is required.',
  }),
  emergencyContactPhone: z.string().min(10, {
    message: 'Emergency contact phone is required.',
  }),
  notes: z.string().optional(),
  isPetAllowed: z.boolean().default(false),
  petDetails: z.string().optional(),
}).refine((data) => {
  // Validate that lease end date is after lease start date
  const start = new Date(data.leaseStart);
  const end = new Date(data.leaseEnd);
  return end > start;
}, {
  message: 'Lease end date must be after lease start date',
  path: ['leaseEnd'],
});

const TenantForm = ({ initialData, onSubmit, isEditing = false, properties = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyId: '',
      unitId: '',
      leaseStart: '',
      leaseEnd: '',
      rentAmount: 0,
      depositAmount: 0,
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
      isPetAllowed: false,
      petDetails: '',
    },
  });

  // Watch for property changes to update available units
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'propertyId') {
        setSelectedPropertyId(value.propertyId);
        // Reset unit selection when property changes
        form.setValue('unitId', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Simulate fetching units for the selected property
  useEffect(() => {
    if (selectedPropertyId) {
      // In a real app, this would be an API call to get units for the selected property
      // For now, we'll simulate it with dummy data
      const fetchUnits = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock units data based on selected property
        const mockUnits = [
          { id: `${selectedPropertyId}-101`, name: 'Unit 101' },
          { id: `${selectedPropertyId}-102`, name: 'Unit 102' },
          { id: `${selectedPropertyId}-103`, name: 'Unit 103' },
          { id: `${selectedPropertyId}-104`, name: 'Unit 104' },
        ];
        
        setUnits(mockUnits);
      };
      
      fetchUnits();
    } else {
      setUnits([]);
    }
  }, [selectedPropertyId]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success(`Tenant ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} tenant. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedPropertyId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedPropertyId ? "Select unit" : "Select a property first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaseStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaseEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Deposit</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter emergency contact name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter emergency contact phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPetAllowed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Pets Allowed
                  </FormLabel>
                  <FormDescription>
                    Check if pets are allowed in this unit.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {form.watch('isPetAllowed') && (
          <FormField
            control={form.control}
            name="petDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter pet details (type, breed, size, etc.)"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes about the tenant"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any additional information about the tenant (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Tenant' : 'Create Tenant'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TenantForm;