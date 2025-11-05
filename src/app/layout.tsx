import "@/client/styles/globals.css";
import "@/client/styles/optimizations.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/client/components/ui/sonner";
import { cn } from "@/client/lib/utils";
import { TRPCReactProvider } from "@/client/trpc/react";
import { ThemeProvider } from "@/client/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "GitAid - AI-Powered Git Management",
  description: "Intelligent GitHub repository manager with AI-powered commit analysis and semantic search capabilities",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

// Optimize font loading with display swap and preload
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn(geist.variable, inter.variable)} suppressHydrationWarning>
        <head>
          {/* Preload critical resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body 
          className={cn(
            geist.className,
            "antialiased min-h-screen bg-black text-[#E0E0E0]",
            // Prevent FOUC (Flash of Unstyled Content)
            "text-white"
          )} 
          suppressHydrationWarning
          style={{
            // Prevent layout shift during hydration
            visibility: 'inherit',
          }}
        >
          {/* Critical CSS for preventing FOUC */}
          <style dangerouslySetInnerHTML={{
            __html: `
              /* Prevent flash of unstyled content */
              body { background: #000000 !important; color: #FFFFFF !important; }
              html { background: #000000 !important; }
              /* Prevent layout shift */
              * { box-sizing: border-box; }
            `
          }} />
          <ThemeProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster theme="dark" />
          </ThemeProvider>
          {/* Load non-critical scripts after page load */}
          <Script 
            id="performance-init" 
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                // Initialize performance monitoring
                if (typeof window !== 'undefined' && 'performance' in window) {
                  window.addEventListener('load', function() {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    if (pageLoadTime > 3000) {
                      console.warn('Slow page load detected:', pageLoadTime + 'ms');
                    }
                  });
                }
              `
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
