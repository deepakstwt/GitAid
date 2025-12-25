import { SignIn } from '@clerk/nextjs'
import { Github, Sparkles } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-black relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl floating-delayed" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl floating" />
        
        {/* Additional Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/15 to-blue-500/8 rounded-full blur-2xl floating-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/12 to-purple-500/6 rounded-full blur-xl floating-slow-delayed" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Branding Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Github className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            GitAid
          </span>
        </div>
      </div>

      {/* Centered Clerk Component */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative">
          {/* Glow Effect Behind Card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 animate-pulse" />
          
          <div className="relative">
            <SignIn 
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignInUrl="/sync-user"
              appearance={{
                variables: {
                  colorPrimary: '#6366f1',
                  colorText: '#ffffff',
                  colorTextSecondary: '#a1a1aa',
                  colorBackground: '#0a0a0a',
                  colorInputBackground: '#18181b',
                  colorInputText: '#ffffff',
                  borderRadius: '0.75rem',
                  fontFamily: 'var(--font-geist-sans)',
                },
                elements: {
                  rootBox: 'mx-auto w-full',
                  card: 'bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative',
                  headerTitle: 'text-white font-bold text-3xl mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent',
                  headerSubtitle: 'text-gray-400 text-sm mb-6',
                  socialButtonsBlockButton: 'bg-gray-800/60 border-2 border-white/10 text-white hover:bg-gray-800/80 hover:border-white/20 transition-all duration-200 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02]',
                  socialButtonsBlockButtonText: 'text-white font-semibold',
                  socialButtonsBlockButtonArrow: 'text-white',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-gray-400',
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200 rounded-xl border-0 h-12 text-base hover:scale-[1.02]',
                  formFieldInput: 'bg-gray-800/60 border-2 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 focus:bg-gray-800/80 rounded-xl h-12 transition-all duration-200 font-medium',
                  formFieldLabel: 'text-gray-300 font-semibold mb-2',
                  footerActionLink: 'text-blue-400 hover:text-blue-300 font-semibold transition-all duration-200 hover:underline',
                  identityPreviewText: 'text-white font-medium',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300 font-medium transition-all',
                  formResendCodeLink: 'text-blue-400 hover:text-blue-300 font-semibold transition-all hover:underline',
                  otpCodeFieldInput: 'bg-gray-800/60 border-2 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 rounded-xl',
                  alertText: 'text-white font-medium',
                  formFieldSuccessText: 'text-green-400 font-medium',
                  formFieldErrorText: 'text-red-400 font-medium',
                  footer: 'border-t border-white/10 mt-6 pt-4',
                  footerAction: 'text-gray-400',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white transition-colors',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                }
              }}
            />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Secure Authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}