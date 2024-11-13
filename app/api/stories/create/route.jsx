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

// POST method to handle story creation with Base64 image
export async function POST(req) {
  try {
    const body = await req.json(); // Parse the incoming request body
    const { userId, content, imageUrl } = body;

    // Validate user ID presence
    if (!userId) {
      console.error('User ID is missing in the request.');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Handle image saving if present
    let imageUrlPath = null;
    if (imageUrl) {
      const fileName = `${Date.now()}-story-image.jpg`; // Unique file name
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      saveBase64Image(imageUrl, filePath); // Save the Base64 image
      imageUrlPath = `/uploads/${fileName}`;
    }

    // Set expiration time (e.g., 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Adjust this as per your requirement

    // Create a new story in the Prisma database
    const createStory = await prisma.story.create({
      data: {
        content,
        imageUrl: imageUrlPath, // Save image URL to the database
        userId: userId, // Assuming this is the user ID
        expiresAt: expiresAt, // Set expiration date
      },
    });

    console.log('Create story details:', createStory);
    return NextResponse.json(createStory, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
