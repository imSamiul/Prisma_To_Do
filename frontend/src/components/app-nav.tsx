'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo } from 'lucide-react';

export function AppNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-hunter-green-500/10 bg-vanilla-cream-900/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-hunter-green-100">
          <span className="grid size-9 place-items-center rounded-xl bg-hunter-green-500 text-vanilla-cream-900 shadow-sm">
            <ListTodo className="size-5" />
          </span>
          Leaflist
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="rounded-md px-2 py-1.5 text-sm font-semibold text-hunter-green-400 transition-colors hover:bg-sage-green-900 hover:text-hunter-green-100">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-hunter-green-500 px-3 py-2 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition-colors hover:bg-hunter-green-400">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
