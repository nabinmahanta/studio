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
  runTransaction,
  collectionGroup
} from 'firebase/firestore';

export const getCustomers = async (userId: string): Promise<Customer[]> => {
  if (!userId) return [];
  
  const customersPath = `users/${userId}/customers`;
  const customersQuery = query(collection(db, customersPath), orderBy('name'));
  
  const customerSnapshot = await getDocs(customersQuery);

  const customers = customerSnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      balance: data.balance || 0,
      transactions: [], // Transactions are now loaded on demand
    } as Customer;
  });

  return customers;
};


export const getCustomerById = async (userId: string, id: string): Promise<Customer | undefined> => {
  if (!userId) return undefined;
  
  const customerDocRef = doc(db, `users/${userId}/customers`, id);
  const customerDoc = await getDoc(customerDocRef);

  if (!customerDoc.exists()) {
    return undefined;
  }

  const customerData = customerDoc.data() as Omit<Customer, 'id' | 'transactions'>;
  
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

  return { 
    id: customerDoc.id, 
    ...customerData, 
    transactions,
    balance: customerData.balance || 0
  };
};

export const addCustomer = async (userId: string, customerData: Omit<Customer, 'id' | 'transactions' | 'balance'>): Promise<Customer> => {
  if (!userId) throw new Error("User not authenticated");

  const customerWithBalance = {
    ...customerData,
    balance: 0,
  }
  
  const customersCol = collection(db, `users/${userId}/customers`);
  const newCustomerRef = await addDoc(customersCol, customerWithBalance);
  
  return {
    id: newCustomerRef.id,
    ...customerWithBalance,
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

    const customerDocRef = doc(db, `users/${userId}/customers`, customerId);
    const transactionsColRef = collection(db, `users/${userId}/customers`, customerId, 'transactions');

    const transactionWithTimestamp = {
        ...transactionData,
        date: Timestamp.fromDate(new Date(transactionData.date)),
    };

    await runTransaction(db, async (firestoreTransaction) => {
        const customerDoc = await firestoreTransaction.get(customerDocRef);
        if (!customerDoc.exists()) {
            throw "Customer does not exist!";
        }

        const currentBalance = customerDoc.data().balance || 0;
        const amountChange = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
        const newBalance = currentBalance + amountChange;

        firestoreTransaction.update(customerDocRef, { balance: newBalance });
        
        const newTransactionRef = doc(transactionsColRef);
        firestoreTransaction.set(newTransactionRef, transactionWithTimestamp);
    });
}
