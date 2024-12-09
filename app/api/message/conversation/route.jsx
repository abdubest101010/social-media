import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Ensure the route is always treated as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl; // Retrieve query parameters dynamically
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    // Validate the friendship
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: parseInt(userId, 10), user2Id: parseInt(friendId, 10) },
          { user1Id: parseInt(friendId, 10), user2Id: parseInt(userId, 10) },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'You are not friends with this user' }, { status: 403 });
    }

    // Fetch messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId, 10), receiverId: parseInt(friendId, 10) },
          { senderId: parseInt(friendId, 10), receiverId: parseInt(userId, 10) },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { username: true }, // Include sender's username
        },
      },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
