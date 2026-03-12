'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Github, RefreshCcw, ExternalLink, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from '@/trpc/react';
import { cn } from "@/lib/utils";
import useRefetch from "@/hooks/use-refetch";

interface CommitLogProps {
    project: any;
}

const CommitSummary = ({ summary }: { summary: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand if the summary is very short
    const isLong = summary.length > 250;

    return (
        <div className="mt-5 relative">
            <div className="relative p-5 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/10">
                        <Cpu className="w-3 h-3 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Contextual Summary</span>
                    <div className="h-[1px] flex-1 bg-white/[0.05]" />
                </div>

                <div className="relative">
                    <p className={cn(
                        "text-zinc-300 leading-relaxed text-[13px] font-medium selection:bg-white/10 whitespace-pre-wrap transition-all duration-300",
                        !isExpanded && isLong && "line-clamp-3"
                    )}>
                        {summary}
                    </p>

                    {!isExpanded && isLong && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none" />
                    )}
                </div>

                {isLong && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                        {isExpanded ? "Show Less" : "Expand Summary"}
                    </button>
                )}
            </div>
        </div>
    );
};

export const CommitLog: React.FC<CommitLogProps> = ({ project }) => {
    const [commits, setCommits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
    const [isPolling, setIsPolling] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { refetchProjects } = useRefetch();
    const utils = api.useUtils();

    const updateProject = api.project.updateProject.useMutation({
        onSuccess: () => {
            refetchProjects();
            setIsEditing(false);
        },
    });

    const pollCommits = api.project.pollCommits.useMutation();

    useEffect(() => {
        setGithubUrl(project?.githubUrl || '');
    }, [project]);

    const handleSaveGithubUrl = () => {
        if (project?.id) {
            updateProject.mutate({
                id: project.id,
                githubUrl: githubUrl,
            });
        }
    };

    const fetchCommits = useCallback(async () => {
        if (!project?.id) return;

        setLoading(true);
        setError(null);

        try {
            const dbCommits = await utils.project.getCommits.fetch({
                projectId: project.id,
            });

            if (dbCommits.length > 0) {
                const formattedCommits = dbCommits.map(commit => ({
                    sha: commit.commitHash,
                    commit: {
                        message: commit.commitMessage,
                        author: {
                            name: commit.commitAuthorName || 'Unknown',
                            date: commit.commitDate?.toISOString() || new Date().toISOString()
                        }
                    },
                    author: {
                        login: commit.commitAuthorName || 'unknown',
                        avatar_url: commit.commitAuthorAvatar || ''
                    },
                    summary: commit.summary
                }));

                setCommits(formattedCommits);
                setError(null);
                return;
            }

            if (project?.githubUrl) {
                const formattedCommits = await utils.project.fetchCommitsFromGithub.fetch({
                    projectId: project.id,
                });

                setCommits(formattedCommits);
                setError(null);
            } else {
                setCommits([]);
            }
        } catch (err: any) {
            console.warn('Failed to fetch commits:', err.message);
            setError(`Failed to fetch commits: ${err.message}`);
            setCommits([]);
        } finally {
            setLoading(false);
        }
    }, [project?.id, project?.githubUrl, utils.project.getCommits, utils.project.fetchCommitsFromGithub]);

    useEffect(() => {
        if (project?.id) {
            fetchCommits();
        }
    }, [project?.id, fetchCommits]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'today';
        if (diffInDays === 1) return '1 day ago';
        return `${diffInDays} days ago`;
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setErrorMessage(null);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const showError = (msg: string) => {
        setErrorMessage(msg);
        setSuccessMessage(null);
        setTimeout(() => setErrorMessage(null), 4000);
    };

    const handlePollCommits = async () => {
        if (!project?.id) return;

        setIsPolling(true);
        try {
            const result = await pollCommits.mutateAsync({ projectId: project.id });
            if (result.processed > 0) {
                await utils.project.getCommits.invalidate({ projectId: project.id });
                await fetchCommits();
                showSuccess(`Successfully processed ${result.processed} new commit${result.processed === 1 ? '' : 's'} with AI summaries.`);
            } else {
                showSuccess('No new commits found. Your repository is up to date.');
            }
        } catch (error: any) {
            showError(`Failed to poll commits: ${error.message}`);
        } finally {
            setIsPolling(false);
        }
    };

    if (!project?.githubUrl && commits.length === 0 && !loading) {
        return (
            <div className="p-8 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                <Github className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm font-medium mb-4">No GitHub repository linked.</p>
                <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9"
                >
                    Add GitHub URL
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 px-4 pt-2">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={handlePollCommits}
                        disabled={isPolling || !project?.githubUrl}
                        className="bg-white text-[#08080c] hover:bg-zinc-200 rounded-lg h-8 px-4 text-[11px] font-bold transition-all"
                    >
                        {isPolling ? 'Syncing...' : 'Poll Commits'}
                    </Button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[10px] text-zinc-500 font-black uppercase tracking-wider hover:text-zinc-300 transition-colors"
                    >
                        {isEditing ? 'Cancel' : 'Edit Source'}
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-4 mx-4">
                    <input
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="GitHub URL..."
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-3 focus:outline-none focus:border-indigo-500/50"
                    />
                    <Button
                        size="sm"
                        onClick={handleSaveGithubUrl}
                        disabled={updateProject.isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-8 text-xs font-bold"
                    >
                        {updateProject.isPending ? 'Saving...' : 'Update Repository'}
                    </Button>
                </div>
            )}

            {successMessage && <div className="mx-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">{successMessage}</div>}
            {errorMessage && <div className="mx-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{errorMessage}</div>}

            <div className={cn("space-y-3 px-4 max-h-[600px] overflow-y-auto custom-scrollbar pb-8", isPolling && "opacity-50 pointer-events-none")}>
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)
                ) : commits.length === 0 ? (
                    <p className="text-zinc-500 text-center py-10 text-xs">No commits found.</p>
                ) : (
                    commits.map((commit) => (
                        <div key={commit.sha} className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 border border-white/5 hover:border-white/10 hover:bg-white/[0.03] group/commit">
                            <Avatar className="w-10 h-10 border-2 border-white/5 shadow-lg group-hover/commit:scale-110 transition-transform">
                                <AvatarImage src={commit.author?.avatar_url} />
                                <AvatarFallback className="text-xs bg-indigo-500/10 text-indigo-400 font-bold">
                                    {commit.commit.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-zinc-100">{commit.commit.author.name}</span>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">• {formatDate(commit.commit.author.date)}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-zinc-600 group-hover/commit:text-indigo-400 transition-colors">#{commit.sha.substring(0, 7)}</span>
                                </div>
                                <p className="text-sm text-zinc-400 group-hover/commit:text-zinc-200 transition-colors leading-relaxed mb-3">{commit.commit.message}</p>

                                {commit.summary && (
                                    <CommitSummary summary={commit.summary} />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
