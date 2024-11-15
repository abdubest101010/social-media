import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // Post owner
        likes: {
          include: {
            user: true, // Liker's user data
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                username: true, // Commenter's username
              },
            },
          },
        },
        shares: {
          include: {
            user: {
              select: {
                username: true, // Sharer's username
              },
            },
          },
        },
      },
    });
    const postsWithShareCount = posts.map((post) => ({
      ...post,
      shareCount: post.shares.length,
    }));
    return new Response(JSON.stringify(postsWithShareCount), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
