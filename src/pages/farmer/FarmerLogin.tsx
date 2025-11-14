import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const FarmerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@nareshwadi.in');
  const [password, setPassword] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation for demo purposes
    if (email === 'test@nareshwadi.in' && password === 'farmer') {
      // In a real app, you'd authenticate with Supabase here
      localStorage.setItem('farmerLoggedIn', 'true');
      navigate('/farmer/dashboard');
    } else {
      setError('Invalid credentials. Please use test@nareshwadi.in / farmer');
    }
    
    setLoading(false);
  };

  const handleBackToCustomerPortal = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-800">Farmer Login</CardTitle>
          <CardDescription className="text-orange-600">
            Access your farmer dashboard to manage orders and products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-700">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="test@nareshwadi.in"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="farmer"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Demo Credentials:</strong><br />
              Email: test@nareshwadi.in<br />
              Password: farmer
            </p>
          </div>

          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleBackToCustomerPortal}
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerLogin; 