import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { blockerId, blockedId } = await req.json();

    // Ensure both blockerId and blockedId are provided
    if (!blockerId || !blockedId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user is already blocked
    const alreadyBlocked = await prisma.block.findFirst({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (alreadyBlocked) {
      return NextResponse.json({ error: 'User is already blocked' }, { status: 400 });
    }

    // Create a block record
    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    return NextResponse.json({ message: 'User blocked successfully', block });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
