import Link from 'next/link';
import { ArrowRight, TrendingUp, Target, PieChart, Wallet, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="mr-2 h-4 w-4" />
              Your Personal Finance Companion
            </div>
            
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl">
              Take Control of Your{' '}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Track expenses, manage budgets, and achieve your financial goals with powerful insights and intuitive tools designed for modern money management.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features to help you stay on top of your finances
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Expense Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor every transaction and visualize spending patterns with detailed analytics and insights.
              </p>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Budgets</h3>
              <p className="text-muted-foreground leading-relaxed">
                Set custom budgets for different categories and get alerts when you're approaching limits.
              </p>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3 transition-transform group-hover:scale-110">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visual Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                Beautiful charts and reports that make understanding your finances simple and intuitive.
              </p>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4 transition-transform group-hover:scale-110">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Financial Goals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Define savings goals and track your progress with automated calculations and milestones.
              </p>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5 transition-transform group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Bank-Level Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your financial data is encrypted and protected with industry-standard security measures.
              </p>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-Time Sync</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access your data across all devices with instant synchronization and offline support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Start managing your money smarter today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Join thousands of users who have taken control of their finances. Get started in minutes, no credit card required.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link href="/signup">
                  Create Your Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
