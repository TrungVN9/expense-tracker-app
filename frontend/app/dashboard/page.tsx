"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, CreditCard, Settings, UserCircle, LogOut, Wallet, TrendingUp, Target, BookOpen, FileText, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/transactions', icon: CreditCard, label: 'Transactions', active: false },
    //{ href: '/categories', icon: Wallet, label: 'Categories', active: false },
    //{ href: '/reports', icon: FileText, label: 'Reports', active: false },
    //{ href: '/goals', icon: Target, label: 'Goals', active: false },
    //{ href: '/budgets', icon: BookOpen, label: 'Budgets', active: false },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold">Expense Tracker</h1>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-border p-3 space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user?.fullName || 'User'}!</h2>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-primary">$12,450.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,350.00</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-destructive">+5.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Income
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,240.00</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-accent">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Budget Status
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  On track this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming Bills
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Bills</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Next one in 5 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your latest recorded transactions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Grocery Store', amount: '-$85.50', date: 'Today, 2:30 PM', category: 'Food' },
                  { name: 'Salary Deposit', amount: '+$3,500.00', date: 'Yesterday, 9:00 AM', category: 'Income' },
                  { name: 'Electric Bill', amount: '-$125.00', date: '2 days ago', category: 'Utilities' },
                  { name: 'Coffee Shop', amount: '-$12.50', date: '3 days ago', category: 'Food' },
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transaction.amount.startsWith('+') ? 'bg-accent/10' : 'bg-muted'
                      }`}>
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount.startsWith('+') ? 'text-accent' : 'text-foreground'
                      }`}>
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
