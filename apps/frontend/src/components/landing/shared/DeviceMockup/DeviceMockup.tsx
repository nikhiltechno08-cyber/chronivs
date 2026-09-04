'use client';

import { forwardRef, type CSSProperties } from 'react';

export type DeviceVariant =
  | 'device-laptop'
  | 'device-tablet'
  | 'device-phone'
  | 'pv-laptop'
  | 'pv-tablet'
  | 'pv-phone';

type DeviceMockupProps = {
  label: string;
  title: string;
  lines: readonly [number, number] | readonly number[];
  variant: DeviceVariant;
  depth?: number;
  className?: string;
  style?: CSSProperties;
};

const variantClassMap: Record<DeviceVariant, string> = {
  'device-laptop': 'landing-device-laptop',
  'device-tablet': 'landing-device-tablet',
  'device-phone': 'landing-device-phone',
  'pv-laptop': 'landing-pv-laptop',
  'pv-tablet': 'landing-pv-tablet',
  'pv-phone': 'landing-pv-phone',
};

export const DeviceMockup = forwardRef<HTMLDivElement, DeviceMockupProps>(
  function DeviceMockup({ label, title, lines, variant, depth, className = '', style }, ref) {
    return (
      <div
        ref={ref}
        data-depth={depth}
        className={`landing-device ${variantClassMap[variant]} ${className}`.trim()}
        style={style}
      >
        <div className="landing-screen">
          <div className="landing-sc-topbar">
            <div className="landing-sc-label">{label}</div>
            <div className="landing-sc-title">{title}</div>
          </div>
          <div className="landing-sc-body">
            <div className="landing-sc-glow" aria-hidden="true" />
            <div className="landing-sc-lines" aria-hidden="true">
              {lines.map((width, i) => (
                <i key={i} style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
