import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    // Parse the request body to get `userId`
    const { userId } = await req.json();

    // Ensure `userId` is a valid integer
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Fetch the user with the specified ID
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        livingIn: true,
        wentTo: true,
        worksAt: true,
        bio: true,
        profilePicture: true,
        posts: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            userId: true,
            likeCount: true,
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
              },
            },
            shares: true,
            _count: {
              select: { comments: true },
            },
          },
        },
        stories: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            imageUrl: true,
          },
        },
        sentRequests: true,
        receivedRequests: true,
        following: true,
        followers: true,
        blockedUsers: true,
        blockedBy: true,
        _count: {
          select: {
            following: true,
            followers: true,
          },
        },
      },
    });

    // Check if the user exists
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
