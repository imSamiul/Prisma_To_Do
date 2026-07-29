import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuPortal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative', className)}
    {...props}
  />
));

export { DropdownMenuPortal };