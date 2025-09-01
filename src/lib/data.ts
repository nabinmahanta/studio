import type { Customer, Transaction } from '@/lib/types';

// Simulate a persistent in-memory store
let MOCK_CUSTOMERS: Omit<Customer, 'transactions' | 'balance'>[] = [
  { id: '1', name: 'Rajesh Kumar', mobile: '9876543210', address: '123, MG Road, Bangalore' },
  { id: '2', name: 'Priya Sharma', mobile: '8765432109', address: '456, Park Street, Kolkata' },
  { id: '3', name: 'Amit Singh', mobile: '7654321098' },
  { id: '4', name: 'Sunita Devi', mobile: '6543210987', address: '789, Marine Drive, Mumbai' },
  { id: '5', name: 'Vikram Patel', mobile: '5432109876', address: '101, Connaught Place, Delhi' },
];

let MOCK_TRANSACTIONS: Record<string, Transaction[]> = {
  '1': [
    { id: 't1', type: 'credit', amount: 5000, date: '2023-10-15T10:00:00Z', notes: 'Advance payment' },
    { id: 't2', type: 'debit', amount: 2500, date: '2023-10-20T14:30:00Z', notes: 'Goods purchase' },
    { id: 't3', type: 'credit', amount: 1000, date: '2023-11-01T11:00:00Z', notes: 'Raw materials' },
  ],
  '2': [
    { id: 't4', type: 'debit', amount: 15000, date: '2023-10-12T09:00:00Z', notes: 'Service fee' },
    { id: 't5', type: 'credit', amount: 7000, date: '2023-10-25T16:00:00Z', notes: 'Invoice #123' },
  ],
  '3': [
    { id: 't6', type: 'credit', amount: 800, date: '2023-11-05T12:00:00Z', notes: 'Supplies' },
  ],
  '4': [
    { id: 't7', type: 'debit', amount: 3000, date: '2023-11-10T18:00:00Z', notes: 'Consulting' },
    { id: 't8', type: 'debit', amount: 2000, date: '2023-11-12T10:00:00Z', notes: 'Follow-up' },
  ],
  '5': [],
};


const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, t) => {
    if (t.type === 'credit') { // You Gave
      return acc + t.amount;
    }
    return acc - t.amount; // You Got
  }, 0);
};

export const getCustomers = async (): Promise<(Customer & { balance: number })[]> => {
  // Return a copy to avoid mutation issues in components
  const customers = [...MOCK_CUSTOMERS];
  return customers.map(c => {
    const transactions = MOCK_TRANSACTIONS[c.id] || [];
    const balance = calculateBalance(transactions);
    return { ...c, transactions, balance };
  }).sort((a, b) => parseInt(b.id) - parseInt(a.id));
};

export const getCustomerById = async (id: string): Promise<(Customer & { balance: number }) | undefined> => {
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  if (!customer) return undefined;
  
  const transactions = MOCK_TRANSACTIONS[id] || [];
  const balance = calculateBalance(transactions);
  return { ...customer, transactions, balance };
};

export const addCustomer = async (customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>): Promise<Omit<Customer, 'transactions' | 'balance'>> => {
  const newId = String(Date.now()); // Using timestamp for a more unique ID
  const newCustomer = {
    id: newId,
    ...customerData,
  };
  // Add to the "database"
  MOCK_CUSTOMERS.unshift(newCustomer);
  MOCK_TRANSACTIONS[newId] = [];
  
  return newCustomer;
};

export const updateCustomer = async (customerId: string, customerData: Partial<Omit<Customer, 'id' | 'transactions' | 'balance'>>): Promise<Omit<Customer, 'transactions' | 'balance'>> => {
  let customerToUpdate = MOCK_CUSTOMERS.find(c => c.id === customerId);
  if (!customerToUpdate) {
    throw new Error("Customer not found");
  }
  const updatedCustomer = { ...customerToUpdate, ...customerData };
  const index = MOCK_CUSTOMERS.findIndex(c => c.id === customerId);
  MOCK_CUSTOMERS[index] = updatedCustomer;
  return updatedCustomer;
};
