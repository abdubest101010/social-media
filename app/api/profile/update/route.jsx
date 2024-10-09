import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
 // Import Prisma client

 // Initialize Prisma

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

// POST method to handle profile update with Base64 image
export async function PUT(req, res) {
  try {
    const { id, firstName, lastName, livingIn, wentTo, worksAt, bio, profilePicture } = await req.json();

    // Validate ID presence
    if (!id) {
      console.error('ID is missing in the request.');
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Handle profile picture saving if present
    let profilePictureUrl = null;
    if (profilePicture) {
      const fileName = `${id}-profile-picture.jpg`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      saveBase64Image(profilePicture, filePath); // Save the Base64 image
      profilePictureUrl = `/uploads/${fileName}`;
    }

    // Update the user in the Prisma database
    const updatedUser = await prisma.user.update({
      where: { id }, // The ID of the user to update
      data: {
        firstName,
        lastName,
        livingIn,
        wentTo,
        worksAt,
        bio,
        profilePicture: profilePictureUrl, // Save profile picture URL to the database
      },
    });

    console.log('Updated user details:', updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
