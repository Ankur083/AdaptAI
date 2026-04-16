import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-slate-200 shadow-sm',
      glass: 'bg-white/90 backdrop-blur border border-white/20 shadow-xl',
      dark: 'bg-slate-900 text-white border-none shadow-2xl',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10 sm:p-16',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[32px] transition-all',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
