import prisma from '@/lib/prisma';

export async function POST(req) {
  const { senderId, receiverId } = await req.json();

  try {
    // Prevent sending request to self
    if (senderId === receiverId) {
      return new Response(JSON.stringify({ error: 'You cannot send a friend request to yourself.' }), { status: 400 });
    }

    // Check if a pending friend request exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        status: 'pending',  // Only check pending requests
      },
    });

    if (existingRequest) {
      return new Response(JSON.stringify({ alreadySent: true }), { status: 200 });
    }

    // No pending request, return false
    return new Response(JSON.stringify({ alreadySent: false }), { status: 200 });
  } catch (error) {
    console.error('Error checking friend request status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check friend request status' }), { status: 500 });
  }
}
