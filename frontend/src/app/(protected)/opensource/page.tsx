'use client';

import { api } from '@/trpc/react';
import { Star, GitFork, Code2, ExternalLink, Sparkles, Globe, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISCOVER_LINKS = [
  { label: 'GitHub Explore', href: 'https://github.com/explore', icon: Globe },
  { label: 'Trending Repos', href: 'https://github.com/trending', icon: Star },
  { label: 'Open Source Guide', href: 'https://opensource.guide', icon: BookOpen },
];

export default function OpenSourcePage() {
  const { data: repos = [], isLoading } = api.project.getOpenSourceRepos.useQuery();

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Hero */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Open Source
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          Your open source footprint
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Repositories you track in GitAid. Stars, forks, and language at a glance.
        </p>
      </div>

      {/* Repo cards */}
      <section className="mb-16">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <Code2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No open source repos yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
              Add a project with a GitHub URL from your Dashboard to see it here with stars, forks, and language.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-colors"
            >
              Go to Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <a
                key={repo.projectId}
                href={repo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group block rounded-2xl border p-5 transition-all duration-300',
                  repo.error
                    ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {repo.fullName}
                    </h3>
                    {repo.projectName !== repo.fullName && (
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                        {repo.projectName}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-white transition-colors" />
                </div>
                {repo.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{repo.description}</p>
                )}
                {repo.error ? (
                  <p className="text-xs text-amber-400/90">{repo.error}</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400/80" />
                      <span className="font-semibold text-zinc-300">{repo.stars}</span>
                      <span>stars</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-semibold text-zinc-300">{repo.forks}</span>
                      <span>forks</span>
                    </span>
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-zinc-400">
                        <Code2 className="w-3 h-3" />
                        {repo.language}
                      </span>
                    )}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Discover section */}
      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-500" />
          Discover open source
        </h2>
        <div className="flex flex-wrap gap-3">
          {DISCOVER_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 hover:text-white text-sm font-medium transition-all"
            >
              <Icon className="w-4 h-4" />
              {label}
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
