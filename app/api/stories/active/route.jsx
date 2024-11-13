import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the current date and time to compare with story expiration
    const currentDateTime = new Date();
    
    // Fetch stories that are not expired
    const activeStories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gte: currentDateTime, // Only get stories where expiresAt is greater than or equal to now
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            // other user fields you may want to include
          },
        },
      },
    });

    return NextResponse.json(activeStories, { status: 200 });
  } catch (error) {
    console.error('Error fetching active stories:', error);
    return NextResponse.json({ error: 'Failed to fetch active stories.' }, { status: 500 });
  }
}
