'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Post from "@/components/Post"
import AllPosts from "@/components/AllPosts"
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login page if there is no session
  if (status === 'loading') {
    return <p>Loading...</p>; // You can replace this with a spinner or a skeleton UI
  }

  if (!session) {
    router.push('/login');
    return null; // Prevent further rendering if redirecting
  }

  const email = session.user?.username || session.user?.name;
  const firstName = email.split(' ')[0]; 
  return (
    <>
      <main>Hello world <link href='/profile'>{firstName}</link></main>
     <Post/>
     <AllPosts/>
      <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Sign out
            </button>
      <Link href={'/register'}>Register</Link>
      <Link href={'/login'}>Login</Link>

    </>
  );
}
