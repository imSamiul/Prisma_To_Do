import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CheckCircle2, Leaf, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { getErrorMessage } from '@/lib/get-error-message';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

interface LoginResponse {
  message: string;
  user: { id: string; email: string };
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });
      await navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'Login failed. Please check your credentials.'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-hunter-green-500/10 bg-vanilla-cream-900 shadow-xl shadow-hunter-green-100/10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-hunter-green-500 p-10 text-vanilla-cream-900 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-yellow-green-500 text-hunter-green-200"><Leaf className="size-6" /></span>
            <p className="mt-10 text-sm font-bold uppercase tracking-[0.2em] text-yellow-green-500">Leaflist</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold leading-tight">Make room for what matters today.</h1>
          </div>
          <ul className="space-y-3 text-sm text-vanilla-cream-700">
            {['Keep every task in one calm place', 'Make My Day feel intentional', 'Move tasks between lists anytime'].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-yellow-green-500" />{item}</li>)}
          </ul>
        </section>
        <section className="w-full p-7 sm:p-10">
          <div className="lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-hunter-green-500 text-vanilla-cream-900"><Leaf className="size-5" /></span></div>
          <div className="mt-6 lg:mt-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage-green-400">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-hunter-green-100">Sign in to Leaflist</h2>
            <p className="mt-2 text-sm text-hunter-green-400">Pick up exactly where you left off.</p>
          </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-7 space-y-6">
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
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-hunter-green-400">
          Don't have an account?{' '}
          <Link to="/register" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
