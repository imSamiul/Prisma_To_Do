import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { DashboardShell } from '@/components/dashboard-shell';
import apiClient from '@/lib/api-client';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const isAuthenticated = await apiClient
      .get('/api/auth/me')
      .then(() => true)
      .catch(() => false);

    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
