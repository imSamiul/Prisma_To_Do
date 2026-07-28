'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from '@/components/ui/loader';
import apiClient from '@/lib/api-client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    apiClient
      .get('/api/auth/me')
      .then(() => router.push('/dashboard'))
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader label="Loading..." />
    </div>
  );
}
