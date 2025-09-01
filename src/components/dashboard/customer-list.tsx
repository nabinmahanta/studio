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
            <TableHead className="w-[50px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="hover:underline">
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.mobile}</div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold font-mono ${customer.balance > 0 ? 'text-green-700' : customer.balance < 0 ? 'text-red-700' : 'text-muted-foreground'}`}>
                    {formatCurrency(Math.abs(customer.balance))}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right">
                  {customer.balance > 0 && <Badge variant="outline" className="text-green-700 border-green-300">You'll Get</Badge>}
                  {customer.balance < 0 && <Badge variant="outline" className="text-red-700 border-red-300">You'll Give</Badge>}
                  {customer.balance === 0 && <Badge variant="secondary">Settled</Badge>}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <AddEditCustomerDialog customer={customer} onSave={onSave}>
                              <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                Edit
                              </button>
                            </AddEditCustomerDialog>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleAction('Deleting customer')}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No customers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
