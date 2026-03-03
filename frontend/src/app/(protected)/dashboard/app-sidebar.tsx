'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  Plus,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useProject from '@/hooks/use-project';
import { api } from "@/trpc/react";
import dynamic from 'next/dynamic';

// Lazy-load UserButton to avoid SSR hydration issues
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((m) => ({ default: m.UserButton })),
  {
    ssr: false,
    loading: () => (
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
    ),
  }
);

// ─── Nav links ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Q&A', href: '/qa', icon: Bot },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, projectId, setProjectId } = useProject();

  // Auto-select the only project if nothing is selected yet
  useEffect(() => {
    if (projects?.length === 1 && !projectId && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  const handleProjectSelect = (id: string) => {
    setProjectId(id);
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-zinc-950/40 backdrop-blur-xl border-r border-white/5 overflow-y-auto z-40">

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-900/20">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight text-glow">
            GitAid
          </span>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-1">
        {/* Main links */}
        <p className="px-4 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
          Navigation
        </p>
        {(() => {
          const utils = api.useUtils();
          return NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onMouseEnter={() => {
                  if (href === '/qa' && projectId) {
                    utils.project.getQuestions.prefetch({ projectId });
                  }
                }}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                {active && <div className="sidebar-active-pill" />}
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors duration-200', active ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                {label}
              </Link>
            );
          });
        })()}

        {/* Projects */}
        <div className="pt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Projects
            </p>
            <Link
              href="/create"
              className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-all border border-white/5"
              title="New project"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Loading */}
          {projects === undefined && (
            <div className="space-y-2 px-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {projects?.length === 0 && (
            <div className="px-4 py-6 text-center premium-glass rounded-2xl mx-2 border-dashed border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3">No projects yet</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create one
              </Link>
            </div>
          )}

          {/* Project list */}
          {projects && projects.length > 0 && (
            <ul className="space-y-1">
              {projects.map((project: any) => {
                const selected = project.id === projectId;
                return (
                  <li key={project.id} className="px-2">
                    <button
                      onClick={() => handleProjectSelect(project.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left group relative',
                        selected
                          ? 'bg-white/10 text-white border border-white/5'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {selected && <div className="absolute left-[-8px] w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_hsla(140,100%,50%,0.5)]" />}
                      <span
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-transform duration-200 group-hover:scale-105',
                          selected
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/20'
                            : 'bg-zinc-900 text-zinc-400 border border-white/5'
                        )}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate font-semibold tracking-tight">
                        {project.name}
                      </span>
                      {selected && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_hsla(140,100%,50%,0.8)]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* ── Footer: user ──────────────────────────────────────────────── */}
      <div className="px-4 py-6 mt-auto border-t border-white/5 bg-zinc-950/20">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 rounded-xl border border-white/10 shadow-lg',
              },
            }}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">Account</p>
            <p className="text-[10px] text-zinc-500 truncate font-medium">Manage profile</p>
          </div>
        </div>
      </div>

    </aside>

  );
}

export default AppSidebar;