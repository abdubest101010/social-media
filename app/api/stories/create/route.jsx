import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary'; // Cloudinary utility for image upload
import prisma from '@/lib/prisma'; // Prisma client for database interaction

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the incoming JSON body
    const { id, content, imageUrl } = body; // Destructure the fields

    // Validate that the ID is provided
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let imageUrlPath = null; // Variable to store Cloudinary URL

    // If imageUrl is provided, upload to Cloudinary
    if (imageUrl) {
      const base64Image = imageUrl.split(';base64,').pop(); // Extract base64 string from image URL
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
        folder: 'stories', // Save uploaded images in 'stories' folder
      });
      imageUrlPath = result.secure_url; // Store the secure URL of the uploaded image
    }

    // Set expiration time for the story (24 hours in this case)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Set expiration to 24 hours from now

    // Create a new story record in the Prisma database
    const createStory = await prisma.story.create({
      data: {
        content, // Story content
        imageUrl: imageUrlPath, // Cloudinary URL for image
        userId: id, // The user ID associated with the story
        expiresAt, // Set the expiration time
      },
    });

    // Return the created story details with a 201 status
    return NextResponse.json(createStory, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
