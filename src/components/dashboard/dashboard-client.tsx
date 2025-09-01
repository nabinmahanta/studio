'use client';

import type { Customer } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import StatsCards from '@/components/dashboard/stats-cards';
import CustomerList from '@/components/dashboard/customer-list';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type DashboardClientProps = {
  initialCustomers: (Customer & { balance: number })[];
  stats: {
    totalToCollect: number;
    totalToGive: number;
    totalCustomers: number;
  };
};

export default function DashboardClient({ initialCustomers, stats }: DashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return initialCustomers;
    return initialCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
    );
  }, [searchTerm, initialCustomers]);
  
  const handleAddCustomer = () => {
    toast({
        title: "Feature coming soon!",
        description: "Adding new customers will be available in a future update.",
    })
  }

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
          <Button onClick={handleAddCustomer} className="w-full sm:w-auto font-bold">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Customer
          </Button>
        </div>
        
        <CustomerList customers={filteredCustomers} />
      </div>
    </div>
  );
}
