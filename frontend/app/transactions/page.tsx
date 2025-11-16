"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const transactions = [
  { id: 1, date: '2024-01-01', description: 'Groceries', amount: -50.0, type: 'expense' },
  { id: 2, date: '2024-01-02', description: 'Salary', amount: 2000.0, type: 'income' },
  { id: 3, date: '2024-01-03', description: 'Dinner', amount: -30.0, type: 'expense' },
  { id: 4, date: '2024-01-04', description: 'Freelance', amount: 300.0, type: 'income' },
];

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      // In a real app, you'd decode the token or fetch user info from the backend
      // For now, we'll just use some placeholder data
      setUser({
        username: 'user',
        email: 'user@example.com',
      });
    }
  }, [router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-8 mx-auto mt-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
