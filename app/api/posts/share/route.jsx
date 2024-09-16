import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST method to share a post
export async function POST(req) {
  try {
    const { postId, userId } = await req.json();

    // Create a new share entry
    const share = await prisma.share.create({
      data: {
        postId: Number(postId),
        userId: Number(userId),
      },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: 'Failed to share post' }, { status: 500 });
  }
}
