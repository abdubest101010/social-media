// app/api/likes/route.jsx
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
    });

    return NextResponse.json(like, { status: 201 });
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
