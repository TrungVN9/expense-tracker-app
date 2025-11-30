"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  LayoutDashboard,
  CreditCard,
  UserCircle,
  LogOut,
  Wallet,
  Receipt,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  X,
  TrendingUp,
  Building2,
} from "lucide-react"
import { PiggyBank } from "lucide-react" // Added PiggyBank import

interface Saving {
  id: string
  accountName: string
  accountType: string
  balance: number
  interestRate?: number
  goal?: number
  description?: string
  lastUpdated: string
}

function SavingsContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [savings, setSavings] = useState<Saving[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "",
    balance: "",
    interestRate: "",
    goal: "",
    description: "",
  })

  const loadSavings = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getSavings()
      setSavings(data || [])
    } catch (err) {
      console.error("Failed to load savings", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavings()
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const savingData = {
        ...formData,
        balance: Number.parseFloat(formData.balance),
        interestRate: formData.interestRate ? Number.parseFloat(formData.interestRate) : undefined,
        goal: formData.goal ? Number.parseFloat(formData.goal) : undefined,
      }

      if (editingSaving) {
        await apiClient.updateSaving(editingSaving.id, savingData)
      } else {
        await apiClient.createSaving(savingData)
      }

      await loadSavings()
      setShowModal(false)
      resetForm()
    } catch (err) {
      console.error("Failed to save account", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this savings account?")) return

    try {
      await apiClient.deleteSaving(id)
      await loadSavings()
    } catch (err) {
      console.error("Failed to delete savings account", err)
    }
  }

  const handleEdit = (saving: Saving) => {
    setEditingSaving(saving)
    setFormData({
      accountName: saving.accountName,
      accountType: saving.accountType,
      balance: saving.balance.toString(),
      interestRate: saving.interestRate?.toString() || "",
      goal: saving.goal?.toString() || "",
      description: saving.description || "",
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      accountName: "",
      accountType: "",
      balance: "",
      interestRate: "",
      goal: "",
      description: "",
    })
    setEditingSaving(null)
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: false },
    { href: "/transactions", icon: CreditCard, label: "Transactions", active: false },
    { href: "/bills", icon: Receipt, label: "Bills", active: false },
    { href: "/budgets", icon: Wallet, label: "Budgets", active: false },
    { href: "/savings", icon: PiggyBank, label: "Savings", active: true },
  ]

  const bottomNavItems = [{ href: "/profile", icon: UserCircle, label: "Profile" }]

  const accountTypes = [
    { value: "hysa", label: "High Yield Savings Account (HYSA)" },
    { value: "401k", label: "401(k)" },
    { value: "ira", label: "IRA (Traditional/Roth)" },
    { value: "emergency", label: "Emergency Fund" },
    { value: "brokerage", label: "Brokerage Account" },
    { value: "cd", label: "Certificate of Deposit (CD)" },
    { value: "money-market", label: "Money Market Account" },
    { value: "other", label: "Other" },
  ]

  const getAccountIcon = (type: string) => {
    if (type === "401k" || type === "ira" || type === "brokerage") {
      return Building2
    }
    return PiggyBank
  }

  const calculateProgress = (balance: number, goal?: number) => {
    if (!goal) return 0
    return Math.min((balance / goal) * 100, 100)
  }

  const totalSavings = savings.reduce((sum, saving) => sum + saving.balance, 0)

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
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                <h2 className="text-2xl font-bold">Savings & Investments</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track all your savings accounts and investment portfolios
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold text-accent">${totalSavings.toFixed(2)}</p>
                </div>
                <Button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading savings accounts...</p>
            </div>
          ) : savings.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <PiggyBank className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Savings Accounts Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking your savings and investments to build wealth
                </p>
                <Button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savings.map((saving) => {
                const Icon = getAccountIcon(saving.accountType)
                const progress = calculateProgress(saving.balance, saving.goal)
                const accountType = accountTypes.find((t) => t.value === saving.accountType)

                return (
                  <Card key={saving.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{saving.accountName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{accountType?.label}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(saving)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(saving.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-2xl font-bold text-accent">${saving.balance.toFixed(2)}</p>
                        </div>
                        {saving.interestRate && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-semibold text-primary">{saving.interestRate}%</p>
                          </div>
                        )}
                      </div>

                      {saving.goal && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Goal Progress</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">${saving.balance.toFixed(2)}</span>
                            <span className="text-accent font-medium flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Goal: ${saving.goal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {saving.description && (
                        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                          {saving.description}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Last updated: {new Date(saving.lastUpdated).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Savings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingSaving ? "Edit Savings Account" : "Add New Savings Account"}</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="e.g., Emergency Fund"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select account type...</option>
                    {accountTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 4.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Savings Goal (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="goal"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    placeholder="Add notes about this account..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingSaving ? "Update Account" : "Add Account"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
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
  )
}

export default function SavingsPage() {
  return (
    <ProtectedRoute>
      <SavingsContent />
    </ProtectedRoute>
  )
}
