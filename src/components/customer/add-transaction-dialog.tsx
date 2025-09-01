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
import { PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AddTransactionDialogProps = {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void> | void;
  type: 'credit' | 'debit';
};

export default function AddTransactionDialog({ onAddTransaction, type }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    await onAddTransaction({ type, amount: numericAmount, notes });
    setLoading(false);

    setAmount('');
    setNotes('');
    setOpen(false);
  };

  const isCredit = type === 'credit';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isCredit ? "default" : "destructive"} className="w-full font-bold">
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional: payment for invoice #123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="font-bold w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
