'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Customer } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type AddEditCustomerDialogProps = {
  customer?: Customer;
  onSave: (data: CustomerFormValues, customerId?: string) => Promise<boolean>;
  children: React.ReactNode;
};

export default function AddEditCustomerDialog({ customer, onSave, children }: AddEditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      mobile: customer?.mobile || '',
      address: customer?.address || '',
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    const success = await onSave(data, customer?.id);
    setLoading(false);
    if (success) {
      setOpen(false);
      form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save customer details. Please try again."
        });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        name: customer?.name || '',
        mobile: customer?.mobile || '',
        address: customer?.address || '',
      });
    }
    setOpen(isOpen);
  }

  const isEditMode = !!customer;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this customer.' : 'Enter the details for the new customer.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Priya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                   <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      className="rounded-l-none"
                      {...field}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123, MG Road, Bangalore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading} className="font-bold">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
