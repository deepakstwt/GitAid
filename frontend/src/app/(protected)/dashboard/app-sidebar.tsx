'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Terminal,
  Plus,
  GitBranch,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useProject from '@/hooks/use-project';
import { api } from "@/trpc/react";
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  { label: 'Open Source', href: '/opensource', icon: Sparkles },
  { label: 'Q&A', href: '/qa', icon: Terminal },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, projectId, setProjectId } = useProject();
  const utils = api.useUtils();

  // Auto-select the only project if nothing is selected yet
  useEffect(() => {
    if (projects?.length === 1 && !projectId && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  const handleProjectSelect = (id: string) => {
    setProjectId(id);
  };

  const deleteProject = api.project.deleteProject.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Project deleted successfully");
      utils.project.getProjects.invalidate();
      if (projectId === variables.projectId) {
        setProjectId("");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    }
  });

  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteProject = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setProjectToDelete({ id, name });
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#08080c]/80 backdrop-blur-2xl border-r border-white/5 overflow-y-auto z-40">

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-7 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-[#08080c]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            GitAid
          </span>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-1">
        {/* Main links */}
        <p className="px-4 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] opacity-50">
          Navigation
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-white/5 text-white'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-colors duration-200', active ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-300')} />
              {label}
            </Link>
          );
        })}

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
                  <li key={project.id} className="px-2 relative group/item">
                    <button
                      onClick={() => handleProjectSelect(project.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left group relative',
                        selected
                          ? 'bg-white/5 text-white'
                          : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
                      )}
                    >
                      {selected && <div className="absolute left-[-2px] w-1 h-5 bg-white rounded-full" />}
                      <span
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-transform duration-200',
                          selected
                            ? 'bg-white text-[#08080c]'
                            : 'bg-zinc-900 text-zinc-600 border border-white/5'
                        )}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate font-semibold tracking-tight pr-8">
                        {project.name}
                      </span>
                    </button>
                    {!selected && (
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 z-10"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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

      {/* ── Delete Confirmation Dialog ────────────────────────────────── */}
      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent className="bg-zinc-950 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm sm:max-w-md">
          <DialogHeader className="space-y-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-900/20 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">Delete Project</DialogTitle>
            </div>
            <div className="mt-2 text-sm text-zinc-400 leading-relaxed text-left">
              Are you sure you want to delete <span className="font-bold text-white px-1 py-0.5 bg-white/10 rounded-md shadow-sm border border-white/5">{projectToDelete?.name}</span>?
              <br className="mt-2 block" />
              <span className="text-xs text-rose-400 font-medium">This action cannot be undone and will permanently erase all data.</span>
            </div>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              className="bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all rounded-xl h-10 px-5 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (projectToDelete) {
                  deleteProject.mutate({ projectId: projectToDelete.id });
                  setProjectToDelete(null);
                }
              }}
              disabled={deleteProject.isPending}
              className="bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-950/20 hover:from-rose-400 hover:to-red-500 transition-all font-bold rounded-xl border border-rose-500/20 h-10 px-6"
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>

  );
}

export default AppSidebar;