'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProfileFollower from "@/components/ProfileFollower"
const FriendRequests = () => {
  const { data: session, status } = useSession(); // Get session data
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic filter states
  const [senderId, setSenderId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const userId = session?.user?.id; // Get logged-in userId

  useEffect(() => {
    if (status === "authenticated") {
      fetchFriendRequests();
    }
  }, [status, senderId, statusFilter]); // Trigger fetching when status or filters change

  // Fetch friend requests based on dynamic filters
  const fetchFriendRequests = async () => {
    try {
      let queryParams = [];

      if (senderId) queryParams.push(`senderId=${senderId}`);
      if (statusFilter) queryParams.push(`status=${statusFilter}`);

      // Construct the query string dynamically
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

      const res = await fetch(`/api/friend-request/list${queryString}`, {
        method: "POST", // Use POST here as we're sending data
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }), // Pass the user ID from the session
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friend requests");
      }

      const data = await res.json();
      setFriendRequests(data.friendRequests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Accept Friend Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch('/api/friend-request/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Success:', data.message);
        fetchFriendRequests(); // Re-fetch friend requests after acceptance
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  // Handle Reject Friend Request
  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch('/api/friend-request/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Success:', data.message);
        fetchFriendRequests(); // Re-fetch friend requests after rejection
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  // Show loading or unauthenticated message
  if (status === "loading") return <div>Loading session...</div>;
  if (status === "unauthenticated") return <div>Please log in to view friend requests</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Incoming Friend Requests</h1>

      {/* Filter Inputs */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Sender ID"
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          className="p-2 border"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border ml-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {friendRequests.length > 0 ? (
            <ul>
              {friendRequests.map((request) => (
                <li key={request.id} className="border p-4 mb-4">
                  <p><strong>Sender:</strong> {request.sender.username}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                  {request.status === 'pending' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 text-white p-2 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500 text-white p-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No incoming friend requests found.</p>
          )}
        </div>
      )}
      <ProfileFollower />
    </div>
  );
};

export default FriendRequests;
