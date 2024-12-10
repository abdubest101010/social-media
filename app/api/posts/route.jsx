import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma'; // Import Prisma client

// Function to save Base64 image to a file
const saveBase64Image = (base64Data, filePath) => {
  const base64Image = base64Data.split(';base64,').pop();
  fs.writeFileSync(filePath, base64Image, { encoding: 'base64' }); // Sync for simplicity here
};

// POST method to handle post creation with Base64 image
export async function POST(req) {
  try {
    // Destructure the incoming request body
    const { id, content, imageUrl } = await req.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Handle image upload (if provided)
    let imageUrlPath = null;
    if (imageUrl) {
      const fileName = `${Date.now()}-post-image.jpg`; // Unique file name using timestamp
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName); // Save in the `public/uploads` directory
      saveBase64Image(imageUrl, filePath); // Save the Base64 image to the file system
      imageUrlPath = `/uploads/${fileName}`; // Public URL of the image
    }

    // Create the post in the Prisma database
    const createPost = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrlPath, // Save the image path in the database
        userId: id, // Associate the post with the user
      },
    });

    // Return the created post response
    return NextResponse.json(createPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
