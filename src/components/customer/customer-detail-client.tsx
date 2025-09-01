'use client';

import type { Customer, Transaction } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionList from './transaction-list';
import AddTransactionDialog from './add-transaction-dialog';
import GenerateReminderDialog from './generate-reminder-dialog';
import DownloadReportDialog from './download-report-dialog';
import { addTransaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type CustomerDetailClientProps = {
  customer: Customer & { balance: number };
};

export default function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  const [balance, setBalance] = useState(customer.balance);
  const businessName = "Your Business"; // This would come from user settings in a real app
  const router = useRouter();
  const { toast } = useToast();

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    try {
        const transactionWithDate: Omit<Transaction, 'id'> = {
            ...newTransaction,
            date: new Date().toISOString(),
        };
        await addTransaction(customer.id, transactionWithDate);

        // No need to manually update state, revalidatePath in the server action will trigger a refresh.
        // For instant feedback, you can still update client state, but it's often better to rely on the refresh.
        toast({
            title: "Transaction Added",
            description: `Successfully recorded new transaction.`,
        });
        
        router.refresh(); 

    } catch (error) {
        console.error("Failed to add transaction:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add transaction. Please try again.",
        });
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
            <h1 className="font-headline text-3xl font-bold">{customer.name}</h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-muted-foreground">
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
        <div className="sm:text-right bg-card sm:bg-transparent border sm:border-none rounded-lg p-4 sm:p-0">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={`font-headline text-3xl font-bold ${customer.balance > 0 ? 'text-green-700 dark:text-green-400' : customer.balance < 0 ? 'text-red-700 dark:text-red-400' : ''}`}>
            {formatCurrency(Math.abs(customer.balance))}
          </p>
          {customer.balance !== 0 && (
            <Badge variant="outline" className={customer.balance > 0 ? 'text-green-700 border-green-300 dark:text-green-400 dark:border-green-700' : 'text-red-700 border-red-300 dark:text-red-400 dark:border-red-700'}>
              {customer.balance > 0 ? "You'll Get" : "You'll Give"}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AddTransactionDialog onAddTransaction={handleAddTransaction} type="credit" />
        <AddTransactionDialog onAddTransaction={handleAddTransaction} type="debit" />
        <GenerateReminderDialog 
            customerName={customer.name} 
            outstandingAmount={customer.balance} 
            businessName={businessName} 
            disabled={customer.balance <= 0}
        />
        <DownloadReportDialog disabled={customer.transactions.length === 0} />
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={customer.transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
