import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/trpc(.*)',
  '/sync-user(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Check if Clerk environment variables are set
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error('Clerk environment variables are missing')
    // For public routes, allow access even without Clerk
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }
    // For protected routes, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(signInUrl)
  }

  try {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // If it's a public route, allow access
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }
    // For protected routes, redirect to sign-in on error
    const signInUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}