"use client";

import { useState } from "react";
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GitCommit,
  Cpu,
  Search,
  RefreshCw,
  Eye,
  Github,
  TrendingUp,
  Activity,
  Code2,
  GitBranch,
  Settings,
  Lock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CommitData {
  id: string;
  hash: string;
  message: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  aiSummary: string;
  type: "feature" | "bugfix" | "refactor" | "docs" | "test" | "chore" | "update";
}

interface CommitIntelligenceDashboardProps {
  projectId: string;
  projectName?: string;
}

export default function CommitIntelligenceDashboard({ projectId, projectName }: CommitIntelligenceDashboardProps) {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommit, setSelectedCommit] = useState<CommitData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const utils = api.useUtils();

  // Get commits from API for the selected project
  const { data: commits = [], isLoading: commitsLoading } = api.project.getCommits.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const pollMutation = api.project.pollCommits.useMutation({
    onSuccess: (data) => {
      if (data.processed > 0) {
        toast.success(`Processed ${data.processed} new commits with AI!`);
        utils.project.getCommits.invalidate({ projectId });
      } else {
        toast.info("Your repository is already up to date.");
      }
    },
    onError: (error) => {
      toast.error("Failed to sync: " + error.message);
    }
  });

  const updateProjectMutation = api.project.updateProject.useMutation({
    onSuccess: () => {
      toast.success("Security context updated successfully.");
      setIsSettingsOpen(false);
    },
    onError: (error) => {
      toast.error("Security update failed: " + error.message);
    }
  });

  const handleUpdateToken = () => {
    if (!tokenInput.trim()) {
      toast.error("Token string cannot be null.");
      return;
    }
    updateProjectMutation.mutate({
      id: projectId,
      githubToken: tokenInput.trim()
    });
  };

  const handlePollCommits = () => {
    if (!projectId) return;
    pollMutation.mutate({ projectId });
  };

  // Map database commits to UI format
  const mappedCommits: CommitData[] = commits.map((commit: any) => ({
    id: commit.id,
    hash: commit.commitHash,
    message: commit.commitMessage,
    author: {
      name: commit.commitAuthorName || "Unknown",
      avatar: commit.commitAuthorAvatar || ""
    },
    date: commit.commitDate?.toISOString() || new Date().toISOString(),
    additions: commit.linesAdded || 0,
    deletions: commit.linesDeleted || 0,
    filesChanged: commit.filesChanged || 0,
    aiSummary: commit.summary || "Technical analysis not available for this event.",
    type: (commit.commitType as any) || "update"
  }));

  const filteredCommits = mappedCommits.filter(commit =>
    commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAdditions = mappedCommits.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = mappedCommits.reduce((acc, c) => acc + c.deletions, 0);

  const handleCommitClick = (commit: CommitData) => {
    setSelectedCommit(commit);
    setIsModalOpen(true);
  };

  const getCommitTypeColor = (type: string) => {
    switch (type) {
      case "feature": return "bg-white/5 text-white border-white/10";
      case "bugfix": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "refactor": return "bg-zinc-800 text-zinc-300 border-zinc-700";
      default: return "bg-zinc-900 text-zinc-500 border-white/5";
    }
  };

  if (!isLoaded || commitsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-10 h-10 rounded-full border-t-2 border-white/20 animate-spin mb-4" />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Parsing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.03] border-white/5 shadow-2xl overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Code Flux</p>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">+{totalAdditions}</span>
                <span className="text-sm font-bold text-rose-500 mb-1">-{totalDeletions}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 shadow-2xl overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Impact Radius</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-white tracking-tight">{mappedCommits.length}</span>
              <span className="text-xs font-bold text-zinc-500 mb-1">Events Logged</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors" onClick={handlePollCommits}>
          <CardContent className="p-6 relative">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-45 transition-transform duration-700">
              <RefreshCw className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">State</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                {pollMutation.isPending ? "Syncing..." : "Live"}
              </span>
              {!pollMutation.isPending && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Search change stream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/20 border-white/5 rounded-xl h-10 text-xs text-white placeholder:text-zinc-600 focus:border-white/20 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-zinc-800 text-zinc-400 border-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
            {filteredCommits.length} results
          </Badge>
        </div>
      </div>

      {/* Commit Intelligent Grid */}
      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-10">
        <AnimatePresence mode="popLayout">
          {filteredCommits.length > 0 ? (
            filteredCommits.map((commit, idx) => (
              <motion.div
                key={commit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group/card"
                onClick={() => handleCommitClick(commit)}
              >
                <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden">
                  {/* Hover indicator gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4 relative z-10">
                    <Avatar className="w-10 h-10 border-2 border-white/5 group-hover/card:scale-105 transition-transform shadow-lg">
                      <AvatarImage src={commit.author.avatar} />
                      <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400 font-bold uppercase">
                        {commit.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">{commit.author.name}</span>
                          <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5", getCommitTypeColor(commit.type))}>
                            {commit.type}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 group-hover/card:text-indigo-400 transition-colors">#{commit.hash.substring(0, 7)}</span>
                      </div>

                      <p className="text-sm text-zinc-400 group-hover/card:text-zinc-200 transition-colors line-clamp-2 leading-relaxed mb-4">
                        {commit.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/50 border border-white/5">
                            <Code2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">+{commit.additions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/50 border border-white/5">
                            <Code2 className="w-3 h-3 text-rose-500" />
                            <span className="text-[10px] font-bold text-rose-400">-{commit.deletions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/50 border border-white/5">
                            <GitBranch className="w-3 h-3 text-zinc-500" />
                            <span className="text-[10px] font-bold text-zinc-500">{commit.filesChanged} files</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 group/eye">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover/eye:text-indigo-400 transition-colors">View Details</span>
                          <Eye className="w-3.5 h-3.5 text-zinc-600 group-hover/eye:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-zinc-700" />
              </div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No matching insights discovered</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Commits Detail Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-white/10 p-0 overflow-hidden shadow-2xl rounded-3xl">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white/10 p-0.5">
                  <AvatarImage src={selectedCommit?.author.avatar} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">
                    {selectedCommit?.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">{selectedCommit?.author.name}</DialogTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 mt-0.5">
                    <Github className="w-3 h-3" /> Event Hash: {selectedCommit?.hash.substring(0, 12)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1", selectedCommit ? getCommitTypeColor(selectedCommit.type) : "")}>
                {selectedCommit?.type}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subject Message</p>
              <p className="text-md font-bold text-white leading-relaxed">{selectedCommit?.message}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-lg">
                    <Cpu className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Contextual Summary</p>
                    <h4 className="text-sm font-bold text-white tracking-tight">Technical Analysis</h4>
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-white/5" />
                <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-500 text-[9px] font-black tracking-widest px-2 py-1 uppercase">Automated Gen</Badge>
              </div>

              <div className="relative p-6 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] shadow-2xl overflow-hidden group/summary">
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover/summary:bg-indigo-500/10 transition-colors duration-700" />

                <div className="absolute top-4 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cpu className="w-10 h-10 text-white" />
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-medium relative z-10 selection:bg-indigo-500/30">
                  {selectedCommit?.aiSummary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Expansion</p>
                <p className="text-lg font-bold text-emerald-400">+{selectedCommit?.additions} lines</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Reduction</p>
                <p className="text-lg font-bold text-rose-500">-{selectedCommit?.deletions} lines</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Scope</p>
                <p className="text-lg font-bold text-white tracking-tight">{selectedCommit?.filesChanged} files</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-zinc-800 border-white/5 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl h-11 px-6 transition-all"
              >
                Close Insights
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* GitHub Security Context Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border border-white/10 p-0 overflow-hidden shadow-2xl rounded-3xl">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">Authentication Override</DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">GitHub Access Token</p>
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  Generate Token <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              
              <Input
                type="password"
                placeholder="ghp_••••••••••••••••"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="bg-black/40 border-white/5 rounded-xl h-12 text-sm text-white placeholder:text-zinc-700 focus:border-indigo-500/50 transition-all font-medium"
              />
              
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-80">Security Protocol</p>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Use this to bypass global API rate limits. Tokens are stored as part of the project metadata and used for all future contextual sync operations.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-transparent border-white/5 hover:bg-white/5 text-zinc-500 text-xs font-bold rounded-xl h-11 transition-all"
              >
                Abort
              </Button>
              <Button
                onClick={handleUpdateToken}
                disabled={updateProjectMutation.isPending}
                className="flex-1 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-xl h-11 transition-all uppercase tracking-widest"
              >
                {updateProjectMutation.isPending ? "Syncing..." : "Update Token"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
