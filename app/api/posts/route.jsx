// app/api/posts/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// Function to save Base64 image to a file
const saveBase64Image = (base64Data, filePath) => {
  const base64Image = base64Data.split(';base64,').pop();
  fs.writeFile(filePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {
      console.error('Error saving the image:', err);
    } else {
      console.log('Image saved successfully');
    }
  });
};

// POST method to handle post creation with Base64 image
export async function POST(req) {
  try {
    const body = await req.json(); // Parse the incoming request body
    const { id, content, imageUrl } = body;

    // Validate ID presence
    if (!id) {
      console.error('ID is missing in the request.');
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Handle image saving if present
    let imageUrlPath = null;
    if (imageUrl) {
      const fileName = `${Date.now()}-post-image.jpg`; // Unique file name
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      saveBase64Image(imageUrl, filePath); // Save the Base64 image
      imageUrlPath = `/uploads/${fileName}`;
    }

    // Create a new post in the Prisma database
    const createPost = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrlPath, // Save image URL to the database
        userId: id, // Assuming this is the user ID
      },
    });

    console.log('Create post details:', createPost);
    return NextResponse.json(createPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}