import prisma from '@/lib/prisma'; // Prisma Client

export async function POST(req) {
  try {
    const { receiverId } = await req.json();

    const friendRequests = await prisma.friendRequest.findMany({
      where: { receiverId, status: 'pending' },
      include: { sender: true }, // Include sender details
    });

    return NextResponse.json({ friendRequests });
  } catch (error) {
    console.error('Error fetching received friend requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests.' }, { status: 500 });
  }
}
