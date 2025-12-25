'use client';

import { useState } from 'react';
import { MeetingCard } from '@/components/MeetingCard';
import { MeetingList } from '@/components/MeetingList';
import { Button } from '@/components/ui/button';
import { Plus, Presentation, Sparkles } from 'lucide-react';
import useProject from '@/hooks/use-project';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function MeetingsPageClient({ projectId: propProjectId }: { projectId?: string } = {}) {
  const [showUpload, setShowUpload] = useState(false);
  const { project, projectId: hookProjectId } = useProject();
  const projectId = propProjectId || hookProjectId;

  // No Project Selected State
  if (!projectId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
                <Presentation className="w-10 h-10 text-purple-400" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">No Project Selected</h3>
                <p className="text-gray-400">
                  Select a project from the sidebar to start managing meetings
                </p>
              </div>

              <div className="pt-4">
                <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading State
  if (!project) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-300">Meeting Management</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Meetings
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Upload audio recordings, get AI-powered transcriptions, and extract actionable insights from your team meetings
        </p>
      </div>

      {/* Action Section */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-0 shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showUpload ? 'Cancel Upload' : 'Add New Meeting'}
          </Button>
        </div>
      </div>

      {/* Upload Card */}
      {showUpload && (
        <div className="mb-8 animate-in slide-in-from-top-5 duration-300">
          <MeetingCard projectId={projectId} onSuccess={() => setShowUpload(false)} />
        </div>
      )}

      {/* Meetings List */}
      <div className="mt-8">
        <MeetingList projectId={projectId} />
      </div>
    </div>
  );
}
