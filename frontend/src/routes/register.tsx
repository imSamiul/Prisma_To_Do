import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Leaf, Loader2, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { getErrorMessage } from '@/lib/get-error-message';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

interface RegisterResponse {
  message: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post<RegisterResponse>('/api/auth/register', {
        email,
        password,
      });

      // Redirect to login after successful registration
      await navigate({ to: '/login' });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-hunter-green-500/10 bg-vanilla-cream-900 shadow-xl shadow-hunter-green-100/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-sage-green-900 p-10 text-hunter-green-100 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-hunter-green-500 text-yellow-green-500"><Sparkles className="size-6" /></span>
            <p className="mt-10 text-sm font-bold uppercase tracking-[0.2em] text-sage-green-400">A fresh start</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold leading-tight">Turn intentions into a kinder plan.</h1>
          </div>
          <p className="text-sm leading-6 text-hunter-green-400">Create a list, focus on today, and let the rest wait until it matters.</p>
        </section>
        <section className="w-full p-7 sm:p-10">
          <div className="lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-hunter-green-500 text-vanilla-cream-900"><Leaf className="size-5" /></span></div>
          <div className="mt-6 lg:mt-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage-green-400">Get started</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-hunter-green-100">Create your account</h2>
            <p className="mt-2 text-sm text-hunter-green-400">Your lists are ready when you are.</p>
          </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-7 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-hunter-green-400">
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
