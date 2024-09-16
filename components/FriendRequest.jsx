'use client';
import { useState, useEffect } from 'react';

export default function FriendRequestList({ userId }) {
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    // Fetch all friend requests where the current user is the receiver
    const fetchFriendRequests = async () => {
      const res = await fetch(`/api/friend-request/received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await res.json();
      if (data.friendRequests) {
        setFriendRequests(data.friendRequests);
      }
    };

    fetchFriendRequests();
  }, [userId]);

  const acceptRequest = async (requestId) => {
    const res = await fetch(`/api/friend-request/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json();
    if (data.success) {
      setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
    }
  };

  const rejectRequest = async (requestId) => {
    const res = await fetch(`/api/friend-request/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json();
    if (data.success) {
      setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Friend Requests</h3>
      <ul>
        {friendRequests.map((request) => (
          <li key={request.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <img
                src={request.sender.profilePicture}
                alt={request.sender.firstName}
                className="h-10 w-10 rounded-full mr-3"
              />
              <span>{request.sender.firstName} {request.sender.lastName}</span>
            </div>
            <div>
              <button
                onClick={() => acceptRequest(request.id)}
                className="bg-blue-500 text-white py-1 px-3 rounded-full hover:bg-blue-600 mr-2"
              >
                ✔️
              </button>
              <button
                onClick={() => rejectRequest(request.id)}
                className="bg-gray-300 py-1 px-3 rounded-full hover:bg-gray-400"
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
