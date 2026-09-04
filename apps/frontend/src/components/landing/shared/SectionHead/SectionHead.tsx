import { cn } from '@chronivs/ui';

import { Eyebrow } from '../Eyebrow';

type SectionHeadProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
  titleId?: string;
};

export function SectionHead({ eyebrow, title, description, centered, className, titleId }: SectionHeadProps) {
  return (
    <div className={cn('landing-section-head', centered && 'is-centered', className)}>
      <Eyebrow centered={centered}>{eyebrow}</Eyebrow>
      <h2 id={titleId}>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
