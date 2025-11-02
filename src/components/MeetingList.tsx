'use client';

import { useEffect, useState } from 'react';
import { getMeetings } from '@/lib/actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Presentation, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  FileText,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Meeting {
  id: string;
  name: string;
  audioUrl: string;
  transcription: string | null;
  summary: string | null;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
  createdAt: string;
}

interface MeetingListProps {
  projectId: string;
}

export function MeetingList({ projectId }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setError('No project selected');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    async function loadMeetings() {
      try {
        const result = await getMeetings(projectId);
        if (result.success && result.meetings) {
          setMeetings(
            result.meetings.map(meeting => ({
              ...meeting,
              status: (meeting.status as 'PROCESSING' | 'COMPLETED' | 'FAILED') || 'PROCESSING',
              createdAt: new Date(meeting.createdAt).toISOString()
            }))
          );
          setError(null);
          setRetryCount(0);
        } else {
          throw new Error(result.error || 'Failed to load meetings');
        }
      } catch (err) {
        console.error('Error loading meetings:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load meetings. Please try again.';
        setError(errorMessage);
        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, Math.pow(2, retryCount) * 1000);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMeetings();
  }, [projectId, retryCount]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'PROCESSING':
        return {
          icon: Loader2,
          label: 'Processing',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
        };
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
                <Skeleton className="h-20 w-full bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-2">Error Loading Meetings</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
            {retryCount < 3 && (
              <p className="text-sm text-gray-500">
                Retrying... Attempt {retryCount + 1} of 3
              </p>
            )}
            {retryCount >= 3 && (
              <Button
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (meetings.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
        <CardContent className="py-16 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
              <Presentation className="w-10 h-10 text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">No Meetings Yet</h3>
              <p className="text-gray-400">
                Upload your first meeting recording to get started with AI-powered transcriptions and summaries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Meetings List
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Recent Meetings ({meetings.length})
        </h2>
      </div>

      {meetings.map((meeting) => {
        const statusConfig = getStatusConfig(meeting.status);
        const StatusIcon = statusConfig.icon;
        const isProcessing = meeting.status === 'PROCESSING';

        return (
          <Card
            key={meeting.id}
            className="group bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Presentation className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {meeting.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(meeting.createdAt), 'PPp')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(meeting.createdAt))} ago</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color} border px-3 py-1 flex items-center gap-2`}
                >
                  <StatusIcon
                    className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`}
                  />
                  <span className="text-xs font-semibold">{statusConfig.label}</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {meeting.status === 'COMPLETED' && meeting.summary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Summary</span>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/40 border border-white/10 backdrop-blur-sm">
                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">
                      {meeting.summary}
                    </p>
                  </div>
                </div>
              )}

              {meeting.status === 'PROCESSING' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Processing in progress</p>
                    <p className="text-xs text-yellow-300/80 mt-0.5">
                      Your meeting is being transcribed and analyzed. This may take a few minutes.
                    </p>
                  </div>
                </div>
              )}

              {meeting.status === 'FAILED' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Processing Failed</p>
                    <p className="text-xs text-red-300/80 mt-0.5">
                      There was an error processing this meeting. Please try uploading again.
                    </p>
                  </div>
                </div>
              )}

              {meeting.status === 'COMPLETED' && meeting.transcription && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>Transcription available</span>
                </div>
              )}

              {meeting.status === 'COMPLETED' && !meeting.transcription && !meeting.summary && (
                <div className="text-sm text-gray-400">
                  Processing complete, but no content available yet.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
