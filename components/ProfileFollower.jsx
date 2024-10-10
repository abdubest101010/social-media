'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const ProfileFollower = () => {
  const { data: session, status } = useSession(); // Get session data
  const [followersData, setFollowersData] = useState({ followers: [], following: [] });
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id; // Get logged-in userId

  useEffect(() => {
    if (userId) {
      fetchFollowersData();
    }
  }, [userId]);

  const fetchFollowersData = async () => {
    console.log("Sending userId to the API:", userId); // Log the userId being sent to the API
  
    try {
      const res = await fetch('/api/follower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // Send userId in the request body
      });
  
      console.log("API response status:", res.status); // Log the API response status
  
      if (!res.ok) {
        throw new Error('Failed to fetch followers/following');
      }
  
      const data = await res.json();
      console.log("Received data:", data); // Log the received data
  
      // Correctly map the response data to the state
      setFollowersData({
        followers: data.followers.map((f) => ({ id: f.id, username: f.follower.username })),
        following: data.following.map((f) => ({ id: f.id, username: f.following.username }))
      });
    } catch (error) {
      console.error('Error fetching followers/following:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold">Followers & Following</h2>
      <div className="mb-4">
        <h3 className="font-bold">Followers</h3>
        <ul>
          {followersData.followers.length > 0 ? (
            followersData.followers.map((follower) => (
              <li key={follower.id}>{follower.username}</li>
            ))
          ) : (
            <p>No followers found.</p>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Following</h3>
        <ul>
          {followersData.following.length > 0 ? (
            followersData.following.map((followedUser) => (
              <li key={followedUser.id}>{followedUser.username}</li>
            ))
          ) : (
            <p>No following found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProfileFollower;
