import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/sessionProvider"
import Navbar from "@/components/Navbar"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "social media",
  description: "interact with each other",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar/>
        {children}
        </SessionProvider>
        </body>
    </html>
  );
}
