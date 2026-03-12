import "@/client/styles/globals.css";
import "@/client/styles/optimizations.css";

import { type Metadata, type Viewport } from "next";
import { Geist, Inter, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/client/components/ui/sonner";
import { cn } from "@/client/lib/utils";
import { ThemeProvider } from "@/client/components/ThemeProvider";

export const metadata: Metadata = {
  title: "GitAid - AI-Powered Git Management",
  description:
    "Intelligent GitHub repository manager with AI-powered commit analysis and semantic search capabilities",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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

// Premium display serif — elegant variable font, beautiful at large sizes
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  preload: true,
  axes: ["SOFT", "WONK", "opsz"],
  weight: "variable",           // required when axes are specified
  style: ["normal", "italic"],
  fallback: ["Georgia", "serif"],
});

// Refined humanist sans — clean, modern, premium feel
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["system-ui", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(geist.variable, inter.variable, fraunces.variable, jakartaSans.variable)}
        suppressHydrationWarning
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body
          className={cn(
            geist.className,
            "antialiased min-h-screen bg-black text-white"
          )}
          suppressHydrationWarning
        >
          {/*
           * ThemeProvider now uses next-themes internally.
           * It injects a tiny blocking <script> before first paint —
           * no mounted/useEffect double-render penalty.
           *
           * TRPCReactProvider has been moved to (protected)/layout.tsx
           * so auth pages (sign-in, sign-up) never pay that cost.
           */}
          <ThemeProvider>
            {children}
            <Toaster theme="dark" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
