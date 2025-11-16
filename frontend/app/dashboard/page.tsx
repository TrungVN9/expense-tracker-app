// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  UserCircle,
  LogOut,
  Wallet,
  TrendingUp,
  Target,
  BookOpen,
  FileText,
  Landmark,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      // In a real app, you'd decode the token or fetch user info
      // For now, we'll simulate fetching user data
      setUsername('Test User');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div> {/* Replace with a proper spinner component if you have one */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="flex items-center px-6 py-3 text-gray-700 bg-gray-200 dark:text-gray-200 dark:bg-gray-700">
            <LayoutDashboard className="w-5 h-5" />
            <span className="mx-4">Dashboard</span>
          </Link>
          <Link href="/transactions" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <CreditCard className="w-5 h-5" />
            <span className="mx-4">Transactions</span>
          </Link>
          <Link href="/categories" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Wallet className="w-5 h-5" />
            <span className="mx-4">Categories</span>
          </Link>
          <Link href="/reports" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <FileText className="w-5 h-5" />
            <span className="mx-4">Reports</span>
          </Link>
          <Link href="/goals" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Target className="w-5 h-5" />
            <span className="mx-4">Goals</span>
          </Link>
          <Link href="/budgets" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <BookOpen className="w-5 h-5" />
            <span className="mx-4">Budgets</span>
          </Link>
          <Link href="/debts" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Landmark className="w-5 h-5" />
            <span className="mx-4">Debts</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full">
          <hr className="dark:border-gray-700" />
          <Link href="/profile" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <UserCircle className="w-5 h-5" />
            <span className="mx-4">Profile</span>
          </Link>
          <Link href="/settings" className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Settings className="w-5 h-5" />
            <span className="mx-4">Settings</span>
          </Link>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start flex items-center px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900">
            <LogOut className="w-5 h-5" />
            <span className="mx-4">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {username}!</h2>
        </header>

        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350.00</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75% Utilized</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">You are on track!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
              <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Bills Due</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Next one in 5 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Here are your latest recorded transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for recent transactions list */}
              <p className="text-gray-600 dark:text-gray-400">No recent transactions to display.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}