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

export const getCustomers = async (userId: string): Promise<(Customer & { balance: number })[]> => {
  if (!userId) return [];
  
  const customersPath = `users/${userId}/customers`;
  const customersQuery = query(collection(db, customersPath), orderBy('name'));
  
  // We can't query all subcollections easily without knowing the user ID on the backend securely,
  // so we fetch transactions per customer. This can be slow for many customers.
  // A better long-term solution would involve a different data structure or backend logic.
  const customerSnapshot = await getDocs(customersQuery);

  const customersWithBalance = await Promise.all(customerSnapshot.docs.map(async (docSnap) => {
    const customer = {
      id: docSnap.id,
      ...(docSnap.data() as Omit<Customer, 'id' | 'transactions'>),
    };
    
    const transactionsCol = collection(db, customersPath, customer.id, 'transactions');
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
    return { ...customer, transactions, balance };
  }));

  return customersWithBalance;
};


export const getCustomerById = async (userId: string, id: string): Promise<(Customer & { balance: number }) | undefined> => {
  if (!userId) return undefined;
  
  const customerDocRef = doc(db, `users/${userId}/customers`, id);
  const customerDoc = await getDoc(customerDocRef);

  if (!customerDoc.exists()) {
    return undefined;
  }

  const customerData = customerDoc.data() as Omit<Customer, 'id'>;
  
  const transactionsCol = collection(db, `users/${userId}/customers`, id, 'transactions');
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

export const addCustomer = async (userId: string, customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>): Promise<Customer & { transactions: [] }> => {
  if (!userId) throw new Error("User not authenticated");
  
  const customersCol = collection(db, `users/${userId}/customers`);
  const newCustomerRef = await addDoc(customersCol, customerData);
  
  return {
    id: newCustomerRef.id,
    ...customerData,
    transactions: [],
  };
};

export const updateCustomer = async (userId: string, customerId: string, customerData: Partial<Omit<Customer, 'id' | 'transactions' | 'balance'>>): Promise<void> => {
  if (!userId) throw new Error("User not authenticated");
  
  const customerDocRef = doc(db, `users/${userId}/customers`, customerId);
  await updateDoc(customerDocRef, customerData);
};

export const addTransaction = async (userId: string, customerId: string, transactionData: Omit<Transaction, 'id'>): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");

    const transactionWithTimestamp = {
        ...transactionData,
        date: Timestamp.fromDate(new Date(transactionData.date)),
    };
    
    const transactionsColRef = collection(db, `users/${userId}/customers`, customerId, 'transactions');
    await addDoc(transactionsColRef, transactionWithTimestamp);
}
