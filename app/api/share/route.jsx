import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { postId, userId, friendId } = await req.json();

    // Log the incoming values for debugging
    console.log("postId:", postId);
    console.log("userId:", userId);
    console.log("friendId:", friendId);

    // Check if required data exists
    if (!postId || !userId || !friendId) {
      console.log("Missing data"); // Additional log for missing data
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Fetch the username of the user sharing the post
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the share record
    const share = await prisma.share.create({
      data: {
        postId,
        userId,
      },
    });

    // Create a notification for the friend with the username
    const notification = await prisma.notification.create({
      data: {
        userId: friendId, // Friend to notify
        senderId: userId, // Sender (logged-in user)
        postId: postId,
        content: `${user.username} shared a post with you.`,
      },
    });

    return NextResponse.json({ share, notification }, { status: 200 });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: 'Failed to share post' }, { status: 500 });
  }
}
