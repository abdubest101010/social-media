import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse request body
    const { requestId, senderId } = await req.json();

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

    // Accept the request by updating its status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    // Add only the receiver as a follower of the sender
    await prisma.following.create({
      data: {
        followerId: friendRequest.senderId, // Receiver becomes follower
        followingId: friendRequest.receiverId,  // Sender becomes the person followed
      },
    });
    await prisma.friend.create({
      data: {
        user1Id: friendRequest.senderId,  // Use senderId from the friend request
        user2Id: friendRequest.receiverId, // Use receiverId from the friend request
      },
    });

    return NextResponse.json({ message: 'Friend request accepted!' }, { status: 200 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}