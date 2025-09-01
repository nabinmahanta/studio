'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import type { Transaction } from '@/lib/types';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AddTransactionDialogProps = {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  type: 'credit' | 'debit';
};

export default function AddTransactionDialog({ onAddTransaction, type }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the amount.",
      });
      return;
    }

    onAddTransaction({ type, amount: numericAmount, notes });
    toast({
        title: "Transaction Added",
        description: `Successfully recorded ${type === 'credit' ? 'credit' : 'debit'} of ${numericAmount}.`,
    });

    setAmount('');
    setNotes('');
    setOpen(false);
  };

  const isCredit = type === 'credit';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isCredit ? "default" : "outline"} className={`w-full font-bold ${isCredit ? '' : 'text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700'}`}>
            {isCredit ? <PlusCircle className="mr-2 h-5 w-5" /> : <MinusCircle className="mr-2 h-5 w-5" />}
            {isCredit ? 'You Gave' : 'You Got'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isCredit ? 'Add Credit (You Gave)' : 'Add Debit (You Got)'}</DialogTitle>
          <DialogDescription>
            Enter the details for this transaction. This will update the customer's balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="₹0.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Optional: payment for invoice #123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="font-bold">Save Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
