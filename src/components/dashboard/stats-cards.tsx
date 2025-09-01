'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type StatsCardsProps = {
  stats: {
    totalToCollect: number;
    totalToGive: number;
    totalCustomers: number;
  };
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const { totalToCollect, totalToGive, totalCustomers } = stats;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total to Collect</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-green-700">{formatCurrency(totalToCollect)}</div>
          <p className="text-xs text-muted-foreground">From customers you gave credit to</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total to Give</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-red-700">{formatCurrency(totalToGive)}</div>
          <p className="text-xs text-muted-foreground">To customers you got debit from</p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">All customers managed</p>
        </CardContent>
      </Card>
    </div>
  );
}
