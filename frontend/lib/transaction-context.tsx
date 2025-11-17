'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TransactionContextType {
  transactionAdded: boolean;
  markTransactionAdded: () => void;
  clearTransactionAdded: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactionAdded, setTransactionAdded] = useState(false);

  const markTransactionAdded = useCallback(() => {
    setTransactionAdded(true);
  }, []);

  const clearTransactionAdded = useCallback(() => {
    setTransactionAdded(false);
  }, []);

  return (
    <TransactionContext.Provider value={{ transactionAdded, markTransactionAdded, clearTransactionAdded }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionNotification() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionNotification must be used within TransactionProvider');
  }
  return context;
}
