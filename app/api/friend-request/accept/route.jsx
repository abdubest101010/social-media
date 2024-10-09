import prisma from '@/lib/prisma';

// Named export for POST method to accept a friend request
export async function POST(req) {
  const { senderId, receiverId } = await req.json();

  try {
    // Find the friend request
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        status: 'pending',
      },
    });

    if (!friendRequest) {
      return new Response(JSON.stringify({ error: 'No pending request found.' }), { status: 404 });
    }

    // Update the request to accepted
    const updatedRequest = await prisma.friendRequest.update({
      where: {
        id: friendRequest.id,
      },
      data: {
        status: 'accepted',
      },
    });

    return new Response(JSON.stringify({ success: true, updatedRequest }), { status: 200 });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return new Response(JSON.stringify({ error: 'Failed to accept friend request.' }), { status: 500 });
  }
}
