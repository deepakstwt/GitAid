'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import useProject from '@/hooks/use-project';
import { 
  Github, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';

export default function CreateProjectPage() {
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const router = useRouter();
  const { refetchProjects } = useRefetch();
  const { setProjectId } = useProject();

  const createProjectMutation = api.project.createProject.useMutation({
    onSuccess: async (data) => {
      toast.success(`Project "${data.name}" created successfully!`);
      
      // Set the newly created project as active
      setProjectId(data.id);
      
      // Refresh project list to show the new project immediately
      await refetchProjects();
      
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Project creation error:', error);
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const testQuery = api.project.test.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    createProjectMutation.mutate({
      name: name.trim(),
      githubUrl: githubUrl.trim() || undefined,
      githubToken: githubToken.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl floating-delayed" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/15 via-pink-500/8 to-transparent rounded-full blur-3xl floating" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Project Setup</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Create Your First Project
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Set up your project in seconds and unlock AI-powered insights
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Github className="w-6 h-6 text-blue-400" />
                  Project Details
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fill in the information below to create your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white flex items-center gap-2">
                      Project Name
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., My Awesome Project"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                    />
                    <p className="text-xs text-gray-500">Choose a descriptive name for your project</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="text-white flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Repository URL
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                    />
                    <p className="text-xs text-gray-500">Connect your GitHub repository for automatic sync</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubToken" className="text-white flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      GitHub Personal Access Token
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="githubToken"
                      type="password"
                      placeholder="ghp_••••••••••••••••"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                    />
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-300">
                        <p className="font-medium text-blue-400 mb-1">For private repositories</p>
                        <p>Generate a token with <code className="px-1 py-0.5 bg-white/10 rounded">repo</code> scope. 
                        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1 inline-flex items-center gap-1">
                          Learn more <ExternalLink className="w-3 h-3" />
                        </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all h-12"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar - 1 column */}
          <div className="space-y-6">
            {/* What Happens Next */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Project Created</p>
                    <p className="text-xs text-gray-400">Your project workspace is set up instantly</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Repository Sync</p>
                    <p className="text-xs text-gray-400">If provided, we&apos;ll sync your GitHub repo</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">AI Analysis Starts</p>
                    <p className="text-xs text-gray-400">Get intelligent commit insights immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Included */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">✨ Features Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  AI-powered commit analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Semantic code search
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Team collaboration tools
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Real-time repository sync
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Advanced analytics dashboard
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400 mb-3">
                  Need help setting up your project?
                </p>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
