import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { verifyEmailCode, resendOtp, login as apiLogin, signup as apiSignup, setToken, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false); // Track if verification is for new signup

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'newpassword'>('email');
  const [forgotPasswordCode, setForgotPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!loginForm.email) newErrors.loginEmail = 'Email is required';
    if (!loginForm.password) newErrors.loginPassword = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    if (!signupForm.name) newErrors.name = 'Name is required';
    if (!signupForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) newErrors.email = 'Invalid email format';
    if (!signupForm.phone) newErrors.phone = 'Phone is required';
    if (!signupForm.password) newErrors.password = 'Password is required';
    else if (signupForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setIsLoading(true);
    try {
      const result = await apiLogin(loginForm.email, loginForm.password);
      setIsLoading(false);
      
      // Check if email is verified
      if (result.user && result.user.emailVerified === false) {
        setVerificationEmail(loginForm.email);
        setVerificationCode('');
        setIsNewSignup(false); // This is login verification, not signup
        setShowVerification(true);
        toast({ title: 'Email not verified', description: 'Please verify your email to continue.' });
        return;
      }
      
      // Email is verified, store user and navigate to dashboard
      setToken(result.token);
      localStorage.setItem('eventify_current_user', JSON.stringify(result.user));
      // Reload to sync AuthContext
      window.location.href = '/dashboard';
    } catch (err: any) {
      setIsLoading(false);
      // Check if error is about unverified email
      if (err.message.includes('not verified') || err.message.includes('EMAIL_NOT_VERIFIED')) {
        setVerificationEmail(loginForm.email);
        setVerificationCode('');
        setIsNewSignup(false);
        setShowVerification(true);
        toast({ title: 'Email not verified', description: 'Please verify your email to continue.' });
        return;
      }
      toast({ title: 'Login failed', description: err.message || 'Invalid credentials', variant: 'destructive' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    
    setIsLoading(true);
    try {
      const result = await apiSignup(
        signupForm.name,
        signupForm.email,
        signupForm.phone,
        signupForm.password
      );
      setIsLoading(false);
      
      // Show verification form - account will be created only after OTP is verified
      setVerificationEmail(signupForm.email);
      setVerificationCode('');
      setIsNewSignup(true); // Mark this as a new signup verification
      setShowVerification(true);
      toast({ title: 'Check your email', description: 'We sent a verification code to your email address.' });
    } catch (err: any) {
      setIsLoading(false);
      toast({ title: 'Signup failed', description: err.message || 'Please try again', variant: 'destructive' });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast({ title: 'Enter code', description: 'Please enter the verification code', variant: 'destructive' });
      return;
    }
    
    setIsVerifying(true);
    try {
      // Pass isNewSignup flag to backend - this tells it whether to create user account or just verify existing
      const result = await verifyEmailCode(verificationEmail, verificationCode, isNewSignup);
      toast({ title: 'Email verified!', description: isNewSignup ? 'Account created and verified successfully.' : 'Your email has been verified successfully.' });
      
      // Store user and token
      setToken(result.token);
      localStorage.setItem('eventify_current_user', JSON.stringify(result.user));
      
      setShowVerification(false);
      setVerificationCode('');
      setIsNewSignup(false);
      // Reload to sync AuthContext
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err.message || 'Invalid code', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await resendOtp(verificationEmail);
      toast({ title: 'Code sent', description: 'A new verification code has been sent to your email.' });
    } catch (err: any) {
      toast({ title: 'Failed to resend', description: err.message || 'Could not send OTP', variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPasswordEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({ title: 'Enter email', description: 'Please enter your email address', variant: 'destructive' });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      await apiForgotPassword(forgotPasswordEmail);
      setForgotPasswordStep('otp');
      toast({ title: 'OTP sent', description: 'Check your email for the reset code' });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not send reset code', variant: 'destructive' });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordCode.length !== 6) {
      toast({ title: 'Invalid code', description: 'Please enter a 6-digit code', variant: 'destructive' });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      // Just verify the OTP is valid by attempting reset with temp password
      setForgotPasswordStep('newpassword');
      toast({ title: 'Code verified', description: 'Now enter your new password' });
    } catch (err: any) {
      toast({ title: 'Invalid code', description: err.message || 'The code you entered is invalid', variant: 'destructive' });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast({ title: 'Enter password', description: 'Please enter your new password', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Passwords do not match', description: 'Please check your passwords', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      await apiResetPassword(forgotPasswordEmail, forgotPasswordCode, newPassword);
      toast({ title: 'Success!', description: 'Password reset successfully. Please login with your new password.' });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      setForgotPasswordCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotPasswordStep('email');
      setLoginForm({ email: forgotPasswordEmail, password: '' });
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err.message || 'Could not reset password', variant: 'destructive' });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationCode('');
    setVerificationEmail('');
    setIsNewSignup(false);
  };

  // Show forgot password screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="glass animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {forgotPasswordStep === 'email' && 'Enter your email address'}
                {forgotPasswordStep === 'otp' && 'Enter the code sent to your email'}
                {forgotPasswordStep === 'newpassword' && 'Enter your new password'}
              </CardDescription>
            </CardHeader>

            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleForgotPasswordEmail}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordStep('email');
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-full gradient-primary" disabled={isForgotPasswordLoading}>
                    {isForgotPasswordLoading ? 'Sending...' : 'Send Code'}
                  </Button>
                </CardFooter>
              </form>
            )}

            {forgotPasswordStep === 'otp' && (
              <form onSubmit={handleForgotPasswordOtp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-code">Verification Code</Label>
                    <Input
                      id="forgot-code"
                      placeholder="000000"
                      value={forgotPasswordCode}
                      onChange={(e) => setForgotPasswordCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                    <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code from your email</p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setForgotPasswordStep('email')}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-full gradient-primary" disabled={isForgotPasswordLoading || forgotPasswordCode.length !== 6}>
                    {isForgotPasswordLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </CardFooter>
              </form>
            )}

            {forgotPasswordStep === 'newpassword' && (
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setForgotPasswordStep('otp')}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-full gradient-primary" disabled={isForgotPasswordLoading}>
                    {isForgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Show verification screen
  if (showVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="glass animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We sent a verification code to<br />
                <span className="font-semibold text-foreground">{verificationEmail}</span>
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code from your email</p>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-auto p-2 text-xs"
                    onClick={handleResendOtp}
                    disabled={isResending || isVerifying}
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToSignup}
                  disabled={isVerifying}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="glass animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 gradient-primary rounded-lg">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Eventify</span>
            </div>
            <CardDescription>Manage your events with ease</CardDescription>
          </CardHeader>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-4" style={{ width: 'calc(100% - 2rem)' }}>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className={errors.loginEmail ? 'border-destructive' : ''}
                    />
                    {errors.loginEmail && (
                      <p className="text-sm text-destructive">{errors.loginEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordEmail(loginForm.email);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={errors.loginPassword ? 'border-destructive' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.loginPassword && (
                      <p className="text-sm text-destructive">{errors.loginPassword}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
