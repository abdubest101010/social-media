import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      userId,
      firstName,
      lastName,
      livingIn,
      wentTo,
      worksAt,
      bio,
      profilePicture,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let profilePictureUrl = null;

    // Upload the profile picture to Cloudinary if present
    if (profilePicture) {
      const base64Image = profilePicture.split(';base64,').pop();
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
        folder: 'profiles',
      });
      profilePictureUrl = result.secure_url;
    }

    // Update the user in the Prisma database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        livingIn,
        wentTo,
        worksAt,
        bio,
        profilePicture: profilePictureUrl,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
