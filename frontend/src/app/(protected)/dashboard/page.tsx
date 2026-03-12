'use client';

import { useUser } from '@clerk/nextjs';
import useProject from "@/hooks/use-project";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

const RepositoryLoader = dynamic(() => import("@/components/repository-loader"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-white/5 rounded w-32" />
      <div className="h-12 bg-white/5 rounded w-full" />
      <div className="h-24 bg-white/5 rounded w-full" />
    </div>
  ),
  ssr: false,
});

const CommitIntelligenceDashboard = dynamic(() => import("@/components/CommitIntelligenceDashboard"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-white/5 rounded w-48" />
      <div className="h-32 bg-white/5 rounded w-full" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

const AICodeAssistantCard = dynamic(
  () => import("@/components/AICodeAssistantCard").then((mod) => ({
    default: mod.AICodeAssistantCard,
  })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/5 rounded w-40" />
        <div className="h-32 bg-white/5 rounded w-full" />
      </div>
    ),
    ssr: false,
  }
);

import {
  RefreshCcw,
  ExternalLink,
  Github,
  Users,
  UserPlus,
  Archive,
  Download,
  Cpu,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
const InviteMemberModal = dynamic(
  () => import("@/components/InviteMemberModal").then((mod) => ({ default: mod.InviteMemberModal })),
  { ssr: false }
);

const ArchiveProjectModal = dynamic(
  () => import("@/components/ArchiveProjectModal").then((mod) => ({ default: mod.ArchiveProjectModal })),
  { ssr: false }
);

const ExportDataModal = dynamic(
  () => import("@/components/ExportDataModal").then((mod) => ({ default: mod.ExportDataModal })),
  { ssr: false }
);
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { DashboardWelcome } from '@/components/DashboardWelcome';

const CommitLog = dynamic(() => import("@/components/CommitLog").then(mod => mod.CommitLog), {
  loading: () => <div className="p-10 space-y-4 animate-pulse"><div className="h-20 bg-white/5 rounded-2xl" /><div className="h-20 bg-white/5 rounded-2xl" /></div>,
  ssr: false
});

const DashboardPage = () => {
  const { user } = useUser();
  const { projects, project, projectId, setProjectId } = useProject();

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const inviteTeamMember = () => {
    setIsInviteModalOpen(true);
  };

  const archiveProject = () => {
    setIsArchiveModalOpen(true);
  };

  const exportData = () => {
    setIsExportModalOpen(true);
  };

  const addTeamMemberMutation = api.project.addTeamMember.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        toast.success("New team member created and added successfully!");
      } else {
        toast.success("Team member added successfully!");
      }
      refetchTeamMembers();
      setIsInviteModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add team member");
    },
  });

  const handleInviteMember = async (data: any) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    await addTeamMemberMutation.mutateAsync({
      projectId,
      email: data.email,
      name: data.name,
      role: data.role,
    });
  };

  const handleArchiveProject = (reason: string) => {
    console.log('Archiving project with reason:', reason);
    // TODO: Implement actual API call
  };

  const exportDataMutation = api.project.exportProjectData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsExportModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start export");
    },
  });

  const handleExportData = (options: any) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    exportDataMutation.mutate({
      projectId,
      format: options.format,
      dateRange: options.dateRange,
      includeData: options.includeData,
    });
  };

  // Fetch real team members from database
  const { data: teamMembers = [], isLoading: teamMembersLoading, refetch: refetchTeamMembers } = api.project.getTeamMembers.useQuery(
    { projectId: projectId || '' },
    { enabled: !!projectId }
  );  // Collapsible section state — all collapsed by default except commits
  // Optimized Tab State
  const [activeTab, setActiveTab] = useState<'activity' | 'ai' | 'team' | 'sync'>('activity');

  if (!project) {
    // Show beautiful welcome screen for first-time users
    if (projects?.length === 0) {
      return <DashboardWelcome userName={user?.firstName || user?.username || undefined} />;
    }

    // Show simple message to select a project
    return (
      <div className="container mx-auto py-8">
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl shadow-sm p-6">
          <div className="py-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">No Project Selected</h3>
                <p className="text-zinc-400">
                  Select a project from the sidebar to view its dashboard and start managing your code
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700">⌘</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700">K</kbd>
                <span className="ml-2">to quick search</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Top project navbar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 h-20 border-b border-white/5 bg-[#08080c]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 mb-6 rounded-b-3xl shadow-2xl shadow-black/40">
        <div className="flex items-center gap-5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate tracking-tight">{project.name}</h1>
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white font-mono transition-colors uppercase tracking-widest"
              >
                {project.githubUrl.replace('https://github.com/', '')}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : (
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No source linked</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            {teamMembersLoading ? '…' : teamMembers.length}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Active
          </span>
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 px-6 pb-20 items-start">

        {/* ── LEFT: main content column ─────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-fit mb-6">
            {[
              { id: 'activity', label: 'Stream', icon: Github },
              { id: 'ai', label: 'Context', icon: Cpu },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'sync', label: 'Sync', icon: RefreshCcw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-white text-[#08080c] shadow-xl"
                    : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02]"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conditional Rendering for Performance Optimization */}
          <div className="space-y-6 animate-in fade-in duration-500">

            {activeTab === 'activity' && (
              <div className="premium-glass rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">Recent Commits</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Global Stream</p>
                  </div>
                </div>
                <div className="p-2">
                  <CommitLog project={project} />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <AICodeAssistantCard />
                <div className="premium-glass rounded-3xl p-6 border border-white/5 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <BarChart3 className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight">Change Analytics</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Contextual Metrics</p>
                    </div>
                  </div>
                  <CommitIntelligenceDashboard projectId={project.id} projectName={project.name} />
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Team Members List */}
                <div className="premium-glass rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/20">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white tracking-tight">Team Members</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Collaboration Squad</p>
                      </div>
                    </div>
                    <Button onClick={inviteTeamMember} variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl h-9">
                      <UserPlus className="w-3.5 h-3.5 mr-2" />
                      Invite
                    </Button>
                  </div>

                  {teamMembersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                      <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm font-medium">No team members joined yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamMembers.map((member: any, idx: number) => (
                        <div key={member.id || member.userId || `member-${idx}`} className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                          <Avatar className="w-10 h-10 border-2 border-white/5">
                            <AvatarFallback className="bg-white/10 text-zinc-300 font-bold text-xs">
                              {member.user?.firstName?.[0] || member.user?.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{member.user?.firstName || member.user?.email}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{member.role || "Active Member"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'sync' && (
              <div className="premium-glass rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <RefreshCcw className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">Repository Synchronization</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Maintenance & Data Flow</p>
                  </div>
                </div>
                <RepositoryLoader />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: sticky widget column ───────────────────────────── */}
        <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-5 sticky top-24">

          {/* Project summary */}
          <div className="premium-glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] opacity-50">Active Project</h3>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-400 text-[10px]">STABLE</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Github className="w-5 h-5 text-[#08080c]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{project.name}</p>
                {project.githubUrl && (
                  <p className="text-[10px] text-zinc-500 font-mono truncate uppercase tracking-tighter">
                    {project.githubUrl.replace('https://github.com/', '')}
                  </p>
                )}
              </div>
            </div>
            <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
                <p className="text-xl font-bold text-white">{teamMembersLoading ? '—' : teamMembers.length}</p>
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Members</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
                <p className="text-xl font-bold text-zinc-400">Gen</p>
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Active</p>
              </div>
            </div>
          </div>

          {/* AI & Repo status */}
          <div className="premium-glass rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/20 space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] opacity-50">Platform State</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Semantic Context
                </span>
                <Badge variant="outline" className="border-white/10 text-zinc-500 font-black text-[9px] uppercase tracking-widest">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${project.githubUrl ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'bg-zinc-700'}`} />
                  Sync Protocol
                </span>
                <span className={`font-black text-[9px] uppercase tracking-widest ${project.githubUrl ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {project.githubUrl ? 'Connected' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="premium-glass rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/20 space-y-5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] opacity-50">Project Actions</h3>
            <div className="grid gap-2">
              {[
                { label: 'Invite Member', icon: UserPlus, action: inviteTeamMember },
                { label: 'Export Dataset', icon: Download, action: exportData },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">{item.label}</span>
                  </div>
                </button>
              ))}
              <button
                onClick={archiveProject}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-4 text-zinc-600 hover:text-zinc-400 transition-colors mt-2 text-[10px] font-bold uppercase tracking-[0.15em]"
              >
                Archive Project
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals — lazy-loaded, only mounted when open */}
      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInviteMember}
        />
      )}
      {isArchiveModalOpen && (
        <ArchiveProjectModal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          onArchive={handleArchiveProject}
          projectName={project?.name}
        />
      )}
      {isExportModalOpen && (
        <ExportDataModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportData}
          projectName={project?.name}
        />
      )}
    </>
  );
};

export default DashboardPage;
