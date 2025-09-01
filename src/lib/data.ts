'use server';

import { db } from '@/lib/firebase';
import type { Customer, Transaction } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
  collectionGroup
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, t) => {
    if (t.type === 'credit') { // You Gave
      return acc + t.amount;
    }
    return acc - t.amount; // You Got
  }, 0);
};

export const getCustomers = async (): Promise<(Customer & { balance: number })[]> => {
  // 1. Fetch all customers in one query
  const customersCol = collection(db, 'customers');
  const customersQuery = query(customersCol, orderBy('name'));
  const customerSnapshot = await getDocs(customersQuery);
  const customers = customerSnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Customer, 'id' | 'transactions'>),
    transactions: [] // Initialize transactions array
  }));
  const customerMap = new Map(customers.map(c => [c.id, c]));

  // 2. Fetch all transactions for all customers in a single collectionGroup query
  const transactionsQuery = collectionGroup(db, 'transactions');
  const transactionsSnapshot = await getDocs(transactionsQuery);

  // 3. Group transactions by customer
  transactionsSnapshot.forEach(doc => {
    const transaction = {
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate().toISOString(),
    } as Transaction;
    
    const customerId = doc.ref.parent.parent?.id;
    if (customerId && customerMap.has(customerId)) {
      customerMap.get(customerId)!.transactions.push(transaction);
    }
  });

  // 4. Calculate balance for each customer and sort transactions
  const result = Array.from(customerMap.values()).map(customer => {
    // Sort transactions by date descending
    customer.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const balance = calculateBalance(customer.transactions);
    return { ...customer, balance };
  });

  return result;
};


export const getCustomerById = async (id: string): Promise<(Customer & { balance: number }) | undefined> => {
  const customerDocRef = doc(db, 'customers', id);
  const customerDoc = await getDoc(customerDocRef);

  if (!customerDoc.exists()) {
    return undefined;
  }

  const customerData = customerDoc.data() as Omit<Customer, 'id'>;
  
  const transactionsCol = collection(db, 'customers', id, 'transactions');
  const transactionsQuery = query(transactionsCol, orderBy('date', 'desc'));
  const transactionsSnapshot = await getDocs(transactionsQuery);

  const transactions = transactionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate().toISOString(),
    } as Transaction;
  });

  const balance = calculateBalance(transactions);

  return { 
    id: customerDoc.id, 
    ...customerData, 
    transactions, 
    balance 
  };
};

export const addCustomer = async (customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>): Promise<Customer> => {
  const customersCol = collection(db, 'customers');
  const newCustomerRef = await addDoc(customersCol, customerData);

  revalidatePath('/dashboard');
  
  return {
    id: newCustomerRef.id,
    ...customerData,
    transactions: [],
  };
};

export const updateCustomer = async (customerId: string, customerData: Partial<Omit<Customer, 'id' | 'transactions' | 'balance'>>): Promise<void> => {
  const customerDocRef = doc(db, 'customers', customerId);
  await updateDoc(customerDocRef, customerData);
  revalidatePath('/dashboard');
  revalidatePath(`/customers/${customerId}`);
};

export const addTransaction = async (customerId: string, transactionData: Omit<Transaction, 'id'>): Promise<void> => {
    const transactionWithTimestamp = {
        ...transactionData,
        date: Timestamp.fromDate(new Date(transactionData.date)),
    };
    
    const transactionsColRef = collection(db, 'customers', customerId, 'transactions');
    await addDoc(transactionsColRef, transactionWithTimestamp);
    revalidatePath(`/customers/${customerId}`);
    revalidatePath('/dashboard');
}
