import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse the request body
    const { requestId } = await req.json();

    // Fetch the friend request by ID
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      console.error('Friend request not found for ID:', requestId); // Log error
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (friendRequest.status !== 'pending') {
      console.error('Friend request already handled:', requestId); // Log error
      return NextResponse.json({ error: 'Friend request is already handled' }, { status: 400 });
    }

    // Reject the request
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    });

    // Block the sender from sending further requests
    await prisma.block.create({
      data: {
        blockerId: friendRequest.receiverId, // The receiver is blocking the sender
        blockedId: friendRequest.senderId,
      },
    });

    return NextResponse.json({ message: 'Friend request rejected and sender blocked!' }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
