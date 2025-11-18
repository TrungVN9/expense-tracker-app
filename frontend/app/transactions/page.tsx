
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTransactionNotification } from '@/lib/transaction-context';
import { apiClient } from '@/lib/api';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, CreditCard, Settings, UserCircle, LogOut, Wallet, Target, BookOpen, FileText, Landmark, ArrowLeft, Plus, Calendar, DollarSign, Tag, FileTextIcon } from 'lucide-react';

function TransactionsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { markTransactionAdded } = useTransactionNotification();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'expense'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        amount: parseFloat(String(formData.amount)) || 0,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        type: formData.type,
      };

      // Call backend API
      await apiClient.createTransaction(payload);

      setSuccess('Transaction created successfully');
      // Notify dashboard to refetch
      markTransactionAdded();
      // Redirect to dashboard after a short delay so user sees the success message
      setTimeout(() => router.push('/dashboard'), 700);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: false },
    { href: '/transactions', icon: CreditCard, label: 'Transactions', active: true },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Personal Care",
    "Other",
  ];

  const incomeCategories = [
    "Salary",
    "Bonus",
    "Freelance",
    "Investments",
    "Gifts",
    "Business Revenue",
    "Other",
  ];
  
  const categories = formData.type === "expense" 
    ? expenseCategories 
    : incomeCategories;
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
            <div className="flex items-center gap-4">

              <div>
                <h2 className="text-2xl font-bold">
                  Add New {formData.type === 'expense' ? 'Expense' : 'Income'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.type === 'expense'
                    ? 'Track your spending by adding an expense'
                    : 'Record your income to keep your finances up to date'}
                </p>

              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-3xl">
          {/* Type Selection */}
          <div className="mb-6">
            <div className="inline-flex gap-2 p-1 rounded-lg bg-muted">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-destructive text-destructive-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            {/* Amount Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    formData.type === 'expense' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                  }`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Amount</CardTitle>
                    <CardDescription>
                      {formData.type === 'expense' ? 'How much did you spend?' : 'How much did you earn?'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-8 h-14 text-2xl font-semibold bg-muted/50 border-border focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Category</CardTitle>
                    <CardDescription>
                      Organize your {formData.type === 'expense' ? 'expense' : 'income'} by category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Select Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-12 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Date Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Date</CardTitle>
                    <CardDescription>
                      When did this transaction occur?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Transaction Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-12 bg-muted/50 border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                    <FileTextIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Description</CardTitle>
                    <CardDescription>
                      Add notes or details about this transaction
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="description"
                    placeholder="e.g., Dinner at Italian restaurant"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[120px] w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 h-12 text-base font-medium"
                disabled={loading}
              >
                <Plus className="h-5 w-5 mr-2" />
                {loading ? 'Creating...' : `Create ${formData.type === 'expense' ? 'Expense' : 'Income'}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="h-12 px-8 text-base font-medium border-border hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}