import prisma from '@/lib/prisma';

export async function POST(req) {
  const { senderId, receiverId } = await req.json();

  try {
    // Check if the sender is blocked by the receiver
    // This part is missing, implement the block check if needed

    // Check if there's a pending friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parseInt(senderId), // Ensure senderId is an integer
        receiverId: parseInt(receiverId), // Ensure receiverId is an integer
        status: 'pending',
      },
    });

    if (existingRequest) {
      return new Response(JSON.stringify({ alreadySent: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ alreadySent: false }), { status: 200 });
  } catch (error) {
    console.error('Error checking friend request status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check friend request status' }), { status: 500 });
  }
}
