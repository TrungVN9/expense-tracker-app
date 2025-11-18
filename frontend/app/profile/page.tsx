"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, UserProfile } from '@/lib/api';
import { LayoutDashboard, CreditCard, UserCircle, User, LogOut, Wallet, Upload, Mail, SquareActivity , Save, Calendar, MapPin, Phone,} from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  
  // Initialize state from AuthContext
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the user from context is available, use it. Otherwise, fetch it.
    if (user) {
      setProfile(user);
      setEditedProfile(user);
      setLoading(false);
    } else {
      // This might happen on a hard refresh where context is not yet populated
      fetchUserProfile();
    }
  }, [user]); // Depend on the user object from context

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the apiClient to get the current user
      const data = await apiClient.getCurrentUser();
      
      setProfile(data);
      setEditedProfile(data);
      
      // Also refresh the user in the global context
      await refreshUser();

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again later.');
      // On failure, the user might have an invalid token, so log them out
      logout();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      setIsSaving(true);
      setError(null);

      // Use the apiClient to update the profile
      const updatedData = await apiClient.updateProfile(editedProfile);
      
      setProfile(updatedData);
      setEditedProfile(updatedData);
      setIsEditing(false);

      // Refresh the global user state after a successful update
      await refreshUser();

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: false },
    { href: '/transactions', icon: CreditCard, label: 'Transactions', active: false },
  ];

  const bottomNavItems = [
    { href: '/profile', icon: UserCircle, label: 'Profile', active: true },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <User className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-w-4xl">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-primary-foreground text-3xl font-bold">
                    {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{profile?.fullName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">@{profile?.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Active Member
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={editedProfile?.fullName || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, fullName: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={editedProfile?.username || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, username: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile?.email || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedProfile?.phone || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="flex items-center gap-2">
                    <SquareActivity className="h-4 w-4 text-muted-foreground" />
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={editedProfile?.occupation || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, occupation: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editedProfile?.dateOfBirth || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={editedProfile?.address || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                    disabled={!isEditing}
                    className="bg-background"
                    placeholder="123 Main Street, City, State, ZIP"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Account Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 months ago</div>
                <p className="text-xs text-muted-foreground mt-1">Member since Jan 2024</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Categories Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">Active categories</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
