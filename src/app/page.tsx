import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  Code2, 
  Brain, 
  Rocket,
  CheckCircle2,
  ArrowRight,
  Star,
  GitBranch,
  MessageSquare,
  BarChart3
} from "lucide-react";
import Footer from './components/Footer';

export default async function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background - Optimized with CSS containment */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ contain: 'layout style paint' }}>
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl floating" 
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl floating-delayed" 
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl floating" 
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          aria-hidden="true"
        />
        
        {/* Animated Grid - Optimized */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'grid-move 20s linear infinite',
            willChange: 'transform',
            contain: 'layout style paint'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GitAid
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">AI-Powered Git Management</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GitHub Workflow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience intelligent project management with AI-powered commit analysis, 
            semantic search, and seamless team collaboration. Built for modern developers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-2xl hover:shadow-blue-500/50 text-lg px-8 py-6 rounded-xl transition-all transform hover:scale-105">
                <Rocket className="mr-2 w-5 h-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl backdrop-blur-sm">
                <Github className="mr-2 w-5 h-5" />
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your GitHub repositories intelligently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards - truncated for brevity, keep your existing features */}
            {[
              { icon: Brain, title: "AI-Powered Analysis", desc: "Get intelligent insights from your commits with advanced AI that understands your code context." },
              { icon: Zap, title: "Semantic Search", desc: "Find exactly what you need with vector-based search. Ask questions in natural language." },
              { icon: Users, title: "Team Collaboration", desc: "Work seamlessly with your team. Invite members, track contributions, and collaborate in real-time." },
              { icon: Code2, title: "Smart Code Insights", desc: "Understand your codebase better with detailed analytics, commit patterns, and intelligent suggestions." },
              { icon: GitBranch, title: "Repository Sync", desc: "Seamlessly sync your GitHub repositories with automatic updates, commit tracking, and real-time status monitoring." },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Track project health with comprehensive analytics, visualizations, and insights that help you make data-driven decisions." },
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">10k+</div>
              <div className="text-gray-400">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">1M+</div>
              <div className="text-gray-400">Commits Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-gray-400">Integrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 mb-24">
        <div className="max-w-4xl mx-auto text-center p-16 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Ready to Transform Your Workflow?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are building better software with GitAid. Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 text-lg px-10 py-6 rounded-xl shadow-2xl transition-all transform hover:scale-105">
                <Rocket className="mr-2 w-5 h-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-xl backdrop-blur-sm">
                <MessageSquare className="mr-2 w-5 h-5" />
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
