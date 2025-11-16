"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const debts = [
  { id: 1, name: 'Credit Card', amount: 5000, interestRate: 18.99, minPayment: 100 },
  { id: 2, name: 'Student Loan', amount: 20000, interestRate: 5.0, minPayment: 250 },
  { id: 3, name: 'Car Loan', amount: 15000, interestRate: 4.5, minPayment: 300 },
];

export default function DebtsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Debts</h1>
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimum Payment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debts.map((debt) => (
                <tr key={debt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{debt.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{debt.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{debt.interestRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{debt.minPayment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
