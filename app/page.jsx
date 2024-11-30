'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import Post from '@/components/Post';
import FetchFriendRequest from '@/components/FetchFriendRequest';
import AllPosts from '@/components/AllPosts';
import Stories from '@/components/Stories';
import Friends from '@/components/Friends';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Memoized function to fetch user info
  const fetchUserInfo = useCallback(async () => {
    if (userId) {
      try {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const userData = await response.json();

        if (response.ok) {
          const {
            firstName,
            lastName,
            livingIn,
            wentTo,
            worksAt,
            bio,
            profilePicture,
          } = userData;

          // Check if any required fields are missing
          if (!firstName || !lastName || !livingIn || !wentTo || !worksAt || !bio || !profilePicture) {
            // Redirect to profile setup if any field is empty
            router.push('/profile');
          }
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }, [userId, router]);

  // Trigger user info fetch on `userId` change
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

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
