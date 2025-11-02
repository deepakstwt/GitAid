'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Rocket,
  Github,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Code2,
  GitBranch,
  Brain,
  PlayCircle,
  BookOpen,
  Lightbulb
} from 'lucide-react';

export function DashboardWelcome({ userName }: { userName?: string }) {
  const [showTour, setShowTour] = useState(false);

  const quickStartSteps = [
    {
      icon: Github,
      title: 'Connect Repository',
      description: 'Link your GitHub repository to start tracking commits and analyzing code',
      action: 'Connect Now',
      href: '/create',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Users,
      title: 'Invite Team Members',
      description: 'Collaborate with your team by inviting members to your project',
      action: 'Invite Team',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'Explore AI Features',
      description: 'Discover AI-powered commit analysis and semantic code search',
      action: 'Learn More',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Analysis',
      description: 'Automatic commit summaries with intelligent insights'
    },
    {
      icon: Code2,
      title: 'Smart Search',
      description: 'Find code with natural language queries'
    },
    {
      icon: GitBranch,
      title: 'Repository Sync',
      description: 'Real-time synchronization with GitHub'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly'
    }
  ];

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
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Welcome to GitAid</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {userName ? `Welcome, ${userName}!` : 'Welcome!'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Get Started
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Set up your first project in minutes and unlock the power of AI-driven development insights
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/create">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <Rocket className="mr-2 w-5 h-5" />
                Create Your First Project
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => setShowTour(true)}
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Quick Start Guide</h2>
            <p className="text-gray-400">Follow these steps to get the most out of GitAid</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {quickStartSteps.map((step, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-400">STEP {index + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {step.href && (
                    <Link href={step.href}>
                      <Button 
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        variant="outline"
                      >
                        {step.action}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">What You Can Do</h2>
            <p className="text-gray-400">Powerful features to supercharge your development workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                    <Lightbulb className="w-10 h-10 text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Need Help Getting Started?</h3>
                  <p className="text-gray-300 mb-4">
                    Check out our comprehensive documentation and video tutorials
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <BookOpen className="mr-2 w-4 h-4" />
                      Documentation
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <PlayCircle className="mr-2 w-4 h-4" />
                      Video Tutorials
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Your Progress</h3>
                <span className="text-sm text-gray-400">0% Complete</span>
              </div>
              
              <div className="w-full bg-white/5 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: '0%' }} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center flex-shrink-0" />
                  <span>Create your first project</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center flex-shrink-0" />
                  <span>Connect a GitHub repository</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center flex-shrink-0" />
                  <span>Invite your first team member</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

