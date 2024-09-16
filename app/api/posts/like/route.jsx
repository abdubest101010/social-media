import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST method to like a post
export async function POST(req) {
  try {
    const { postId, userId } = await req.json();

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: Number(postId),
        userId: Number(userId),
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Post already liked' }, { status: 400 });
    }

    // Create a new like
    const like = await prisma.like.create({
      data: {
        postId: Number(postId),
        userId: Number(userId),
      },
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
