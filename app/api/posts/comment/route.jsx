import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST method to comment on a post
export async function POST(req) {
  try {
    const { postId, userId, content } = await req.json();

    if (!content || !postId || !userId) {
      return NextResponse.json({ error: 'Post ID, User ID, and content are required' }, { status: 400 });
    }

    // Create a new comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: Number(postId),
        userId: Number(userId),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
