import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Chrome, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (error) throw error;
        toast.success('Account created successfully! Please check your email to verify.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Signed in successfully!');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success('Password reset email sent! Please check your inbox.');
        setMode('signin');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Join EduPlay';
      case 'forgot': return 'Reset Password';
      default: return 'Welcome';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Email';
      default: return 'Submit';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EduPlay Market</h1>
              <p className="text-sm text-muted-foreground">Learn investing with virtual coins!</p>
            </div>
          </div>
          
          {mode === 'forgot' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('signin')}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          )}
          
          <CardTitle className="text-2xl text-foreground">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-background text-foreground"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background text-foreground"
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background text-foreground"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {getButtonText()}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;