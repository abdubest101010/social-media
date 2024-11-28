import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
    }

    // Generate a token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Save token in the database
    await prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt },
    });

    // Construct reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use another email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send plain-text email
    const emailMessage = `
    To reset your password, click the following link: ${resetUrl}.
    This link is valid for 1 hour.
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: emailMessage, // Plain text format
    });

    console.log('Email sent:', info);
    return new Response(JSON.stringify({ message: 'Password reset email sent.' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An internal error occurred.' }), { status: 500 });
  }
}
