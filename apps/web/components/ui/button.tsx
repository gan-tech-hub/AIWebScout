import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-visible:ring-accent/70 inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none transition duration-200 focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3 text-xs' : 'h-11 px-4 text-sm',
        variant === 'primary' &&
          'bg-ink text-canvas hover:shadow-glow shadow-lg hover:-translate-y-0.5',
        variant === 'secondary' &&
          'border-line bg-panel-strong text-ink hover:border-accent/40 hover:bg-panel-hover border',
        variant === 'ghost' && 'text-muted hover:bg-panel-hover hover:text-ink',
        variant === 'danger' &&
          'border border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15',
        className,
      )}
      {...props}
    />
  );
}
