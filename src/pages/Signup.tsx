import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from "../integrations/supabase/supabaseClient";
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Home, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

interface Address {
  houseBuilding: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Account creation states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Address states
  const [address, setAddress] = useState<Address>({
    houseBuilding: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        setSuccess('Account created successfully! Now let\'s add your delivery address.');
        setStep(2);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate address fields
    if (!address.houseBuilding || !address.street || !address.city || !address.state || !address.pincode) {
      setError('Please fill in all required address fields');
      setLoading(false);
      return;
    }

    try {
      // Update user with address information
      const { error } = await supabase.auth.updateUser({
        data: {
          addresses: [{
            id: Date.now().toString(),
            ...address,
            isDefault: true
          }]
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account setup complete! Please check your email for verification.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to save address information');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join Nareshwadi Products</p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {step === 1 ? (
          // Step 1: Account Creation
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountCreation} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
            value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Create a password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Confirm your password"
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
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue to Address
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Step 2: Address Collection
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
              <CardDescription>
                Add your delivery address for orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddressSubmission} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="houseBuilding">House/Building *</Label>
                  <Input
                    id="houseBuilding"
                    value={address.houseBuilding}
                    onChange={(e) => setAddress(prev => ({ ...prev, houseBuilding: e.target.value }))}
                    placeholder="e.g., A-101, Green Valley Apartments"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="street">Street *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="e.g., MG Road"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="e.g., Maharashtra"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="e.g., 400001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={address.landmark}
                      onChange={(e) => setAddress(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g., Near Central Mall"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        <Home className="h-4 w-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
          <button
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
          </button>
          </p>
        </div>
        </div>
    </div>
  );
};

export default Signup;
