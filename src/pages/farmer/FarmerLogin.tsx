import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { User, Lock, ArrowRight, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { ApiService } from '../../lib/apiService';
import { supabase } from '../../lib/supabase';
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
      email: '',
      password: '',
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await apiService.getCurrentUser();
        if (data?.user) {
          // Determine redirect path based on role
          const userRole = data.user.user_metadata?.role || 'farmer';
          const redirectPath = userRole === 'admin' 
            ? '/admin/dashboard' 
            : '/farmer/dashboard';
          
          // Use replace to prevent going back to login page
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Clear any invalid session data
        await apiService.logout();
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('Auth state changed:', event);
        
        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          // Clear any cached data on sign out
          // Add any additional cleanup needed
          console.log('User signed out');
          return;
        }
        
        // Handle other auth events
        switch (event) {
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
          case 'SIGNED_IN':
            console.log('User signed in');
            break;
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery requested');
            break;
          default:
            console.log('Unhandled auth event:', event);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (formData: LoginFormData) => {
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: formData.email.trim(),
        password: formData.password // Don't trim passwords as spaces might be valid
      };
      
      const response = await apiService.login(sanitizedData.email, sanitizedData.password);
      
      if (!response || response.error || !response.data) {
        const errorMessage = response?.error || 'Invalid email or password';
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      // Update user metadata with role if not set
      if (!response.data.user.user_metadata?.role) {
        await apiService.updateUserMetadata({ 
          role: 'farmer',
          last_login: new Date().toISOString()
        });
      }
      
      // Determine redirect path based on role
      const userRole = response.data.user.user_metadata?.role || 'farmer';
      const redirectPath = userRole === 'admin' 
        ? '/admin/dashboard' 
        : '/farmer/dashboard';
      
      toast({
        title: 'Login Successful',
        description: `Welcome ${response.data.profile?.name || userRole}!`,
      });
      
      // Use window.location.href for full page reload to ensure all auth state is properly set
      window.location.href = redirectPath;
      
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
    const email = resetEmail.trim();
    
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email address',
      });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsResetting(true);
    
    try {
      // First check if email exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email_confirmed_at')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        // Don't reveal if email exists for security
        toast({
          title: 'If your email exists in our system, you will receive a password reset link.',
          description: 'Please check your inbox and spam folder.',
        });
        setShowPasswordReset(false);
        setResetEmail('');
        return;
      }

      // If email exists but not confirmed
      if (!userData.email_confirmed_at) {
        toast({
          variant: 'destructive',
          title: 'Email Not Verified',
          description: 'Please verify your email before resetting your password.',
        });
        return;
      }

      // If we get here, email exists and is verified
      const { error } = await apiService.resetPassword(email);
      
      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for instructions to reset your password. The link will expire in 1 hour.',
      });
      
      setShowPasswordReset(false);
      setResetEmail('');
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Don't show specific error messages that might help attackers
      toast({
        title: 'Password Reset',
        description: 'If your email exists in our system, you will receive a password reset link. Please check your inbox and spam folder.',
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