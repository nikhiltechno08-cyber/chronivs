import { forwardRef, type SVGAttributes } from 'react';

import { cn } from '../../lib/cn';
import { iconSize, iconStroke, type IconSizeToken } from '../../tokens/icons';

export type IconProps = SVGAttributes<SVGSVGElement> & {
  size?: keyof IconSizeToken;
  strokeWidth?: number;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size = 'md', strokeWidth = iconStroke.default, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize[size]}
      height={iconSize[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      {...props}
    />
  ),
);
Icon.displayName = 'Icon';
