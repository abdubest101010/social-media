'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Post from "@/components/Post";
import UserProfile from "@/components/UserProfile"
import FetchFriendRequest from "@/components/fetchFriendRequest"
export default function Home() {
  const { data: session, status } = useSession(); // Hook for session
  const router = useRouter(); // Hook for router
  const [userInfo, setUserInfo] = useState(null); // Hook for user info
  const [isInfoVisible, setIsInfoVisible] = useState(false); // Hook to toggle visibility

  // Check if user is logged in and handle redirects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [status, router]);

  // Extract user details once session is available
 const id = session?.user?.id
console.log(session)
  // Fetch user info once the id is available (useEffect is always called)
  useEffect(() => {
    if (id) {
      fetchUserInfo(id);
    }
  }, [id]); // Only runs when `id` is defined

  const fetchUserInfo = async (userId) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });

      if (!res.ok) throw new Error('Failed to fetch user info');

      const data = await res.json();
      console.log(data)
      setUserInfo(data); // Set user info into state
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const toggleInfoVisibility = () => {
    setIsInfoVisible((prev) => !prev); // Toggle visibility of user info
  };

  // Show loading state until session is determined
  if (status === 'loading') {
    return <p>Loading...</p>; // Show a loading spinner or message
  }

  // Ensure session is present before rendering UI
  if (!session) {
    return null; // Prevent rendering if session is not present
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        
        {/* Navigation Links at the Top */}
        <nav className="flex justify-between mb-6">
          <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
          <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
          <Link href="/posts" className="text-blue-500 hover:underline">Posts</Link>
          <Link href="/request" className="text-blue-500 hover:underline">Request</Link>
        </nav>

        {/* Header with username and avatar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hello, {userInfo?.firstName}</h1>
          {userInfo && (
            <img
              src={userInfo.profilePicture || '/default-avatar.png'} // Fallback to default image if no profile picture
              alt="User Image"
              className="w-16 h-16 rounded-full cursor-pointer"
              onClick={toggleInfoVisibility} // Toggle visibility on click
            />
          )}
        </div>

        {/* User Info (conditionally visible) */}
        {userInfo && isInfoVisible && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
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

        {/* Post Section */}
        <div className="mb-6">
          <Post />
          <UserProfile id={id}/>
          <FetchFriendRequest/>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-end mb-6">
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
