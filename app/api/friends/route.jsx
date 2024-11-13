// src/app/api/friends/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path according to your project structure

export async function POST(req) {
  const { userId } = await req.json(); // Get userId from the request body

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    // Extract friend details
    const friendList = friends.map(friend => {
      const friendUser = friend.user1Id === userId ? friend.user2 : friend.user1;
      return {
        id: friendUser.id,
        username: friendUser.username,
        firstName: friendUser.firstName,
        lastName: friendUser.lastName,
        profilePicture: friendUser.profilePicture,
      };
    });

    return NextResponse.json(friendList);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
