'use client';

import type { Customer } from '@/lib/types';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AddEditCustomerDialog from '../customer/add-edit-customer-dialog';

type CustomerListProps = {
  customers: (Customer & { balance: number })[];
  onSave: (customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>, customerId?: string) => Promise<boolean>;
};

export default function CustomerList({ customers, onSave }: CustomerListProps) {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        toast({
            title: "Feature coming soon!",
            description: `${action} will be available in a future update.`,
        })
    }

  return (
    <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Status</TableHead>
            <TableHead className="w-[50px] text-right"><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="block hover:bg-muted/50 -m-4 p-4 rounded-lg">
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.mobile}</div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/customers/${customer.id}`} className="block hover:bg-muted/50 -m-4 p-4 rounded-lg" tabIndex={-1}>
                    <span className={`font-semibold font-mono ${customer.balance > 0 ? 'text-green-700 dark:text-green-400' : customer.balance < 0 ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground'}`}>
                      {formatCurrency(Math.abs(customer.balance))}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right">
                   <Link href={`/customers/${customer.id}`} className="block hover:bg-muted/50 -m-4 p-4 rounded-lg" tabIndex={-1}>
                    {customer.balance > 0 && <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-400 dark:border-green-700">You'll Get</Badge>}
                    {customer.balance < 0 && <Badge variant="outline" className="text-red-700 border-red-300 dark:text-red-400 dark:border-red-700">You'll Give</Badge>}
                    {customer.balance === 0 && <Badge variant="secondary">Settled</Badge>}
                   </Link>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open customer menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <AddEditCustomerDialog customer={customer} onSave={onSave}>
                              {/* The trigger for the dialog needs to be an element that can receive a ref. A plain button works perfectly */}
                              <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left">
                                Edit
                              </button>
                            </AddEditCustomerDialog>
                            <DropdownMenuItem className="text-red-600 focus:text-red-50 focus:bg-red-600" onClick={() => handleAction('Deleting customer')}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No customers found. Start by adding one!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
