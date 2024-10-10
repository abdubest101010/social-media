import prisma from '@/lib/prisma';

export async function POST(req) {
  const { senderId, receiverId } = await req.json();

  try {
    // Check if the sender is blocked by the receiver
    const isBlocked = await prisma.block.findFirst({
      where: {
        blockerId: parseInt(receiverId), // The receiver has blocked the sender
        blockedId: parseInt(senderId),
      },
    });

    if (isBlocked) {
      return new Response(JSON.stringify({ alreadyBlocked: true }), { status: 200 });
    }

    // Check if there's a pending friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        status: 'pending',
      },
    });

    if (existingRequest) {
      return new Response(JSON.stringify({ alreadySent: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ alreadySent: false, alreadyBlocked: false }), { status: 200 });
  } catch (error) {
    console.error('Error checking friend request status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check friend request status' }), { status: 500 });
  }
}
