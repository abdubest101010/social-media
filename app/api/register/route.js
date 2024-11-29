import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

async function isEmailValid(email) {
  const apiKey = process.env.MAILBOXLAYER_API_KEY;
  if (!apiKey) throw new Error('MailboxLayer API key is missing');

  try {
    const response = await fetch(`http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=0&format=1`);
    if (!response.ok) throw new Error('Failed to validate email via MailboxLayer API');

    const data = await response.json();

    if (!data.format_valid) {
      return { isValid: false, reason: 'Invalid email format' };
    }
    if (!data.mx_found) {
      return { isValid: false, reason: 'No mail exchange records found' };
    }

    return { isValid: true };
  } catch (error) {
    throw new Error(`Email validation failed: ${error.message}`);
  }
}

export async function PUT(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ message: 'All fields are required' }),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ message: 'Password must be at least 6 characters long' }),
        { status: 400 }
      );
    }

    const emailValidation = await isEmailValid(email);
    if (!emailValidation.isValid) {
      return new Response(
        JSON.stringify({ message: emailValidation.reason }),
        { status: 400 }
      );
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
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to our Platform!',
      text: `Welcome to our platform, ${username}! We're excited to have you on board.`,
    });

    return new Response(
      JSON.stringify({ message: 'User successfully registered', user: newUser }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
