'use client';

import type { Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';

type TransactionListProps = {
  transactions: Transaction[];
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Format date on the client to avoid hydration mismatch
    setFormattedDate(format(new Date(transaction.date), 'dd MMM yyyy, p'));
  }, [transaction.date]);

  return (
    <div className="flex items-start space-x-4">
      <div className={`mt-1 p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
        {transaction.type === 'credit' ? (
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{transaction.type === 'credit' ? 'You Gave' : 'You Got'}</p>
            <p className="text-sm text-muted-foreground">{formattedDate || ' '}</p>
          </div>
          <p className={`font-mono font-semibold ${transaction.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(transaction.amount)}
          </p>
        </div>
        {transaction.notes && <CardDescription className="mt-1 text-sm">{transaction.notes}</CardDescription>}
      </div>
    </div>
  );
}

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
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </div>
  );
}
