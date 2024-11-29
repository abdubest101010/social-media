// API route to send a message (already implemented as POST)
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"
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
          select: { username: true, id: true }, // Select both username and id
        },
      },
    });

    // Create a notification for the receiver with senderId and content including sender's username
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        messageId: message.id,
        senderId: message.sender.id, // Store the sender's id in the notification
        content: `${message.sender.username} sent you a message: ${content}`,
      },
    });

    // Return the created message including the sender's id
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

