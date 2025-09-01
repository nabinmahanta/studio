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
  const customersCol = collection(db, 'customers');
  const q = query(customersCol, orderBy('name'));
  const customerSnapshot = await getDocs(q);
  
  const customersList: (Customer & { balance: number })[] = [];

  // It's more efficient to fetch all transactions at once if possible,
  // but for simplicity and correctness with subcollections, we'll fetch them per customer.
  for (const customerDoc of customerSnapshot.docs) {
    const customerData = customerDoc.data() as Omit<Customer, 'id'>;
    
    const transactionsCol = collection(db, 'customers', customerDoc.id, 'transactions');
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
    
    customersList.push({
      id: customerDoc.id,
      ...customerData,
      transactions,
      balance,
    });
  }
  
  return customersList;
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
}
