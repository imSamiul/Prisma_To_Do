import { Suspense } from 'react';
import { Leaf } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <SidebarInset className="bg-transparent">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-hunter-green-500/10 bg-vanilla-cream-900/75 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1 text-hunter-green-400" />
          <Separator
            orientation="vertical"
            className="mr-1 h-5 bg-sage-green-800"
          />
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-yellow-green-500 text-hunter-green-200">
              <Leaf className="size-4" />
            </span>
            <span className="text-sm font-bold text-hunter-green-200">
              Your day, clearly organised
            </span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
