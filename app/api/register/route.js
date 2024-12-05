import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ message: 'Password must be at least 6 characters long' }), { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'User with this username or email already exists' }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(32).toString('hex');

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, verificationCode },
    });
    console.log("Verification code stored in database:", newUser.verificationCode);
    

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?code=${verificationCode}`;
console.log("Generated verification URL:", verificationUrl);


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Hello ${username},\n\nPlease verify your email by clicking the link below:\n${verificationUrl}\n\nThank you!`,
    });

    return new Response(
      JSON.stringify({ message: 'Registration successful! Please verify your email.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
