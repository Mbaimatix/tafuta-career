import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'red' | 'purple' | 'gold' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200': variant === 'default',
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': variant === 'green',
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': variant === 'red',
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': variant === 'purple',
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': variant === 'gold',
          'border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
