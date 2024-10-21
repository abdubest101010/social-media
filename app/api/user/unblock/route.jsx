import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { blockedId } = await req.json();

    // Ensure blockedId is provided
    if (!blockedId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user is already blocked
    const blockRecord = await prisma.block.findFirst({
      where: {
        blockedId,
      },
    });

    if (!blockRecord) {
      return NextResponse.json({ error: 'User is not blocked' }, { status: 400 });
    }

    // Delete the block record
    await prisma.block.delete({
      where: {
        id: blockRecord.id,
      },
    });

    return NextResponse.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
