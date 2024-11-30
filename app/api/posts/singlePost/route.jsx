import prisma from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
      const { id } = await req.json();
  
      // Allow `id` to be a string and parse it safely
      console.log(id)
      const postId = parseInt(id, 10);
      if (!postId || isNaN(postId)) {
        return NextResponse.json(
          { message: 'Invalid or missing post id' },
          { status: 400 }
        );
      }
  
      const posts = await prisma.post.findMany({
        where: { id: postId },
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          userId: true,
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
  
  