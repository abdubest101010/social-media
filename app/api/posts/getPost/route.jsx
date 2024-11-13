// app/api/posts/getPost/route.js
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    

    return new Response(JSON.stringify(posts), {
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
