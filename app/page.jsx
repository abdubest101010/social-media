'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Post from '@/components/Post';
import FetchFriendRequest from '@/components/FetchFriendRequest';
import AllPosts from '@/components/AllPosts';
import Stories from '@/components/Stories';
import Friends from '@/components/Friends';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-full bg-gradient-to-r from-teal-400 via-blue-300 to-blue-500 p-8 rounded-lg shadow-lg">
        {/* Stories Section */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 overflow-hidden rounded-lg">
            <Stories />
          </div>
        </div>

        {/* Post and Friend Requests Section */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Centered Posts for larger screens */}
          <div className="col-span-12 md:col-span-8 mx-auto flex flex-col items-center gap-6">
            <Post />
            <AllPosts />
          </div>

          {/* Friend Requests and Friends Section */}
          <div className="col-span-12 md:col-span-4 hidden md:block">
            <div className="p-4 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
              <FetchFriendRequest />
            </div>
            <div className="p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Friends</h2>
              <Friends />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
