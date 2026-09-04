import { cn } from '@chronivs/ui';

type EyebrowProps = {
  children: string;
  centered?: boolean;
  className?: string;
};

export function Eyebrow({ children, centered, className }: EyebrowProps) {
  return (
    <div className={cn('landing-eyebrow', centered && 'is-centered', className)}>
      {children}
    </div>
  );
}
