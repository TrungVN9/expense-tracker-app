"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTransactionNotification } from '@/lib/transaction-context';
import { apiClient } from '@/lib/api';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, CreditCard, UserCircle, LogOut, Wallet, TrendingUp, Target, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { transactionAdded, clearTransactionAdded } = useTransactionNotification();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      const [txData, billsData, budgetData] = await Promise.all([
        apiClient.getTransactions().catch(() => []),
        apiClient.getUpcomingBills().catch(() => []),
        apiClient.getBudgetStatus().catch(() => null),
      ]);
      setTransactions(txData || []);
      setUpcomingBills(billsData || []);
      setBudgetStatus(budgetData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (transactionAdded) {
      loadDashboardData();
      clearTransactionAdded();
    }
  }, [transactionAdded, clearTransactionAdded]);

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
    { href: '/bills', icon: Receipt, label: 'Bills', active: false },
    { href: '/budgets', icon: Wallet, label: 'Budgets', active: false },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const totalExpenses = transactions
    .filter((tx: any) => tx.type === 'expense')
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

  const totalIncome = transactions
    .filter((tx: any) => tx.type === 'income')
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

  const currentBalance = totalIncome - totalExpenses;

  const nextBillDays = upcomingBills.length > 0 
    ? Math.ceil((new Date(upcomingBills[0]?.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

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
                <p className="text-2xl font-bold text-primary">${currentBalance.toFixed(2)}</p>
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
                {dataLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.filter((tx: any) => tx.type === 'expense').length} expense(s)
                    </p>
                  </>
                )}
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
                {dataLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.filter((tx: any) => tx.type === 'income').length} income(s)
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Link href="/budgets">
              <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Status
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-28"></div>
                    </div>
                  ) : budgetStatus ? (
                    <>
                      <div className="text-2xl font-bold">{budgetStatus.overallPercentage}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {budgetStatus.overallPercentage <= 75 ? 'On track' : budgetStatus.overallPercentage <= 90 ? 'Watch spending' : 'Over budget'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        No budgets set
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/bills">
              <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Upcoming Bills
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                    <Receipt className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </div>
                  ) : upcomingBills.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">{upcomingBills.length} {upcomingBills.length === 1 ? 'Bill' : 'Bills'}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Next in {nextBillDays} {nextBillDays === 1 ? 'day' : 'days'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">No Bills</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All caught up
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
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
                <Link href="/transactions">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet. Add one to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 6).map((transaction: any, index: number) => {
                    const date = new Date(transaction.date);
                    const formattedDate = date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const isIncome = transaction.type === 'income';
                    return (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isIncome ? 'bg-accent/10' : 'bg-muted'
                          }`}>
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4 text-accent" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formattedDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isIncome ? 'text-accent' : 'text-foreground'
                          }`}>
                            {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
