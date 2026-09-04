'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import { IconButton } from '../button';

const Drawer = Dialog.Root;
const DrawerTrigger = Dialog.Trigger;
const DrawerClose = Dialog.Close;

const DrawerOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm', className)}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

type DrawerContentProps = ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: 'left' | 'right';
};

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, side = 'right', ...props }, ref) => (
    <Dialog.Portal>
      <DrawerOverlay />
      <Dialog.Content
        ref={ref}
        className={cn(
          'fixed top-0 z-[400] flex h-full w-full max-w-sm flex-col',
          'border-[var(--chronivs-border-default)] bg-[var(--chronivs-bg-secondary)] p-6 shadow-[var(--chronivs-shadow-lg)]',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close asChild>
          <IconButton className="absolute top-4 right-4" aria-label="Close drawer">
            ×
          </IconButton>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  ),
);
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-6', className)} {...props} />
);

const DrawerTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn('chronivs-text-subheading text-[var(--chronivs-fg-primary)]', className)}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle };
