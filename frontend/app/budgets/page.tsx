"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, CreditCard, UserCircle, PiggyBank, LogOut, Wallet, Receipt, Target, Plus, Pencil, Trash2, DollarSign, X, TrendingUp, AlertTriangle } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  budgetLimit: number;
  spent: number;
  period: string;
}

function BudgetsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    budgetLimit: '',
    period: 'monthly',
  });

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBudgets();
      setBudgets(
        (data || []).map((item: any) => ({
          id: item.id,
          category: item.category ?? '',
            budgetLimit: item.budgetLimit ?? 0,
          spent: item.spent ?? 0,
          period: item.period ?? 'monthly',
        }))
      );
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate category is selected
    if (!formData.category) {
      console.error('Please select a category');
      return;
    }
    
    try {
      const budgetData = {
        category: formData.category,
          budgetLimit: parseFloat(formData.budgetLimit),
        period: formData.period,
      };

      if (editingBudget) {
        await apiClient.updateBudget(editingBudget.id, budgetData);
      } else {
        await apiClient.createBudget(budgetData);
      }

      await loadBudgets();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save budget', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await apiClient.deleteBudget(id);
      await loadBudgets();
    } catch (err) {
      console.error('Failed to delete budget', err);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
        budgetLimit: budget.budgetLimit.toString(),
      period: budget.period,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      budgetLimit: '',
      period: 'monthly',
    });
    setEditingBudget(null);
  };

  const calculatePercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-chart-3';
    return 'bg-accent';
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: false },
    { href: '/transactions', icon: CreditCard, label: 'Transactions', active: false },
    { href: '/bills', icon: Receipt, label: 'Bills', active: false },
    { href: '/budgets', icon: Wallet, label: 'Budgets', active: true },
    { href: "/savings", icon: PiggyBank, label: "Savings", active: false },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Other'
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
                <h2 className="text-2xl font-bold">Budget Management</h2>
                <p className="text-sm text-muted-foreground mt-1">Set spending limits and track your progress</p>
              </div>
              <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Budgets Set</h3>
                <p className="text-muted-foreground mb-6">Create budgets to track spending by category and stay on target</p>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
             const percentage = calculatePercentage(budget.spent, budget.budgetLimit);
                  const remaining = budget.budgetLimit - budget.spent;
                  const isOverBudget = budget.spent > budget.budgetLimit;

                return (
                  <Card key={budget.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            percentage >= 90 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                          }`}>
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{budget.category}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Spent</span>
                            <span className="font-medium">${budget.spent.toFixed(2)} / ${budget.budgetLimit.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getStatusColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
                          {isOverBudget ? (
                            <span className="text-destructive font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Over by ${Math.abs(remaining).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-accent font-medium flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              ${remaining.toFixed(2)} left
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Budget Limit</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="limit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <select
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingBudget ? 'Update Budget' : 'Add Budget'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <BudgetsContent />
    </ProtectedRoute>
  );
}
