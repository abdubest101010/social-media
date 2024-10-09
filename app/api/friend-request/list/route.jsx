// api/friend-request/list/route.js

import prisma from "@/lib/prisma"; // Import Prisma client

// POST method for fetching friend requests based on userId and dynamic filters
export async function POST(req) {
  try {
    // Get the userId from the request body
    const { userId, senderId, receiverId, status } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    // Building dynamic filters to fetch only incoming requests (where the user is the receiver)
    let filters = {
      receiverId: parseInt(userId), // Fetch requests where the logged-in user is the receiver
    };

    // Add additional filters dynamically based on provided query parameters
    if (senderId) filters.senderId = parseInt(senderId);
    if (receiverId) filters.receiverId = parseInt(receiverId); // This is redundant, as the receiverId is already userId
    if (status) filters.status = status;

    // Query the database for friend requests with sender and receiver details
    const friendRequests = await prisma.friendRequest.findMany({
      where: filters,
      include: {
        sender: true,  // Include sender details (like name)
        receiver: true, // Include receiver details (optional in case you want to display receiver info)
      },
    });

    // Return the friend requests along with sender details
    return new Response(
      JSON.stringify({ friendRequests }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch friend requests" }),
      { status: 500 }
    );
  }
}
