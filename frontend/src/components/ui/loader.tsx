import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({
  className,
  label = 'Loading...',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-muted-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[12rem] w-full items-center justify-center">
      <Loader label={label} />
    </div>
  );
}
