import { ClerkProvider } from '@clerk/nextjs';

/**
 * (auth) Route Group Layout
 *
 * Intentionally minimal — auth pages (sign-in, sign-up) do not need:
 * - TRPCReactProvider / QueryClient
 * - AppSidebar or any dashboard shell
 * - ThemeProvider (inherited from root layout)
 *
 * ClerkProvider is required here because sign-in/sign-up are Clerk components.
 * Note: root layout already wraps everything in ClerkProvider, so this is
 * inherited automatically — no need to duplicate it.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
