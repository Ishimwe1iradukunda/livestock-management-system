import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Shield, User, Calendar, Mail } from 'lucide-react';
import backend from '~backend/client';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export default function UserManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user' as 'admin' | 'user',
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => backend.auth.listUsers({
      token: `Bearer ${token}`,
      limit: 100,
    }),
    enabled: !!token,
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: typeof formData) =>
      backend.auth.createUser({
        token: `Bearer ${token}`,
        ...userData,
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setShowCreateForm(false);
      setFormData({ email: '', password: '', fullName: '', role: 'user' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & Partial<User>) =>
      backend.auth.updateUser({
        token: `Bearer ${token}`,
        id,
        ...userData,
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) =>
      backend.auth.deleteUser({
        token: `Bearer ${token}`,
        id,
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleUpdateUser = (user: User, updates: Partial<User>) => {
    updateUserMutation.mutate({ id: user.id, ...updates });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
              <SheetDescription>
                Add a new user to the system with appropriate permissions.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {usersData?.users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {user.role === 'admin' ? (
                      <Shield className="h-5 w-5 text-purple-600" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600" />
                    )}
                    {user.fullName}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.isActive)}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last login: {formatDate(user.lastLogin)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Edit User</SheetTitle>
                          <SheetDescription>
                            Update user information and permissions.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              value={user.email}
                              onChange={(e) => handleUpdateUser(user, { email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={user.fullName}
                              onChange={(e) => handleUpdateUser(user, { fullName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={user.role}
                              onValueChange={(value: 'admin' | 'user') => 
                                handleUpdateUser(user, { role: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={user.isActive ? 'active' : 'inactive'}
                              onValueChange={(value) => 
                                handleUpdateUser(user, { isActive: value === 'active' })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.fullName}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!usersData?.users || usersData.users.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground text-center">
              Get started by creating your first user account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}