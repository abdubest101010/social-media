'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Post from "@/components/Post";
import UserProfile from "@/components/UserProfile";
import FetchFriendRequest from "@/components/FetchFriendRequest";
import AllPosts from "@/components/AllPosts";
import Stories from "@/components/Stories";
import Friends from "@/components/Friends";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const id = session?.user?.id;

  // Fetch user info if authenticated
  useEffect(() => {
    if (id) {
      fetchUserInfo(id);
    }
  }, [id]);

  const fetchUserInfo = async (userId) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (!res.ok) throw new Error('Failed to fetch user info');

      const data = await res.json();
      setUserInfo(data);

      // Check if user needs to complete profile
      if (!data.firstName || !data.lastName) {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Optionally, redirect to an error page or show a notification
    }
  };

  const toggleInfoVisibility = () => {
    setIsInfoVisible((prev) => !prev);
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return router.push('/login');
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto">
        <Stories />
        {/* Main Content */}
        <div className="flex justify-between">
          {/* User Profile Section on the Left */}
          <div className="w-1/4 bg-gray-100 p-4">
            <div className="flex items-center space-x-4 mb-4">
              {userInfo && (
                <img
                  src={userInfo.profilePicture || '/default-avatar.png'}
                  alt="User Image"
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={toggleInfoVisibility}
                />
              )}
              <h2 className="text-lg font-semibold">{userInfo?.firstName}'s Profile</h2>
            </div>
            {userInfo && isInfoVisible && (
              <div className="mb-6">
                <p><strong>Username:</strong> {userInfo.username}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>First Name:</strong> {userInfo.firstName}</p>
                <p><strong>Last Name:</strong> {userInfo.lastName}</p>
                <p><strong>Living In:</strong> {userInfo.livingIn}</p>
                <p><strong>Went To:</strong> {userInfo.wentTo}</p>
                <p><strong>Works At:</strong> {userInfo.worksAt}</p>
                <p><strong>Bio:</strong> {userInfo.bio}</p>
              </div>
            )}
          </div>

          {/* Post Section in the Center */}
          <div className="w-1/2 bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-6">Hello, {userInfo?.firstName}</h1>
            <Post />
            <AllPosts />
          </div>

          {/* Friend Request Section on the Right */}
          <div className="w-1/4 bg-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
            <FetchFriendRequest />
            <Friends />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
