import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// Function to save Base64 image
const saveBase64Image = (base64Data, filePath) => {
  const base64Image = base64Data.split(';base64,').pop();
  fs.writeFileSync(filePath, base64Image, { encoding: 'base64' }); // Save the image file
};

// POST handler
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, content, imageUrl } = body;

    // Validate ID and Content
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Handle image upload
    let imageUrlPath = null;
    if (imageUrl) {
      const fileName = `${Date.now()}-post-image.jpg`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

      saveBase64Image(imageUrl, filePath); // Save image
      imageUrlPath = `/uploads/${fileName}`; // Publicly accessible URL
    }

    // Create post in the database
    const createPost = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrlPath, // Save the image path
        userId: id, // Link post to user
      },
    });

    // Respond with the created post
    return NextResponse.json(createPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
