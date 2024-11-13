import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { senderId, receiverId } = await req.json();

    // Ensure senderId and receiverId are integers
    const parsedSenderId = parseInt(senderId, 10);
    const parsedReceiverId = parseInt(receiverId, 10);

    if (isNaN(parsedSenderId) || isNaN(parsedReceiverId)) {
      return new Response(JSON.stringify({ error: 'Invalid sender or receiver ID.' }), { status: 400 });
    }

    // Check if there's a pending friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parsedSenderId,   // Ensure senderId is passed as integer
        receiverId: parsedReceiverId,  // Ensure receiverId is passed as integer
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
