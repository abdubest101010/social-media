import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// Function to save Base64 image to a file
const saveBase64Image = (base64Data, filePath) => {
  const base64Image = base64Data.split(';base64,').pop(); // Extract Base64 content
  fs.writeFileSync(filePath, base64Image, { encoding: 'base64' }); // Save as file
};

// POST method to handle post creation
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, content, imageUrl } = body;

    // Validate user ID
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Save the image (if provided)
    let imageUrlPath = null;
    if (imageUrl) {
      const fileName = `${Date.now()}-post-image.jpg`; // Unique file name
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName); // Full path
      saveBase64Image(imageUrl, filePath); // Save image to file
      imageUrlPath = `/uploads/${fileName}`; // Relative URL to store in DB
    }

    // Create the post in the database
    const createPost = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrlPath,
        userId: id, // Associate the post with the user
      },
    });

    return NextResponse.json(createPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
