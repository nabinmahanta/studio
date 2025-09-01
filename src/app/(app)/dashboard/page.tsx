import { getCustomers } from '@/lib/data';
import DashboardClient from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const customers = await getCustomers();
  
  const totalToCollect = customers.reduce((sum, customer) => (customer.balance > 0 ? sum + customer.balance : sum), 0);
  const totalToGive = customers.reduce((sum, customer) => (customer.balance < 0 ? sum + Math.abs(customer.balance) : sum), 0);
  const totalCustomers = customers.length;
  
  const stats = {
    totalToCollect,
    totalToGive,
    totalCustomers
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground mb-6">
        Dashboard
      </h1>
      <DashboardClient initialCustomers={customers} stats={stats} />
    </div>
  );
}
