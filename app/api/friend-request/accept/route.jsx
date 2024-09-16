import prisma from '@/lib/prisma'; // Prisma Client

export async function POST(req) {
  try {
    const { requestId } = await req.json();

    const friendRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    return NextResponse.json({ success: true, friendRequest });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json({ error: 'Failed to accept friend request.' }, { status: 500 });
  }
}
