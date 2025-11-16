"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Coming Soon</h2>
          <p className="mt-2 text-gray-600">
            This page will contain various expense reports and visualizations.
          </p>
        </div>
      </div>
    </div>
  );
}
