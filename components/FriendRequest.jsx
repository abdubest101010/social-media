"use client"
import { useEffect, useState } from 'react';
import FriendRequestActions from './FriendRequestActions';

function FetchFriendRequest() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/friend-request');
        if (!response.ok) {
          throw new Error('Failed to fetch friend requests');
        }
        const data = await response.json();
        setFriendRequests(data.requests || []);
      } catch (err) {
        console.error('Error fetching friend requests:', err);
        setError(err.message || 'An error occurred while fetching friend requests.');
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  if (loading) {
    return <p>Loading friend requests...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (friendRequests.length === 0) {
    return <p>No friend requests found.</p>;
  }

  return (
    <div>
      {friendRequests.map((request) => (
        <FriendRequestActions
          key={request.id}
          senderId={request.senderId}
          receiverId={request.receiverId}
          requestId={request.id}
        />
      ))}
    </div>
  );
}

export default FetchFriendRequest;
