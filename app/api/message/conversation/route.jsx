import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Use req.nextUrl to get query parameters (recommended for dynamic routes in Next.js)
    const { searchParams } = req.nextUrl;  // This is the correct way to handle query parameters
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    // Check if the friendship exists before retrieving messages
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: parseInt(userId), user2Id: parseInt(friendId) },
          { user1Id: parseInt(friendId), user2Id: parseInt(userId) },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'You are not friends with this user' }, { status: 403 });
    }

    // Fetch the messages and include the sender's username
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId), receiverId: parseInt(friendId) },
          { senderId: parseInt(friendId), receiverId: parseInt(userId) },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { username: true }, // Include the sender's username
        },
      },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
