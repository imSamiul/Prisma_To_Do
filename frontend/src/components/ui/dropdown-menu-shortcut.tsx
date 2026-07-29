import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-70', className)}
      {...props}
    />
  );
};

export { DropdownMenuShortcut };