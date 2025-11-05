import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';

export default async function SyncUserPage() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      // If not authenticated, redirect to sign-in
      redirect('/sign-in');
    }

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

    // Redirect to dashboard after successful sync
    redirect('/dashboard');
  } catch (error) {
    console.error('Error syncing user:', error);
    // On error, still redirect to dashboard (user might already exist)
    redirect('/dashboard');
  }
}

