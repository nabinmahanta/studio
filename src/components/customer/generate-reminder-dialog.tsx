'use client';

import { useState } from 'react';
import { generatePaymentReminder } from '@/ai/flows/generate-payment-reminder';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Loader2, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card } from '../ui/card';

type GenerateReminderDialogProps = {
  customerName: string;
  outstandingAmount: number;
  businessName: string;
  disabled: boolean;
};

export default function GenerateReminderDialog({
  customerName,
  outstandingAmount,
  businessName,
  disabled
}: GenerateReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setReminderText('');
    try {
      const result = await generatePaymentReminder({
        customerName,
        outstandingAmount,
        businessName,
      });
      setReminderText(result.reminderText);
    } catch (error) {
      console.error('Failed to generate reminder:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the payment reminder. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reminderText);
    toast({
        title: "Copied to Clipboard!",
        description: "The reminder message has been copied.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={disabled}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Send Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Generate Payment Reminder</DialogTitle>
          <DialogDescription>
            AI-powered reminder for {customerName} for an outstanding amount of {formatCurrency(outstandingAmount)}.
          </DialogDescription>
        </DialogHeader>
        
        {reminderText ? (
            <div className="space-y-4">
                <Textarea value={reminderText} readOnly rows={5} />
                <div className="flex gap-2">
                    <Button onClick={handleCopyToClipboard} className="w-full">
                        <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="secondary" onClick={handleGenerate} className="w-full">
                        Regenerate
                    </Button>
                </div>
            </div>
        ) : (
            <Card className="flex items-center justify-center p-8 border-dashed">
                <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Generating...' : 'Generate with AI'}
                </Button>
          </Card>
        )}

        <DialogFooter className="sm:justify-start">
            <p className="text-xs text-muted-foreground">You can copy the message and send it via WhatsApp or SMS.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
