import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useLanguage } from '../utils/language-context';

interface AuthFormProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  embedded?: boolean;
}

export function AuthForm({ onLogin, onSignup, onResetPassword, embedded = false }: AuthFormProps) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        await onResetPassword(email);
        setSuccess(t('resetEmailSent'));
        setEmail('');
      } else if (isLogin) {
        await onLogin(email, password, rememberMe);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        await onSignup(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && !isForgotPassword && (
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin && !isForgotPassword}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {!isForgotPassword && (
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('loading') : (isLogin ? t('login') : t('signup'))}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {isLogin 
              ? t('dontHaveAccount') + '? ' + t('signupHere')
              : t('alreadyHaveAccount') + '? ' + t('login')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {!isForgotPassword && (
          <div className="text-center space-y-2">
            <h1 className="text-3xl">🎨 Design Ideas</h1>
            <p className="text-muted-foreground">
              Din kreative idébank med sosiale funksjoner
            </p>
          </div>
        )}
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {isForgotPassword ? 'Reset Password' : (isLogin ? 'Login' : 'Sign Up')}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? 'Enter your email to receive a password reset link'
                : (isLogin 
                  ? 'Logg inn for å administrere dine designideer, del dem med andre, og finn inspirasjon' 
                  : 'Opprett en konto for å lagre ideer, dele dem med fellesskapet, og samarbeide med andre kreative')}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin && !isForgotPassword}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (
                isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Login' : 'Sign Up')
              )}
            </Button>

            <div className="text-center space-y-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Back to login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Login'}
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
