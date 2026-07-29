import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppNav } from '@/components/app-nav';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <AppNav />
      <Outlet />
    </>
  );
}
