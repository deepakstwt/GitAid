'use client';

import dynamic from 'next/dynamic';
import { Suspense, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import useProject from "@/hooks/use-project";
import { DashboardWelcome } from '@/components/DashboardWelcome';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load heavy components to improve initial page load
const CommitIntelligenceDashboard = dynamic(
  () => import('@/components/CommitIntelligenceDashboard'),
  {
    loading: () => <CommitIntelligenceDashboardSkeleton />,
    ssr: false, // Only load on client since it has client-side logic
  }
);

const RepositoryLoader = dynamic(
  () => import('@/components/repository-loader'),
  {
    loading: () => <RepositoryLoaderSkeleton />,
    ssr: false,
  }
);

const AICodeAssistantCard = dynamic(
  () => import('@/components/AICodeAssistantCard').then(mod => ({ default: mod.AICodeAssistantCard })),
  {
    loading: () => <AICodeAssistantSkeleton />,
    ssr: false,
  }
);

// Skeleton loaders for better UX
function CommitIntelligenceDashboardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/5" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RepositoryLoaderSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-32 bg-white/5" />
        <Skeleton className="h-12 w-full bg-white/5" />
        <Skeleton className="h-24 w-full bg-white/5" />
      </CardContent>
    </Card>
  );
}

function AICodeAssistantSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-40 bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
      </CardContent>
    </Card>
  );
}

// Import the main dashboard component logic
const DashboardPageContent = dynamic(
  () => import('./page'),
  {
    loading: () => <DashboardPageSkeleton />,
    ssr: true, // Keep SSR for SEO
  }
);

function DashboardPageSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Skeleton className="h-10 w-64 bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32 bg-white/5" />
              <Skeleton className="h-24 w-full bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const DashboardPage = () => {
  const { user } = useUser();
  const { project, projects, projectId } = useProject();

  // Memoize welcome check to prevent unnecessary re-renders
  const showWelcome = useMemo(() => {
    return projects?.length === 0;
  }, [projects?.length]);

  if (!project && showWelcome) {
    return <DashboardWelcome userName={user?.firstName || user?.username || undefined} />;
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Project Selected</h3>
              <p className="text-gray-400">
                Select a project from the sidebar to view its dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
};

export default DashboardPage;

