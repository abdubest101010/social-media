import prisma  from '@/lib/prisma';
import { hash } from 'bcrypt';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    // Validate input
    if (!token || !newPassword) {
      return new Response(JSON.stringify({ error: 'Invalid input.' }), { status: 400 });
    }

    // Find the reset record by token (assuming token is unique)
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token.' }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Delete the reset record
    await prisma.passwordReset.delete({ where: { token } });

    return new Response(JSON.stringify({ message: 'Password updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred.' }), { status: 500 });
  }
}
