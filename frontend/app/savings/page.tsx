"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import type { SavingTransaction, InterestProjection } from "@/lib/api"
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
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  LineChart,
  ArrowRightLeft,
  Calendar,
  Target,
} from "lucide-react"
import { PiggyBank } from "lucide-react"

interface Saving {
  id: string
  name: string
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

  const [showQuickActionModal, setShowQuickActionModal] = useState(false)
  const [quickActionType, setQuickActionType] = useState<"deposit" | "withdraw">("deposit")
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null)
  const [quickActionAmount, setQuickActionAmount] = useState("")
  const [quickActionDescription, setQuickActionDescription] = useState("")

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState<SavingTransaction[]>([])

  const [showProjectionModal, setShowProjectionModal] = useState(false)
  const [projectionData, setProjectionData] = useState<InterestProjection[]>([])
  const [projectionMonths, setProjectionMonths] = useState(12)

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferFrom, setTransferFrom] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDescription, setTransferDescription] = useState("")

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
      const transformedSavings: Saving[] = (data || []).map((saving: any) => ({
        id: saving.id,
        name: saving.name,
        accountType: saving.accountType,
        balance: saving.balance,
        interestRate: saving.interestRate,
        goal: saving.goal,
        description: saving.description,
        lastUpdated: saving.updatedAt,
      }));
      setSavings(transformedSavings);
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
        accountName: formData.accountName,
        accountType: formData.accountType,
        balance: Number.parseFloat(formData.balance) || 0,
        interestRate: formData.interestRate ? Number.parseFloat(formData.interestRate) : undefined,
        goal: formData.goal ? Number.parseFloat(formData.goal) : undefined,
        description: formData.description || undefined,
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
      accountName: saving.name,
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

  const handleQuickAction = (saving: Saving, type: "deposit" | "withdraw") => {
    setSelectedSaving(saving)
    setQuickActionType(type)
    setQuickActionAmount("")
    setQuickActionDescription("")
    setShowQuickActionModal(true)
  }

  const submitQuickAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSaving) return

    try {
      const amount = Number.parseFloat(quickActionAmount)
      if (quickActionType === "deposit") {
        await apiClient.depositToSaving(selectedSaving.id, amount, quickActionDescription)
      } else {
        await apiClient.withdrawFromSaving(selectedSaving.id, amount, quickActionDescription)
      }
      await loadSavings()
      setShowQuickActionModal(false)
    } catch (err) {
      console.error(`Failed to ${quickActionType}`, err)
    }
  }

  const viewHistory = async (saving: Saving) => {
    setSelectedSaving(saving)
    try {
      const history = await apiClient.getSavingTransactions(saving.id)
      setTransactionHistory(history)
      setShowHistoryModal(true)
    } catch (err) {
      console.error("Failed to load transaction history", err)
    }
  }

  const viewProjection = async (saving: Saving) => {
    setSelectedSaving(saving)
    try {
      const projection = await apiClient.getInterestProjection(saving.id, projectionMonths)
      setProjectionData(projection)
      setShowProjectionModal(true)
    } catch (err) {
      console.error("Failed to load projection", err)
    }
  }

  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amount = Number.parseFloat(transferAmount)
      await apiClient.transferBetweenSavings(transferFrom, transferTo, amount, transferDescription)
      await loadSavings()
      setShowTransferModal(false)
      setTransferFrom("")
      setTransferTo("")
      setTransferAmount("")
      setTransferDescription("")
    } catch (err) {
      console.error("Failed to transfer", err)
    }
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
                {savings.length >= 2 && (
                  <Button onClick={() => setShowTransferModal(true)} variant="outline" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                  </Button>
                )}
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
                            <CardTitle className="text-base">{saving.name}</CardTitle>
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
                              <Target className="h-3 w-3" />${saving.goal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 bg-transparent"
                          onClick={() => handleQuickAction(saving, "deposit")}
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          Deposit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 bg-transparent"
                          onClick={() => handleQuickAction(saving, "withdraw")}
                        >
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                          Withdraw
                        </Button>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 gap-2 text-xs"
                          onClick={() => viewHistory(saving)}
                        >
                          <History className="h-3.5 w-3.5" />
                          History
                        </Button>
                        {saving.interestRate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 gap-2 text-xs"
                            onClick={() => viewProjection(saving)}
                          >
                            <LineChart className="h-3.5 w-3.5" />
                            Projection
                          </Button>
                        )}
                      </div>

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
                    className="flex min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

      {showQuickActionModal && selectedSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {quickActionType === "deposit" ? (
                    <>
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      Deposit to {selectedSaving.name}
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle className="h-5 w-5 text-orange-600" />
                      Withdraw from {selectedSaving.name}
                    </>
                  )}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowQuickActionModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitQuickAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quickAmount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="quickAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={quickActionAmount}
                      onChange={(e) => setQuickActionAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quickDescription">Description (Optional)</Label>
                  <Input
                    id="quickDescription"
                    placeholder="e.g., Monthly contribution"
                    value={quickActionDescription}
                    onChange={(e) => setQuickActionDescription(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="font-medium">${selectedSaving.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">New Balance:</span>
                    <span className="font-semibold text-accent">
                      $
                      {quickActionType === "deposit"
                        ? (selectedSaving.balance + (Number.parseFloat(quickActionAmount) || 0)).toFixed(2)
                        : (selectedSaving.balance - (Number.parseFloat(quickActionAmount) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    variant={quickActionType === "deposit" ? "default" : "destructive"}
                  >
                    {quickActionType === "deposit" ? "Deposit" : "Withdraw"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowQuickActionModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showHistoryModal && selectedSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-border max-h-[80vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History - {selectedSaving.name}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowHistoryModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              {transactionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            transaction.type === "deposit"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "withdrawal"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {transaction.type === "deposit" ? (
                            <ArrowUpCircle className="h-5 w-5" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowDownCircle className="h-5 w-5" />
                          ) : (
                            <TrendingUp className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          {transaction.description && (
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === "deposit" ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {transaction.type === "deposit" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showProjectionModal && selectedSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl border-border max-h-[80vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Interest Projection - {selectedSaving.name}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowProjectionModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Label htmlFor="projectionMonths">Projection Period:</Label>
                <select
                  id="projectionMonths"
                  value={projectionMonths}
                  onChange={(e) => {
                    setProjectionMonths(Number(e.target.value))
                    viewProjection(selectedSaving)
                  }}
                  className="flex h-9 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="6">6 Months</option>
                  <option value="12">1 Year</option>
                  <option value="24">2 Years</option>
                  <option value="36">3 Years</option>
                  <option value="60">5 Years</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              {projectionData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading projection...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-border bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-xl font-bold text-accent">${selectedSaving.balance.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Projected Balance</p>
                        <p className="text-xl font-bold text-primary">
                          ${projectionData[projectionData.length - 1]?.balance.toFixed(2) || "0.00"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-xl font-bold text-green-600">
                          +$
                          {((projectionData[projectionData.length - 1]?.balance || 0) - selectedSaving.balance).toFixed(
                            2,
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {projectionData.map((projection, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{projection.month}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Interest Earned</p>
                            <p className="text-sm font-semibold text-green-600">+${projection.interest.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Balance</p>
                            <p className="text-sm font-semibold">${projection.balance.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Transfer Between Accounts
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowTransferModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferFrom">From Account</Label>
                  <select
                    id="transferFrom"
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select account...</option>
                    {savings.map((saving) => (
                      <option key={saving.id} value={saving.id}>
                        {saving.name} - ${saving.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferTo">To Account</Label>
                  <select
                    id="transferTo"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select account...</option>
                    {savings
                      .filter((s) => s.id !== transferFrom)
                      .map((saving) => (
                        <option key={saving.id} value={saving.id}>
                          {saving.name} - ${saving.balance.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="transferAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferDescription">Description (Optional)</Label>
                  <Input
                    id="transferDescription"
                    placeholder="e.g., Rebalancing accounts"
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">
                    Transfer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowTransferModal(false)}>
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
