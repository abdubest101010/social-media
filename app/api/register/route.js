import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Helper function to validate email existence (with updated logic)
async function isEmailValid(email) {
  const apiKey = process.env.MAILBOXLAYER_API_KEY; // Fetch API key from .env file

  if (!apiKey) {
    throw new Error('Missing MailboxLayer API key in environment variables');
  }

  try {
    const response = await fetch(`http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from MailboxLayer API:', errorText);
      throw new Error('Failed to validate email');
    }

    const data = await response.json();  // Attempt to parse the JSON response
    console.log('Email Validation Data:', data); // Log the response for debugging

    // Proceed with registration if the email format is valid (ignore smtp_check)
    return data.format_valid; // Only check format_valid, ignoring smtp_check
  } catch (error) {
    console.error('Error during email validation:', error);
    throw new Error('Error validating email');
  }
}

export async function PUT(req) {
  const { username, email, password } = await req.json();

  // Check if all required fields are provided
  if (!username || !email || !password) {
    return new Response(
      JSON.stringify({ message: 'All fields are required' }),
      { status: 400 }
    );
  }

  // Validate password length
  if (password.length < 6) {
    return new Response(
      JSON.stringify({ message: 'Password must be at least 6 characters long' }),
      { status: 400 }
    );
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ message: 'Invalid email format' }),
      { status: 400 }
    );
  }

  // Validate if email exists using the MailboxLayer API (only checking format_valid)
  try {
    const emailExists = await isEmailValid(email);
    if (!emailExists) {
      return new Response(
        JSON.stringify({ message: 'Non-existent or invalid email address' }),
        { status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error validating email', details: error.message }),
      { status: 500 }
    );
  }

  // Check if the username or email already exists in the database
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'User with this username or email already exists' }),
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Send a welcome email
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use another email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const welcomeMessage = `Welcome to our platform, ${username}! We're excited to have you on board.`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to our Platform!',
      text: welcomeMessage,
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
