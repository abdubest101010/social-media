import prisma from '@/lib/prisma';

// Named export for POST request
export async function POST(req) {
  try {
    const body = await req.json(); // Parse the JSON body
    const { id } = body; // Extract the user ID from the request body

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID is required.' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }, // Assuming ID is an integer
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        livingIn: true,
        wentTo: true,
        worksAt: true,
        bio: true,
        profilePicture: true,
        
        // Fetch associated data
        posts: true,
        comments: true,
        likes: true,
        shares: true,
        stories: true,
        sentRequests: true,
        receivedRequests: true,
        following: true,
        followers: true,
        blockedUsers: true,
        blockedBy: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
    }

    // Send back the user info in the response
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user data.' }), { status: 500 });
  }
}
