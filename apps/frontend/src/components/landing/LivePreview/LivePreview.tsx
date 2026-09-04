'use client';

import { useEffect, useRef, memo } from 'react';

import { PREVIEW_DEVICES } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { DeviceMockup } from '@/components/landing/shared/DeviceMockup';
import { ScrollReveal } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';
import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

function PreviewDevice({
  device,
  index,
}: {
  device: (typeof PREVIEW_DEVICES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let t = index * 2;
    let frameId = 0;

    const loop = () => {
      t += 0.01;
      const fy = Math.sin(t) * 10;
      const rz = Math.sin(t * 0.7) * 1.5;
      el.style.transform = `translateY(${fy}px) rotateZ(${rz}deg)`;
      frameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frameId);
  }, [index, prefersReducedMotion]);

  return (
    <DeviceMockup
      ref={ref}
      label={device.label}
      title={device.title}
      lines={device.lines}
      depth={device.depth}
      variant={device.variant}
      className="landing-pv-device"
    />
  );
}

function LivePreviewComponent() {
  return (
    <section id="preview" aria-label="Live preview" className="landing-preview">
      <Container>
        <ScrollReveal>
          <SectionHead
            eyebrow="Every screen, considered"
            title="See It Before You Share It"
            description="Every experience is fully responsive. Beautiful on every screen."
            centered
            className="landing-preview-head"
          />
        </ScrollReveal>

        <div className="landing-preview-stage">
          {PREVIEW_DEVICES.map((device, i) => (
            <PreviewDevice key={device.variant} device={device} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export const LivePreview = memo(LivePreviewComponent);
