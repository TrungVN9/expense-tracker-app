"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <div className="mt-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Username:</span> {user.username}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Email:</span> {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
