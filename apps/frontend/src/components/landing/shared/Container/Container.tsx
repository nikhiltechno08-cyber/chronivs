import { type ReactNode } from 'react';

import { cn } from '@chronivs/ui';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
  id?: string;
};

export function Container({ children, className, as: Tag = 'div', id }: ContainerProps) {
  return (
    <Tag id={id} className={cn('landing-wrap', className)}>
      {children}
    </Tag>
  );
}
