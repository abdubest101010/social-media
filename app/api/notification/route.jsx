// /app/api/notification/route.jsx
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Fetch notifications for a user (example with userId)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId'); // Assuming userId is passed as a query parameter

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// API route to send a message (already implemented as POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { senderId, receiverId, content } = body;

    // Validate required fields
    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if the sender is blocked by the receiver
    const isBlocked = await prisma.block.findFirst({
      where: {
        blockerId: parseInt(receiverId),
        blockedId: parseInt(senderId),
      },
    });

    if (isBlocked) {
      return NextResponse.json({ error: 'You are blocked by this user' }, { status: 403 });
    }

    // Create the message and include the sender's username in the response
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content,
      },
      include: {
        sender: {
          select: { username: true },
        },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        messageId: message.id,
        content: `${message.sender.username} sent you a message: ${content}`,
      },
    });

    // Return the created message including the sender's username
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
