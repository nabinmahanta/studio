'use client';

import type { Customer, Transaction } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Home, FileText, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionList from './transaction-list';
import AddTransactionDialog from './add-transaction-dialog';
import GenerateReminderDialog from './generate-reminder-dialog';
import DownloadReportDialog from './download-report-dialog';

type CustomerDetailClientProps = {
  customer: Customer & { balance: number };
};

export default function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  const [transactions, setTransactions] = useState(customer.transactions);
  const [balance, setBalance] = useState(customer.balance);
  const businessName = "Your Business"; // This would come from user settings in a real app

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transactionWithId: Transaction = {
        ...newTransaction,
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
    };
    
    const updatedTransactions = [transactionWithId, ...transactions];
    setTransactions(updatedTransactions);

    const newBalance = updatedTransactions.reduce((acc, t) => {
        return t.type === 'credit' ? acc + t.amount : acc - t.amount;
    }, 0);
    setBalance(newBalance);
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{customer.mobile}</span>
                </div>
                {customer.address && (
                <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>{customer.address}</span>
                </div>
                )}
            </div>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={`font-headline text-3xl font-bold ${balance > 0 ? 'text-green-700' : balance < 0 ? 'text-red-700' : ''}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          {balance !== 0 && (
            <Badge variant="outline" className={balance > 0 ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'}>
              {balance > 0 ? "You'll Get" : "You'll Give"}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <AddTransactionDialog onAddTransaction={handleAddTransaction} type="credit" />
        <AddTransactionDialog onAddTransaction={handleAddTransaction} type="debit" />
        <GenerateReminderDialog 
            customerName={customer.name} 
            outstandingAmount={balance} 
            businessName={businessName} 
            disabled={balance <= 0}
        />
        <DownloadReportDialog disabled={transactions.length === 0} />
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
