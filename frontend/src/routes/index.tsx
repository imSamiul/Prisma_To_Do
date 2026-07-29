import { createFileRoute, redirect } from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/loader';
import apiClient from '@/lib/api-client';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const isAuthenticated = await apiClient
      .get('/api/auth/me')
      .then(() => true)
      .catch(() => false);

    throw redirect({ to: isAuthenticated ? '/dashboard' : '/login' });
  },
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader label="Loading..." />
    </div>
  ),
});
