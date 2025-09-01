export interface Transaction {
  id: string;
  type: 'credit' | 'debit'; // credit = You Gave, debit = You Got
  amount: number;
  date: string; // ISO string
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  transactions: Transaction[];
}
