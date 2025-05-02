import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AtSign, 
  Lock, 
  User, 
  ArrowLeft, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('signin');
  
  // Form states
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  // Form submission states
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the redirect path from state or default to home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinEmail || !signinPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSigningIn(true);
      console.log("AUTH PAGE: Attempting to sign in with email:", signinEmail);
      
      const response = await fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify({
          email: signinEmail,
          password: signinPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const data = await response.json();
      console.log("AUTH PAGE: Sign-in response received:", data);
      console.log("AUTH PAGE: Token in response:", !!data.token);
      console.log("AUTH PAGE: User info in response:", data.user);
      
      // Use auth context to log in
      if (data.message === "Login successful.") {
        // Try multiple paths where the name might be in the response
        let userName = null;
        
        // Try all possible locations where the name might be in the response
        if (data.user?.name) {
          userName = data.user.name;
          console.log("AUTH PAGE: Found name in data.user.name:", userName);
        } else if (data.name) {
          userName = data.name;
          console.log("AUTH PAGE: Found name in data.name:", userName);
        } else if (data.user?.fullName) {
          userName = data.user.fullName;
          console.log("AUTH PAGE: Found name in data.user.fullName:", userName);
        } else if (data.userData?.name) {
          userName = data.userData.name;
          console.log("AUTH PAGE: Found name in data.userData.name:", userName);
        } else {
          // If we can't find the name, try to get it from localStorage (saved during signup)
          userName = localStorage.getItem('userName');
          if (userName) {
            console.log("AUTH PAGE: Using name from localStorage:", userName);
          } else {
            // Last resort: extract from email
            userName = signinEmail.split('@')[0]
              .replace(/[.\-_]/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            console.log("AUTH PAGE: Derived name from email:", userName);
          }
        }
        
        login(signinEmail, userName); // Pass both email and name to the login function
        console.log("AUTH PAGE: Login successful with email:", signinEmail);
        
        toast({
          title: "Success!",
          description: "You've successfully signed in."
        });
        
        // Get the redirect path from state or default to home
        const from = location.state?.from?.pathname || '/';
        console.log("AUTH PAGE: Will navigate to:", from);
        
        // Add a short delay before navigation
        setTimeout(() => {
          console.log("AUTH PAGE: Now navigating to:", from);
          navigate(from, { replace: true });
        }, 300);
      } else {
        console.error("AUTH PAGE: Unexpected server response");
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Determine if it's a network error or API error
      let errorMessage = "Please check your credentials and try again.";
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Unable to connect to the authentication server. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSigningUp(true);
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      console.log("AUTH PAGE: Sign-up response received:", data);
      
      // Log detailed information about what's in the response
      console.log("AUTH PAGE: User data in sign-up response:", data.user || 'No user field');
      
      // Get the name from the API response if available, otherwise use the name from the form
      let userName = signupName;
      
      // Check if the API response includes the user's name in any format
      if (data.user && data.user.name) {
        userName = data.user.name;
        console.log("AUTH PAGE: Using name from API response:", userName);
      } else if (data.name) {
        userName = data.name;
        console.log("AUTH PAGE: Using name from API data.name:", userName);
      }
      
      // Store user name in localStorage so it's available after they sign in
      localStorage.setItem('userName', userName);
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created."
      });
      setActiveTab('signin');
      
      // Pre-fill the signin email field to make it easier for the user
      setSigninEmail(signupEmail);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Determine if it's a network error or API error
      let errorMessage = "Please try again later.";
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Unable to connect to the registration server. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSigningUp(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Welcome to Cybergen
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your AI-powered enterprise solution
            </p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {activeTab === 'signin' ? 'Sign in to your account' : 'Create an account'}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'signin' 
                  ? 'Enter your credentials below to access your account' 
                  : 'Fill in the form below to create your new account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="name@example.com"
                          value={signinEmail}
                          onChange={(e) => setSigninEmail(e.target.value)}
                          className="pl-10"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <p className="text-xs text-primary hover:underline">
                          Forgot password?
                        </p>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={signinPassword}
                          onChange={(e) => setSigninPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cybergen-primary hover:bg-cybergen-secondary"
                      disabled={isSigningIn}
                    >
                      {isSigningIn ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <LogIn className="mr-2 h-4 w-4" /> Sign In
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-10"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cybergen-primary hover:bg-cybergen-secondary"
                      disabled={isSigningUp}
                    >
                      {isSigningUp ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              {/* No content here, just keeping the footer for spacing */}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthPage; 