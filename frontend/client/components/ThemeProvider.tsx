'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * ThemeProvider — delegates to next-themes.
 *
 * next-themes injects a tiny blocking <script> into <head> that reads
 * localStorage and applies the theme class BEFORE first paint, completely
 * eliminating the double-render hydration gate that the previous
 * mounted/useEffect pattern caused.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
