import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';

export default async function SyncUserPage() {
  // Get authenticated user
  const { userId } = await auth();
  
  if (!userId) {
    // If not authenticated, redirect to sign-in
    redirect('/sign-in');
  }

  try {
    // Get user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      // If no email, redirect to sign-up
      redirect('/sign-up');
    }

    // Sync user to database (upsert to ensure they exist)
    await db.user.upsert({
      where: { emailAddress: userEmail },
      update: {
        imageUrl: clerkUser.imageUrl || null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
      },
      create: {
        id: userId,
        emailAddress: userEmail,
        imageUrl: clerkUser.imageUrl || null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
      },
    });
  } catch (error) {
    // Log error but continue - user might already exist in DB
    console.error('Error syncing user to database:', error);
    // Don't throw - redirect will happen anyway
  }

  // Always redirect to dashboard after sync attempt
  // This redirect() call throws internally in Next.js 15, which is expected behavior
  redirect('/dashboard');
}

