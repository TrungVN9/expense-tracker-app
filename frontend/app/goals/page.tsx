"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const goals = [
  { id: 1, name: 'Save for a new car', targetAmount: 20000, currentAmount: 5000, progress: 25 },
  { id: 2, name: 'Save for a vacation', targetAmount: 5000, currentAmount: 2000, progress: 40 },
  { id: 3, name: 'Pay off credit card debt', targetAmount: 10000, currentAmount: 8000, progress: 80 },
];

export default function GoalsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <div className="mt-6">
          {goals.map((goal) => (
            <div key={goal.id} className="p-4 mb-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{goal.name}</h2>
                <p className="text-gray-600">
                  {goal.currentAmount} / {goal.targetAmount}
                </p>
              </div>
              <div className="w-full mt-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
