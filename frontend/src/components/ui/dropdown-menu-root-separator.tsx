'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuRootSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));

export { DropdownMenuRootSeparator };