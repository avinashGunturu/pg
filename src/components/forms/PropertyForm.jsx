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
import { toast } from 'sonner';

// Define the form schema with Zod
const propertyFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Property name must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().min(2, {
    message: 'City is required.',
  }),
  state: z.string().min(2, {
    message: 'State is required.',
  }),
  zipCode: z.string().min(5, {
    message: 'Zip code must be at least 5 characters.',
  }),
  type: z.string({
    required_error: 'Please select a property type.',
  }),
  units: z.coerce.number().int().positive({
    message: 'Number of units must be a positive integer.',
  }),
  description: z.string().optional(),
});

const PropertyForm = ({ initialData, onSubmit, isEditing = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData || {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      type: '',
      units: 1,
      description: '',
    },
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success(`Property ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} property. Please try again.`);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your property as it will appear to tenants and staff.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Apartment Complex">Apartment Complex</SelectItem>
                    <SelectItem value="Townhouses">Townhouses</SelectItem>
                    <SelectItem value="Condominiums">Condominiums</SelectItem>
                    <SelectItem value="Single Family">Single Family</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of property you are managing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
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
            name="city"
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
            name="state"
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
            name="zipCode"
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
            name="units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Units</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Total number of rental units in this property.
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
                <Textarea
                  placeholder="Enter property description"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details about the property (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;