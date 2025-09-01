'use client';

import type { Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Card, CardDescription } from '@/components/ui/card';

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-start space-x-4">
            <div className={`mt-1 p-2 rounded-full ${t.type === 'credit' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                {t.type === 'credit' ? (
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
            </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">{t.type === 'credit' ? 'You Gave' : 'You Got'}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(t.date), 'dd MMM yyyy, p')}</p>
                </div>
                <p className={`font-mono font-semibold ${t.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(t.amount)}
                </p>
            </div>
            {t.notes && <CardDescription className="mt-1 text-sm">{t.notes}</CardDescription>}
          </div>
        </div>
      ))}
    </div>
  );
}
