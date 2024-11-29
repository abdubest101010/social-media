import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Handle GET request: Fetch all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        userId: true,
        likeCount: true,
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        shares: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Handle POST request: Fetch posts for a specific user
export async function POST(req) {
  try {
    const { effectiveUserId } = await req.json();

    // Ensure `userId` is provided and valid
    if (!effectiveUserId || isNaN(parseInt(effectiveUserId, 10))) {
      return NextResponse.json({ message: 'Invalid or missing userId' }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: parseInt(effectiveUserId, 10) },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        userId: true,
        likeCount: true,
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        shares: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
