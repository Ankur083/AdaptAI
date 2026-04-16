import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
      secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100',
      outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
      ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      danger: 'text-slate-500 hover:bg-red-50 hover:text-red-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-6 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-3.5 text-base rounded-2xl',
      xl: 'px-10 py-4 text-lg rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:pointer-events-none gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
