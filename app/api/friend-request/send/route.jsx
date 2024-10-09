import prisma from '@/lib/prisma';

export async function POST(req) {
  const { senderId, receiverId } = await req.json();

  try {
    // Prevent sending request to self
    if (senderId === receiverId) {
      return new Response(JSON.stringify({ error: 'You cannot send a friend request to yourself.' }), { status: 400 });
    }

    // Check if a pending friend request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        status: 'pending',  // Only check pending requests
      },
    });

    if (existingRequest) {
      return new Response(JSON.stringify({ error: 'Friend request already sent.' }), { status: 400 });
    }

    // Create the new friend request
    const newFriendRequest = await prisma.friendRequest.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        status: 'pending',
      },
    });

    return new Response(JSON.stringify(newFriendRequest), { status: 200 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return new Response(JSON.stringify({ error: 'Failed to send friend request.' }), { status: 500 });
  }
}
