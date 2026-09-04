'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/cn';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[700] rounded-[var(--chronivs-radius-md)] border border-[var(--chronivs-border-default)]',
        'bg-[var(--chronivs-bg-secondary)] px-3 py-1.5',
        'text-[length:var(--chronivs-text-caption)] text-[var(--chronivs-fg-primary)]',
        'shadow-[var(--chronivs-shadow-sm)]',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
