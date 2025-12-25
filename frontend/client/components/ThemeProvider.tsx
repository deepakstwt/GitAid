'use client';

import { useEffect, useState } from 'react';

/**
 * ThemeProvider to prevent FOUC (Flash of Unstyled Content) and dark mode flicker
 * Ensures dark theme is applied immediately before hydration
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply dark theme immediately to prevent flicker
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#FFFFFF';
    setMounted(true);
  }, []);

  // Prevent layout shift during mount
  if (!mounted) {
    return (
      <div style={{ 
        backgroundColor: '#000000', 
        color: '#FFFFFF',
        minHeight: '100vh',
        width: '100%'
      }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

