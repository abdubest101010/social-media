// /app/api/notifications/[id]/read/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mark notification as read
export async function POST(req, { params }) {
  const { id } = params;

  try {
    // Update the notification's read status to true
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
