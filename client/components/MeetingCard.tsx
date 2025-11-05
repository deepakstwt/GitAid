'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createMeeting } from '@/server/lib/actions';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/server/lib/firebase';
import { Progress } from '@/components/ui/progress';

interface MeetingCardProps {
  projectId: string;
  onSuccess?: () => void;
}

export function MeetingCard({ projectId, onSuccess }: MeetingCardProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('audio')) {
      setError('Please upload an audio file (MP3, WAV, M4A, etc.)');
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']
    },
    multiple: false,
    disabled: isUploading || success
  });

  const handleSubmit = async () => {
    if (!meetingName.trim()) {
      setError('Please enter a meeting name');
      return;
    }

    if (!selectedFile) {
      setError('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload file to Firebase
      const downloadURL = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      // Create meeting in database
      const result = await createMeeting({
        name: meetingName,
        audioUrl: downloadURL,
        projectId
      });

      if (result.success && result.meeting) {
        // Kick off async processing
        const processResponse = await fetch(`/api/process-meeting?meetingId=${result.meeting.id}`, {
          method: 'POST',
        });

        if (!processResponse.ok) {
          throw new Error('Failed to start meeting processing');
        }

        setSuccess(true);
        setUploadProgress(100);
        
        // Reset form and refresh after delay
        setTimeout(() => {
          setSuccess(false);
          setMeetingName('');
          setSelectedFile(null);
          setUploadProgress(0);
          if (onSuccess) {
            onSuccess();
          }
          router.refresh();
        }, 2000);
      } else {
        throw new Error(result.error || 'Meeting creation failed');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm shadow-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          Upload Meeting Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Meeting Name Input */}
        <div className="space-y-2">
          <label htmlFor="meetingName" className="text-sm font-semibold text-white">
            Meeting Name <span className="text-red-400">*</span>
          </label>
          <Input
            id="meetingName"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="e.g., Team Standup - Nov 2, 2025"
            disabled={isUploading || success}
            className="bg-gray-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 h-12"
          />
          <p className="text-xs text-gray-400">Give your meeting a descriptive name for easy reference</p>
        </div>

        {/* File Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">
            Audio File <span className="text-red-400">*</span>
          </label>
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive 
                ? 'border-purple-500/50 bg-purple-500/10 scale-[1.02]' 
                : 'border-white/20 bg-gray-800/30 hover:border-purple-500/30 hover:bg-purple-500/5'
              }
              ${isUploading || success ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {success ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-green-400">Upload Successful!</p>
                  <p className="text-sm text-gray-400">Your meeting is being processed...</p>
                </div>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                </div>
                <div className="space-y-2 w-full max-w-xs">
                  <p className="text-sm font-medium text-white">Uploading...</p>
                  <Progress value={uploadProgress} className="h-2 bg-gray-800/50" />
                  <p className="text-xs text-gray-400">{Math.round(uploadProgress)}% complete</p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <FileAudio className="w-8 h-8 text-purple-400" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Upload className={`w-8 h-8 text-purple-400 transition-transform ${isDragActive ? 'scale-110' : ''}`} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">
                    {isDragActive ? 'Drop your audio file here' : 'Drag & drop an audio file here'}
                  </p>
                  <p className="text-xs text-gray-400">
                    or click to browse from your device
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                      MP3
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                      WAV
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                      M4A
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                      AAC
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Maximum file size: 50MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Upload Error</p>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isUploading || success || !meetingName.trim() || !selectedFile}
          className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-0 shadow-xl hover:shadow-purple-500/50 transition-all h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Upload Complete
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Process Meeting
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
