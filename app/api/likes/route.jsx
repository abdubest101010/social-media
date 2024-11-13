import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { postId, userId } = await req.json();

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Post already liked' }, { status: 400 });
    }

    // Add a new like
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
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
          senderId: userId,     // The user who liked the post
          postId: postId,       // The post related to the notification
          content: `${like.user.username} liked your post.`,
        },
      });
    }

    return NextResponse.json(
      { id: like.id, postId: like.postId, userId: like.userId, username: like.user.username },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { postId, userId } = await req.json();

    // Remove the like
    const like = await prisma.like.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    if (like.count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Like removed' }, { status: 200 });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { postId } = req.query;

    // Fetch likes with usernames for the specified post
    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const likeData = likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      username: like.user.username,
    }));

    return NextResponse.json(likeData, { status: 200 });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}
