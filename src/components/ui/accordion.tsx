'use client';

import * as React from 'react';
// Simple chevron icon component
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
import { cn } from '@/lib/utils';

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props} />
));
Accordion.displayName = 'Accordion';

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg overflow-hidden', className)}
      {...props}
    />
  )
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, isOpen, onToggle, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex w-[100%] items-center justify-between py-4 px-6 text-left font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180',
        className
      )}
      onClick={onToggle}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, isOpen, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isOpen ? 'animate-accordion-down' : 'animate-accordion-up'
      )}
      style={{
        height: isOpen ? 'auto' : '0',
        opacity: isOpen ? 1 : 0,
      }}
      {...props}
    >
      <div className={cn('px-6 pb-6', className)}>{children}</div>
    </div>
  )
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
