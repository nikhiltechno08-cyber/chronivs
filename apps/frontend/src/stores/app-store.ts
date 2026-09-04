import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type AppState = {
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      isHydrated: false,
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    { name: 'chronivs-app' },
  ),
);
