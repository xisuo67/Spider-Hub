import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Wrapper(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-lg bg-black/20 p-4 border prose-no-margin',
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
