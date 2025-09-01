'use client';

import type { Customer } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import StatsCards from '@/components/dashboard/stats-cards';
import CustomerList from '@/components/dashboard/customer-list';
import AddEditCustomerDialog from '@/components/customer/add-edit-customer-dialog';
import { addCustomer, updateCustomer, getCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Stats = {
  totalToCollect: number;
  totalToGive: number;
  totalCustomers: number;
};

export default function DashboardClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<(Customer & { balance: number })[]>([]);
  const [stats, setStats] = useState<Stats>({ totalToCollect: 0, totalToGive: 0, totalCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userCustomers = await getCustomers(user.uid);
          setCustomers(userCustomers);
          
          const totalToCollect = userCustomers.reduce((sum, customer) => (customer.balance > 0 ? sum + customer.balance : sum), 0);
          const totalToGive = userCustomers.reduce((sum, customer) => (customer.balance < 0 ? sum + Math.abs(customer.balance) : sum), 0);
          const totalCustomers = userCustomers.length;

          setStats({ totalToCollect, totalToGive, totalCustomers });

        } catch (error) {
          console.error("Failed to fetch customers", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dashboard data.' });
        } finally {
            setLoading(false);
        }
      } else {
        // No user is signed in.
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);


  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
    );
  }, [searchTerm, customers]);

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>, customerId?: string): Promise<boolean> => {
    if (!userId) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save a customer." });
      return false;
    }
    
    try {
      if (customerId) {
        // Edit existing customer
        await updateCustomer(userId, customerId, customerData);
        toast({ title: "Customer Updated", description: `${customerData.name}'s details have been updated.` });
      } else {
        // Add new customer
        const newCustomer = await addCustomer(userId, customerData);
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
        router.push(`/customers/${newCustomer.id}`);
      }
      
      // Refresh data
      const userCustomers = await getCustomers(userId);
      setCustomers(userCustomers);
      return true;
    } catch (error) {
      console.error("Failed to save customer:", error);
      // The dialog will show a generic error toast
      return false;
    }
  };
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
            <Button className="w-full sm:w-auto font-bold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Customer
            </Button>
          </AddEditCustomerDialog>
        </div>
        
        <CustomerList customers={filteredCustomers} onSave={handleSaveCustomer} />
      </div>
    </div>
  );
}
