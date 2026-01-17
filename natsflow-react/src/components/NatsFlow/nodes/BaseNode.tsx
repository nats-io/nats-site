import React from 'react';
import { cn } from '../lib/utils';

interface BaseNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const BaseNode = React.forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, selected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border-2 bg-white px-4 py-3 shadow-md transition-all',
          'hover:shadow-lg',
          selected ? 'border-blue-500 shadow-lg' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseNode.displayName = 'BaseNode';
