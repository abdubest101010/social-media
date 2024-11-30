'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { CheckIcon, XIcon } from '@heroicons/react/solid';

const FriendRequests = () => {
  const { data: session, status } = useSession();
  const [friendRequests, setFriendRequests] = useState([]);

  const fetchFriendRequests = useCallback(async () => {
    const userId = session?.user?.id;
    try {
      const res = await fetch(`/api/friend-request/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        setFriendRequests(data.friendRequests);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFriendRequests();
    }
  }, [status, fetchFriendRequests]);

  const handleAccept = async (requestId) => {
    await handleRequestAction(requestId, 'accept');
  };

  const handleReject = async (requestId) => {
    await handleRequestAction(requestId, 'reject');
  };

  const handleRequestAction = async (requestId, action) => {
    const endpoint = action === 'accept' ? '/api/friend-request/accept' : '/api/friend-request/reject';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        fetchFriendRequests(); // Refresh requests after action
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Please log in to view friend requests</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Friend Requests</h1>
      {friendRequests.length > 0 ? (
        <ul className="space-y-4">
          {friendRequests.map((request) => (
            <li key={request.id} className=" p-4 rounded-lg shadow-md flex justify-between items-center">
              <p className="text-gray-700 font-medium">Sender: {request.sender.username}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                  aria-label="Accept Friend Request"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  aria-label="Reject Friend Request"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No pending friend requests found.</p>
      )}
    </div>
  );
};

export default FriendRequests;
