import React from 'react';
import { AppSidebar } from './dashboard/app-sidebar';
import { TRPCReactProvider } from '@/client/trpc/react';

type Props = {
  children: React.ReactNode;
};

/**
 * Protected-route shell.
 *
 * TRPCReactProvider lives here (not in root layout) so that:
 * - Auth pages (sign-in, sign-up) never initialize QueryClient
 * - The dashboard, Q&A, projects, create pages all have full tRPC access
 *
 * Structure:
 *   <TRPCReactProvider>
 *     <div flex>
 *       <AppSidebar sticky w-64 />
 *       <main flex-1>
 *         {children}
 *       </main>
 *     </div>
 *   </TRPCReactProvider>
 */
const SidebarLayout = ({ children }: Props) => {
  return (
    <TRPCReactProvider>
      <div className="flex h-screen overflow-hidden premium-bg relative">
        {/* Texture & Grain */}
        <div className="app-grain" />

        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
          {/* Page content */}
          <div className="flex-1 container mx-auto max-w-7xl animate-in-up">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                  <div className="w-10 h-10 rounded-full border-4 border-white/5 border-t-emerald-500 animate-spin" />
                </div>
              }
            >
              {children}
            </React.Suspense>
          </div>
        </main>
      </div>
    </TRPCReactProvider>
  );
};

export default SidebarLayout;