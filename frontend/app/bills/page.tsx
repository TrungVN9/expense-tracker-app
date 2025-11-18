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
import { LayoutDashboard, CreditCard, UserCircle, LogOut, Wallet, Receipt, Plus, Pencil, Trash2, Calendar, DollarSign, X, CheckCircle } from 'lucide-react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  frequency: string;
  category: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

function BillsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    recurring: true,
    frequency: 'monthly',
    category: '',
  });

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBills();
      const transformedBills: Bill[] = (data || []).map((bill: any) => ({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        recurring: bill.recurring,
        frequency: bill.frequency,
        category: bill.category,
        status: bill.status,
        paidDate: bill.paidDate,
      }));
      setBills(transformedBills);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingBill) {
        await apiClient.updateBill(editingBill.id, billData);
      } else {
        await apiClient.createBill(billData);
      }

      await loadBills();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save bill', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    try {
      await apiClient.deleteBill(id);
      await loadBills();
    } catch (err) {
      console.error('Failed to delete bill', err);
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      recurring: bill.recurring,
      frequency: bill.frequency,
      category: bill.category,
    });
    setShowModal(true);
  };

  const handlePayBill = async (id: string) => {
    try {
      await apiClient.payBill(id);
      await loadBills();
    } catch (err) {
      console.error('Failed to mark bill as paid', err);
    }
  };

  const handleUnpayBill = async (id: string) => {
    if (!confirm('Mark this bill as unpaid?')) return;
    
    try {
      await apiClient.unpayBill(id);
      await loadBills();
    } catch (err) {
      console.error('Failed to mark bill as unpaid', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      recurring: true,
      frequency: 'monthly',
      category: '',
    });
    setEditingBill(null);
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: false },
    { href: '/transactions', icon: CreditCard, label: 'Transactions', active: false },
    { href: '/bills', icon: Receipt, label: 'Bills', active: true },
    { href: '/budgets', icon: Wallet, label: 'Budgets', active: false },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'pending':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

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
                <h2 className="text-2xl font-bold">Bills Management</h2>
                <p className="text-sm text-muted-foreground mt-1">Track and manage your recurring bills</p>
              </div>
              <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Bills Yet</h3>
                <p className="text-muted-foreground mb-6">Start tracking your recurring bills to stay on top of payments</p>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bills.map((bill) => (
                <Card key={bill.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{bill.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{bill.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(bill)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(bill.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${bill.amount.toFixed(2)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                    </div>
                    {bill.status === 'paid' && bill.paidDate && (
                      <div className="flex items-center gap-2 text-sm text-accent">
                        <CheckCircle className="h-4 w-4" />
                        <span>Paid: {new Date(bill.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {bill.recurring && (
                      <div className="text-xs text-muted-foreground capitalize">
                        Repeats {bill.frequency}
                      </div>
                    )}
                    <div className="pt-2 border-t border-border">
                      {bill.status === 'paid' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUnpayBill(bill.id)}
                        >
                          Mark as Unpaid
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handlePayBill(bill.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</CardTitle>
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
                  <Label htmlFor="name">Bill Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Netflix Subscription"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                    <option value="utilities">Utilities</option>
                    <option value="subscription">Subscription</option>
                    <option value="insurance">Insurance</option>
                    <option value="rent">Rent/Mortgage</option>
                    <option value="loan">Loan</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    <Label htmlFor="recurring" className="font-normal cursor-pointer">
                      This is a recurring bill
                    </Label>
                  </div>

                  {formData.recurring && (
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <select
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingBill ? 'Update Bill' : 'Add Bill'}
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

export default function BillsPage() {
  return (
    <ProtectedRoute>
      <BillsContent />
    </ProtectedRoute>
  );
}
