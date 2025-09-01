'use client';

import type { Customer } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import StatsCards from '@/components/dashboard/stats-cards';
import CustomerList from '@/components/dashboard/customer-list';
import AddEditCustomerDialog from '@/components/customer/add-edit-customer-dialog';
import { addCustomer, updateCustomer } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type DashboardClientProps = {
  initialCustomers: (Customer & { balance: number })[];
  stats: {
    totalToCollect: number;
    totalToGive: number;
    totalCustomers: number;
  };
};

export default function DashboardClient({ initialCustomers, stats: initialStats }: DashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState(initialCustomers);
  const [stats, setStats] = useState(initialStats);
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
    );
  }, [searchTerm, customers]);

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>, customerId?: string) => {
    try {
      if (customerId) {
        // Edit existing customer
        const updatedCustomer = await updateCustomer(customerId, customerData);
        setCustomers(prevCustomers => 
          prevCustomers.map(c => c.id === customerId ? { ...c, ...updatedCustomer } : c)
        );
        toast({ title: "Customer Updated", description: `${customerData.name}'s details have been updated.` });
      } else {
        // Add new customer
        const newCustomer = await addCustomer(customerData);
        const newCustomerWithBalance = { ...newCustomer, balance: 0 };
        setCustomers(prevCustomers => [newCustomerWithBalance, ...prevCustomers]);
        setStats(prevStats => ({...prevStats, totalCustomers: prevStats.totalCustomers + 1 }));
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added to your list.` });
      }
      return true;
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save customer details." });
      return false;
    }
  };

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <AddEditCustomerDialog onSave={handleSaveCustomer}>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto font-bold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Customer
            </button>
          </AddEditCustomerDialog>
        </div>
        
        <CustomerList customers={filteredCustomers} onSave={handleSaveCustomer} />
      </div>
    </div>
  );
}
