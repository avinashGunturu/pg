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
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

// Define maintenance entry schema
const maintenanceSchema = z.object({
  type: z.string().min(1, { message: 'Maintenance type is required' }),
  date: z.string().optional(),
  cost: z.coerce.number().min(0, { message: 'Cost must be non-negative' }).optional(),
  currency: z.string().default('INR'),
  responsiblePersonName: z.string().optional(),
  responsiblePersonPhone: z.string().optional(),
  responsiblePersonEmail: z.string().email().optional().or(z.literal('')),
  responsiblePersonRole: z.string().optional(),
  scheduledDate: z.string().optional(),
  note: z.string().optional(),
});

// Define supplier schema
const supplierSchema = z.object({
  supplierName: z.string().min(1, { message: 'Supplier name is required' }),
  contactNumber: z.string().min(10, { message: 'Contact number is required' }),
  email: z.string().email().optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

// Define the main inventory form schema
const inventoryFormSchema = z.object({
  propertyId: z.string().min(1, { message: 'Property selection is required' }),
  itemName: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
  category: z.string().optional(),
  quantity: z.coerce.number().int().min(0, { message: 'Quantity must be non-negative' }),
  pricePerUnit: z.coerce.number().min(0, { message: 'Price per unit must be non-negative' }),
  currency: z.string().default('INR'),
  recurring: z.boolean().default(false),
  maintenanceFrequency: z.string().optional(),
  supplier: supplierSchema.optional(),
  maintenance: z.array(maintenanceSchema).optional(),
  status: z.enum(['Active', 'Inactive', 'Disposed']).default('Active'),
  notes: z.string().optional(),
});

const InventoryForm = ({ initialData, onSubmit, isEditing = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [maintenanceEntries, setMaintenanceEntries] = useState([]);
  const { ownerId } = useAuth();

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: initialData || {
      propertyId: '',
      itemName: '',
      category: '',
      quantity: 0,
      pricePerUnit: 0,
      currency: 'INR',
      recurring: false,
      maintenanceFrequency: '',
      supplier: {
        supplierName: '',
        contactNumber: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      maintenance: [],
      status: 'Active',
      notes: '',
    },
  });

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await apiClient.post('/api/property/list', {
          ownerId: ownerId || '',
          propertyId: '',
          location: '',
          propertyName: '',
          propertyCategory: ''
        });
        
        const propertiesList = response?.data?.data?.properties || response?.data?.properties || [];
        setProperties(propertiesList);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoadingProperties(false);
      }
    };

    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  // Load initial maintenance entries if editing
  useEffect(() => {
    if (isEditing && initialData?.maintenance) {
      setMaintenanceEntries(initialData.maintenance);
    }
  }, [isEditing, initialData]);

  // Add new maintenance entry
  const addMaintenanceEntry = () => {
    const newEntry = {
      type: '',
      date: '',
      cost: 0,
      currency: 'INR',
      responsiblePersonName: '',
      responsiblePersonPhone: '',
      responsiblePersonEmail: '',
      responsiblePersonRole: '',
      scheduledDate: '',
      note: '',
    };
    setMaintenanceEntries([...maintenanceEntries, newEntry]);
  };

  // Remove maintenance entry
  const removeMaintenanceEntry = (index) => {
    const updated = maintenanceEntries.filter((_, i) => i !== index);
    setMaintenanceEntries(updated);
  };

  // Update maintenance entry
  const updateMaintenanceEntry = (index, field, value) => {
    const updated = [...maintenanceEntries];
    updated[index] = { ...updated[index], [field]: value };
    setMaintenanceEntries(updated);
  };

  // Calculate total value
  const calculateTotalValue = () => {
    const quantity = form.watch('quantity') || 0;
    const pricePerUnit = form.watch('pricePerUnit') || 0;
    return quantity * pricePerUnit;
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the data according to the MongoDB schema
      const inventoryData = {
        ...values,
        ownerId: ownerId,
        totalValue: calculateTotalValue(),
        maintenance: maintenanceEntries.filter(entry => entry.type), // Only include entries with type
      };
      
      await onSubmit(inventoryData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Let the parent component handle the error display
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingProperties}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingProperties ? "Loading properties..." : "Select property"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property._id} value={property._id}>
                          {property.propertyName}
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
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
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
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Appliances">Appliances</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quantity and Pricing */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Quantity & Pricing</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Unit *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium">
              Total Value: {form.watch('currency') || 'INR'} {calculateTotalValue().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Maintenance and Recurring */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Maintenance & Recurring</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="recurring"
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
                      Recurring Item
                    </FormLabel>
                    <FormDescription>
                      Check if this item requires regular maintenance
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenanceFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Half-yearly">Half-yearly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Supplier Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Supplier Information</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="supplier.supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.email"
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
              name="supplier.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Maintenance History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Maintenance History</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addMaintenanceEntry}
            >
              Add Maintenance Entry
            </Button>
          </div>
          
          {maintenanceEntries.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Maintenance Entry {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMaintenanceEntry(index)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input
                    placeholder="Maintenance type"
                    value={entry.type}
                    onChange={(e) => updateMaintenanceEntry(index, 'type', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateMaintenanceEntry(index, 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Cost</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cost"
                    value={entry.cost}
                    onChange={(e) => updateMaintenanceEntry(index, 'cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Responsible Person</label>
                  <Input
                    placeholder="Name"
                    value={entry.responsiblePersonName}
                    onChange={(e) => updateMaintenanceEntry(index, 'responsiblePersonName', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={entry.responsiblePersonPhone}
                    onChange={(e) => updateMaintenanceEntry(index, 'responsiblePersonPhone', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Scheduled Date</label>
                  <Input
                    type="date"
                    value={entry.scheduledDate}
                    onChange={(e) => updateMaintenanceEntry(index, 'scheduledDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Maintenance notes"
                  value={entry.note}
                  onChange={(e) => updateMaintenanceEntry(index, 'note', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Additional Information</h3>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes or comments"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditing ? 'Update Item' : 'Create Item'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryForm;