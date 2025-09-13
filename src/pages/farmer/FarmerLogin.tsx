import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { User, Lock, ArrowRight, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { ApiService } from '../../lib/apiService';
const apiService = new ApiService();
import { useToast } from '../../components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

const FarmerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@nareshwadi.in',
      password: 'farmer',
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await apiService.getCurrentUser();
      if (data?.user) {
        navigate('/farmer/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (formData: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(formData.email, formData.password);
      
      if (response.error || !response.data) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: response.error || 'Invalid email or password',
        });
        return;
      }
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to your farmer dashboard!',
      });
      
      // Refresh the page to ensure all auth state is properly set
      window.location.href = '/farmer/dashboard';
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email address',
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await apiService.resetPassword(resetEmail);
      if (error) {
        throw error;
      }
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for instructions to reset your password.',
      });
      setShowPasswordReset(false);
      setResetEmail('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to send password reset email',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToCustomerPortal = () => {
    navigate('/');
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    disabled={isResetting}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handlePasswordReset}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowPasswordReset(false)}
              className="text-sm text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Farmer Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your farmer account
          </p>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                    onClick={() => setShowPasswordReset(true)}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/farmer/signup" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FarmerLogin;