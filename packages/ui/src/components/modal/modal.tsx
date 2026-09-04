'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import { IconButton } from '../button';

const Modal = Dialog.Root;
const ModalTrigger = Dialog.Trigger;
const ModalClose = Dialog.Close;
const ModalPortal = Dialog.Portal;

const ModalOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

const ModalContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-[400] w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
        'rounded-[var(--chronivs-radius-xl)] border border-[var(--chronivs-border-default)]',
        'bg-[var(--chronivs-bg-secondary)] p-6 shadow-[var(--chronivs-shadow-lg)]',
        className,
      )}
      {...props}
    >
      {children}
      <Dialog.Close asChild>
        <IconButton className="absolute top-4 right-4" aria-label="Close">
          ×
        </IconButton>
      </Dialog.Close>
    </Dialog.Content>
  </ModalPortal>
));
ModalContent.displayName = 'ModalContent';

const ModalHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
);

const ModalTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn('chronivs-text-subheading text-[var(--chronivs-fg-primary)]', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn('text-[length:var(--chronivs-text-body-sm)] text-[var(--chronivs-fg-secondary)]', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
};
