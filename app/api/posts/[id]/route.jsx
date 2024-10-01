import prisma  from '@/lib/prisma'; // Adjust this import according to your Prisma setup

export async function GET(req, { params }) {
  try {
    const postId = parseInt(params.id);

    // Fetch the post with the likeCount
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likeCount: true,
      },
    });

    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ likeCount: post.likeCount }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Unable to fetch like count" }), { status: 500 });
  }
}
