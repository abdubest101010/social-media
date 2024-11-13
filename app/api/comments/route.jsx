import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = Number(searchParams.get('postId'));

  if (!postId) {
    return new Response(JSON.stringify({ error: 'Post ID is required' }), {
      status: 400,
    });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { select: { username: true } }, // Fetch username of the commenter
      },
      orderBy: { createdAt: 'asc' }, // Optional: order comments by creation time
    });
    
    return new Response(JSON.stringify(comments), { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  const { content, postId, userId } = await request.json();

  if (!content || !postId || !userId) {
    return new Response(JSON.stringify({ error: 'Content, post ID, and user ID are required' }), {
      status: 400,
    });
  }

  try {
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true, // Include username in the response
          },
        },
      },
    });

    // Create a notification for the post owner
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post) {
      await prisma.notification.create({
        data: {
          userId: post.userId, // The post owner's user ID
          senderId: userId,    // The user who commented
          postId: postId,      // The post related to the notification
          content: `${comment.user.username} commented on your post.`,
        },
      });
    }

    return new Response(JSON.stringify(comment), { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
      status: 500,
    });
  }
}
