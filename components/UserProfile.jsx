'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function UserProfile({ id }) {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null); // Holds the friend request and block status
  const userId = session?.user?.id?.toString(); // Ensure userId is a string for comparison

  // Fetch user info and check friend request status on component mount
  useEffect(() => {
    if (id) {
      fetchUserInfo(id);
      checkFriendRequestStatus(id); // Check if the user has already sent a request or is blocked
    }
  }, [id]);

  // Fetch the profile info for the user being viewed
  const fetchUserInfo = async (id) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to fetch user info');

      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a friend request was already sent or if the sender is blocked
  const checkFriendRequestStatus = async (receiverId) => {
    try {
      const res = await fetch('/api/friend-request/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId.toString(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        if (result.alreadyBlocked) {
          setFriendRequestStatus('blocked'); // If the sender is blocked
        } else if (result.alreadySent) {
          setFriendRequestStatus('sent'); // If a request was already sent
        } else {
          setFriendRequestStatus('not_sent'); // If no request was sent yet
        }
      }
    } catch (error) {
      console.error('Error checking friend request status:', error);
    }
  };

  // Send a friend request
  const sendFriendRequest = async (receiverId) => {
    try {
      const res = await fetch('/api/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId.toString(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setFriendRequestStatus('sent');
        alert('Friend request sent successfully.');
      } else {
        alert(result.error || 'Failed to send friend request.');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!userInfo) return <div>No user information available</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p><strong>Username:</strong> {userInfo.username}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>First Name:</strong> {userInfo.firstName}</p>
        <p><strong>Last Name:</strong> {userInfo.lastName}</p>
        <p><strong>Living In:</strong> {userInfo.livingIn}</p>
        <p><strong>Went To:</strong> {userInfo.wentTo}</p>
        <p><strong>Works At:</strong> {userInfo.worksAt}</p>
        <p><strong>Bio:</strong> {userInfo.bio}</p>

        {/* Hide the "Send Friend Request" button if the user is viewing their own profile */}
        {userId !== id.toString() && friendRequestStatus === 'not_sent' && (
          <button
            onClick={() => sendFriendRequest(id)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Send Friend Request
          </button>
        )}

        {/* If the friend request was already sent, show this message */}
        {friendRequestStatus === 'sent' && (
          <p className="text-green-500 mt-4">You have already sent a friend request to this user.</p>
        )}

        {/* If the logged-in user is blocked, show this message */}
        {friendRequestStatus === 'blocked' && (
          <p className="text-red-500 mt-4">You cannot send a friend request to this user because you are blocked.</p>
        )}

        {/* If the logged-in user is viewing their own profile, no button is shown */}
        {userId === id.toString() && (
          ""
        )}
      </div>
    </div>
  );
}
