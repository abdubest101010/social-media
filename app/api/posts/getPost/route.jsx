// app/api/posts/route.js
import prisma from '@/lib/prisma';



export async function GET(req) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // Include user information with each post
      },
    });

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
