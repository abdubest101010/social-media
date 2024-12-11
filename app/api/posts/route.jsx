import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, content, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let imageUrlPath = null;

    // Upload the image to Cloudinary if present
    if (imageUrl) {
      const base64Image = imageUrl.split(';base64,').pop();
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
        folder: 'posts',
      });
      imageUrlPath = result.secure_url;
    }

    // Create a new post in the Prisma database
    const createPost = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrlPath,
        userId: id,
      },
    });

    return NextResponse.json(createPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
