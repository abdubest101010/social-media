import prisma from '@/lib/prisma'; // Prisma Client

export async function POST(req) {
  try {
    const { requestId } = await req.json();

    const friendRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true, friendRequest });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return NextResponse.json({ error: 'Failed to reject friend request.' }, { status: 500 });
  }
}
