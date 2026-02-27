import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-card text-white border border-border',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
