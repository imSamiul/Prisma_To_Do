'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 shadow-lg',
      className,
    )}
    {...props}
  />
));

export { DropdownMenuSubContent };