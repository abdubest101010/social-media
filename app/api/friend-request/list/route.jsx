import prisma from "@/lib/prisma";

// POST method for fetching friend requests based on userId and filters
export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }

    // Fetch only pending friend requests where the user is the receiver
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: parseInt(userId), 
        status: 'pending', // Only get pending requests
      },
      include: {
        sender: true, // Include sender details
      },
    });

    return new Response(JSON.stringify({ friendRequests }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch friend requests" }), { status: 500 });
  }
}
