import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-line bg-panel shadow-panel rounded-[24px] border backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}
