// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authoption'; // Adjust the path as necessary

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // Export handler for both GET and POST methods
