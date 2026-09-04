export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
};

export type ThemeProviderProps = {
  defaultTheme?: ThemeMode;
  storageKey?: string;
};
