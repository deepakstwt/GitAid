'use client';

import React, { useState } from 'react';
import { Menu, GitBranch } from 'lucide-react';
import { AppSidebar } from './dashboard/app-sidebar';
import { TRPCReactProvider } from '@/client/trpc/react';

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TRPCReactProvider>
      <div className="flex h-screen overflow-hidden premium-bg relative">
        <div className="app-grain" />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
          {/* Mobile top bar — only visible below lg */}
          <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/5 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                <GitBranch className="w-3.5 h-3.5 text-[#08080c]" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">GitAid</span>
            </div>
          </div>

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