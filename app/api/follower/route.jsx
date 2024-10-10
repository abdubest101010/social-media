import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have Prisma setup

export async function POST(req) {
  try {
    const { userId } = await req.json(); // Fetch userId from the body of the request

    console.log("Received userId:", userId); // Log received userId

    if (!userId) {
      console.error("No userId provided"); // Log if no userId is passed
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    // Fetch followers and following for the given userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          select: {
            id: true,
            follower: {
              select: {
                username: true // Include username in the follower object
              }
            }
          }
        },
        following: {
          select: {
            id: true,
            following: {
              select: {
                username: true // Include username in the following object
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.error("User not found with id:", userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Now you can use user.followers and user.following correctly
    const followers = user.followers;
    const following = user.following;

    console.log("Followers:", followers);
    console.log("Following:", following);

    return NextResponse.json({ followers, following });
  } catch (error) {
    console.error('Error fetching followers/following:', error);
    return NextResponse.json({ error: 'Error fetching followers/following' }, { status: 500 });
  }
}
