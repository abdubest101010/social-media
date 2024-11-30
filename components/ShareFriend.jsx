'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Import the Image component from next/image

export default function ShareFriend({ postId }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Fetch the user's friends
  useEffect(() => {
    if (session?.user?.id) { // Check if session.user.id is available before fetching
      const fetchFriends = async () => {
        try {
          const res = await fetch('/api/friends', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.user.id }), // Send userId in the body
          });
          if (res.ok) {
            const data = await res.json();
            setFriends(data);
          } else {
            console.error('Failed to fetch friends:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching friends:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchFriends();
    }
  }, [session?.user?.id]); // Add session.user.id as a dependency to the useEffect

  // Handle sharing post with selected friend
  const handleShare = async (friendId) => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: session.user.id,
          friendId,
        }),
      });

      if (res.ok) {
        alert('Post shared successfully!');
      } else {
        alert('Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('An error occurred while sharing the post');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="share-friend">
      <h3 className="text-lg font-semibold mb-2">Share with your friends</h3>
      <div>
        {friends.length > 0 ? (
          <div>
            <div className="space-y-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center bg-white p-4 rounded shadow">
                  <Image
                    src={friend.profilePicture || '/default-avatar.png'} // Use default image if no profilePicture
                    alt={friend.username}
                    width={48} // Set width for the image
                    height={48} // Set height for the image
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <span className="text-lg">{friend.username}</span>
                  <button
                    onClick={() => handleShare(friend.id)}
                    className="ml-auto bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No friends found</p>
        )}
      </div>
    </div>
  );
}
