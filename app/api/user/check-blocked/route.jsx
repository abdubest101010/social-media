import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { blockerId, blockedId } = await req.json();

    // Ensure both blockerId and blockedId are provided
    if (!blockerId || !blockedId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user is blocked
    const blockRecord = await prisma.block.findFirst({
      where: {
        blockerId,
        blockedId,
      },
    });

    // Check if the blocker has been blocked by the blocked user
    const blockedByRecord = await prisma.block.findFirst({
      where: {
        blockerId: blockedId,
        blockedId: blockerId,
      },
    });

    // Respond with the block status
    return NextResponse.json({
      isBlocked: !!blockRecord,  // True if the blocker has blocked the blocked user
      blockedBy: !!blockedByRecord // True if the blocked user has blocked the blocker
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
