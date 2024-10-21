// app/api/following/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    console.log('Fetching following list for userId:', userId);

    if (!userId) {
      console.error('Missing userId for fetching following list');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch the list of users the current user is following
    const followingList = await prisma.following.findMany({
      where: {
        followerId: parseInt(userId),
      },
      include: {
        following: true,  // Include the user being followed
      },
    });

    const result = followingList.map((follow) => ({
      followingId: follow.followingId,
      username: follow.following.username,
    }));

    console.log('Following list retrieved:', result);

    return NextResponse.json({ following: result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching following list:', error);
    return NextResponse.json({ error: 'Failed to fetch following list' }, { status: 500 });
  }
}
