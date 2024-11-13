import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { userId, friendId } = await req.json();

    // Ensure both userId and friendId are integers
    const parsedUserId = parseInt(userId, 10);
    const parsedFriendId = parseInt(friendId, 10);

    if (isNaN(parsedUserId) || isNaN(parsedFriendId)) {
      return new Response(JSON.stringify({ error: 'Invalid user or friend ID.' }), { status: 400 });
    }

    // Check if they are friends
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            user1Id: parsedUserId,
            user2Id: parsedFriendId,
          },
          {
            user1Id: parsedFriendId,
            user2Id: parsedUserId,
          },
        ],
      },
    });

    return new Response(JSON.stringify({ isFriend: !!friendship }), { status: 200 });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check friendship status' }), { status: 500 });
  }
}
