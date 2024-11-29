import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    // Parse the request body to get the logged-in user ID
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }

    // Fetch the last message in each conversation involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
      },
      orderBy: { createdAt: "desc" }, // Order messages by latest
      distinct: ['senderId', 'receiverId'], // Get unique conversations
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Format the messages for the response
    const conversations = messages.map((message) => {
      // Determine whether the logged-in user is the sender or receiver
      const isSender = message.sender.id === userId;
      const otherUser = isSender ? message.receiver : message.sender;

      return {
        userId: otherUser.id,
        username: otherUser.username,
        lastMessage: message.content,
        createdAt: message.createdAt,
      };
    });

    return new Response(JSON.stringify(conversations), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}
