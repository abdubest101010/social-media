import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Check if the user already exists
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        // If the user does not exist, create a new one
        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.name, // or any logic to generate username
              email: profile.email,
              password: null, // No password for Google users
              accounts: {
                create: {
                  provider: "google",
                  providerAccountId: profile.sub,
                  type: "oauth",
                },
              },
            },
          });
        }

        // Return user object with database ID for consistency
        return {
          id: user.id, // Use database ID here
          email: user.email,
          name: user.username,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        // Check if the user is a Google user
        if (!user.password) {
          throw new Error(
            "This email is linked with a Google account. Please log in with Google."
          );
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        // Return user object on success
        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Set the session user ID to the database ID
      session.user.id = token.id;
      session.user.username = token.username;
      return session;
    },
  },
};

export default NextAuth(authOptions);
