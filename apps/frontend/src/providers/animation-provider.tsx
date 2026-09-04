'use client';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { LENIS_OPTIONS } from '@/constants/animation';
import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type AnimationContextValue = {
  lenis: Lenis | null;
  gsapReady: boolean;
};

const AnimationContext = createContext<AnimationContextValue>({
  lenis: null,
  gsapReady: false,
});

type AnimationProviderProps = {
  children: ReactNode;
  enableSmoothScroll?: boolean;
};

export function AnimationProvider({
  children,
  enableSmoothScroll = true,
}: AnimationProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [gsapReady, setGsapReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setGsapReady(true);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!enableSmoothScroll || prefersReducedMotion) return;

    const lenis = new Lenis(LENIS_OPTIONS);
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enableSmoothScroll, prefersReducedMotion]);

  return (
    <AnimationContext.Provider value={{ lenis: lenisRef.current, gsapReady }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext(): AnimationContextValue {
  return useContext(AnimationContext);
}
