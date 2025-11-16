"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 1, name: 'Groceries', description: 'Food and household items' },
  { id: 2, name: 'Utilities', description: 'Electricity, water, internet' },
  { id: 3, name: 'Transportation', description: 'Gas, public transit' },
  { id: 4, name: 'Entertainment', description: 'Movies, concerts, etc.' },
];

export default function CategoriesPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
