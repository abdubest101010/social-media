import prisma from '@/lib/prisma';

// Named export for POST method to reject a friend request
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

    // Delete the friend request to reject it
    await prisma.friendRequest.delete({
      where: {
        id: friendRequest.id,
      },
    });

    return new Response(JSON.stringify({ success: true, message: 'Friend request rejected.' }), { status: 200 });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return new Response(JSON.stringify({ error: 'Failed to reject friend request.' }), { status: 500 });
  }
}
