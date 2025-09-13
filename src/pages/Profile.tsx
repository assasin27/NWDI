import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Lock, 
  MapPin, 
  Eye, 
  EyeOff, 
  LogOut, 
  Save, 
  AlertCircle,
  User,
  Mail,
  Home,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { apiService } from '../lib/apiService';
import { useToast } from '../components/ui/use-toast';

interface Address {
  id: string;
  houseBuilding: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, signOut } = useSupabaseUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    houseBuilding: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Wait for user loading to complete before checking authentication
    if (userLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // Load user data
    if (user.user_metadata?.name) {
      setName(user.user_metadata.name);
    }
    
    // Load addresses from user metadata
    if (user.user_metadata?.addresses) {
      setAddresses(user.user_metadata.addresses);
    } else {
      // Initialize with empty array if no addresses
      setAddresses([]);
    }
  }, [user, userLoading, navigate]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const { error } = await apiService.updateUserProfile({
        name: name,
        addresses: addresses
      });

      if (error) {
        setError(error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error
        });
      } else {
        setSuccess('Profile updated successfully!');
        toast({
          title: 'Success',
          description: 'Profile updated successfully!'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.houseBuilding || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setError('Please fill in all required address fields');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0
    };

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    setNewAddress({
      houseBuilding: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    setShowAddressForm(false);
    setSuccess('Address added successfully!');
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      houseBuilding: address.houseBuilding,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark
    });
    setShowAddressForm(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    if (!newAddress.houseBuilding || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setError('Please fill in all required address fields');
      return;
    }

    const updatedAddresses = addresses.map(addr => 
      addr.id === editingAddress.id 
        ? { ...addr, ...newAddress }
        : addr
    );

    setAddresses(updatedAddresses);
    setEditingAddress(null);
    setNewAddress({
      houseBuilding: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    setShowAddressForm(false);
    setSuccess('Address updated successfully!');
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    setAddresses(updatedAddresses);
    setSuccess('Address deleted successfully!');
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    setSuccess('Default address updated!');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'New passwords do not match'
      });
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'New password must be at least 6 characters long'
      });
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // First verify old password by attempting to sign in
      const { error: signInError } = await apiService.verifyPassword(
        user?.email || '',
        oldPassword
      );

      if (signInError) {
        setError('Current password is incorrect');
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Current password is incorrect'
        });
        setLoading(false);
        return;
      }

      // Update password
      const { error } = await apiService.updatePassword(newPassword);

      if (error) {
        setError(error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error
        });
      } else {
        setSuccess('Password updated successfully!');
        toast({
          title: 'Success',
          description: 'Password updated successfully!'
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading spinner while user data is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and delivery addresses</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Addresses
                </CardTitle>
                <CardDescription>
                  Manage your delivery addresses for orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <Card key={address.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{address.houseBuilding}</h4>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {address.street}, {address.city}, {address.state} - {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-xs text-gray-500">Landmark: {address.landmark}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!address.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add New Address Button */}
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddressForm(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                )}

                {/* Address Form */}
                {showAddressForm && (
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({
                            houseBuilding: '',
                            street: '',
                            city: '',
                            state: '',
                            pincode: '',
                            landmark: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="houseBuilding">House/Building *</Label>
                        <Input
                          id="houseBuilding"
                          value={newAddress.houseBuilding}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, houseBuilding: e.target.value }))}
                          placeholder="e.g., A-101, Green Valley Apartments"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="street">Street *</Label>
                        <Input
                          id="street"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="e.g., MG Road"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g., Mumbai"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="e.g., Maharashtra"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="e.g., 400001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="landmark">Landmark</Label>
                          <Input
                            id="landmark"
                            value={newAddress.landmark}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                            placeholder="e.g., Near Central Mall"
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        {editingAddress ? 'Update Address' : 'Add Address'}
                      </Button>
                    </div>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mt-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
