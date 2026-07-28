'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuRootRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1', className)}
    {...props}
  />
));

export { DropdownMenuRootRadioGroup };