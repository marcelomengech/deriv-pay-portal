import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, signInWithDeriv, user } = useAuth();

  // Handle Deriv OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const provider = urlParams.get('provider');
    
    if (provider === 'deriv') {
      // Extract Deriv tokens from URL parameters
      const accounts = [];
      let i = 1;
      while (urlParams.get(`acct${i}`)) {
        accounts.push({
          accountId: urlParams.get(`acct${i}`),
          token: urlParams.get(`token${i}`),
          currency: urlParams.get(`cur${i}`)
        });
        i++;
      }
      
      if (accounts.length > 0) {
        // Handle successful Deriv authentication
        handleDerivAuth(accounts);
      }
    }
  }, []);

  const handleDerivAuth = async (accounts: any[]) => {
    try {
      setLoading(true);
      
      // Call edge function to handle Deriv authentication
      const response = await fetch('/functions/v1/deriv-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accounts })
      });
      
      const result = await response.json();
      
      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in with Deriv successfully!",
        });
        const redirectPath = sessionStorage.getItem('derivAuthRedirect') || '/dashboard';
        sessionStorage.removeItem('derivAuthRedirect');
        navigate(redirectPath);
      }
    } catch (error) {
      toast({
        title: "Authentication Error", 
        description: "Failed to authenticate with Deriv",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Basic validation
      if (!formData.email) {
        toast({
          title: "Error",
          description: "Please enter your email",
          variant: "destructive"
        });
        return;
      }

      if (mode === 'forgot-password') {
        const { error } = await resetPassword(formData.email);
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode('login');
        }
        return;
      }

      if (!formData.password) {
        toast({
          title: "Error",
          description: "Please enter your password",
          variant: "destructive"
        });
        return;
      }

      if (mode === 'signup') {
        if (!formData.fullName) {
          toast({
            title: "Error",
            description: "Please enter your full name",
            variant: "destructive"
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error", 
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Account created! Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Welcome back!",
          });
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Deriv Payment Agent</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' ? 'Welcome back' : 'Create your agent account'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 
                  mode === 'login' ? 'Sign In' : 
                  mode === 'signup' ? 'Create Account' : 
                  'Send Reset Link'
                }
              </Button>
              
              {mode === 'login' && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}
              
              {mode === 'login' && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={signInWithDeriv}
                  disabled={loading}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 bg-red-600 rounded text-white flex items-center justify-center text-xs font-bold">
                      D
                    </div>
                    Login with Deriv
                  </div>
                </Button>
              )}
              
              <div className="text-center space-y-2">
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-blue-600 hover:text-blue-700 text-sm block"
                  >
                    Forgot your password?
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {mode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : mode === 'signup'
                    ? "Already have an account? Sign in"
                    : "Back to sign in"
                  }
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;