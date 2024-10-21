import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// API route to send a message
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
        senderId: parseInt(senderId), // Ensure it's an integer
        receiverId: parseInt(receiverId), // Ensure it's an integer
        content,
      },
      include: {
        sender: {
          select: { username: true }, // Include the sender's username in the response
        },
      },
    });

    // Return the created message including the sender's username
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// API route to fetch conversation

